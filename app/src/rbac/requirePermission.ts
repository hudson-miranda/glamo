import type { User } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import { 
  legacyPermissionToBitflag, 
  hasPermission,
  PERMISSION_GROUPS
} from './permissions';

export interface ContextUser {
  id: string;
  activeSalonId?: string | null;
}

// Cache for RoleTemplate permissions (loaded once at startup)
let roleTemplateCache: Map<string, { primary: bigint; secondary: bigint }> | null = null;

/**
 * Load role templates into memory cache (called once at startup)
 */
async function loadRoleTemplates(entities: any): Promise<void> {
  if (roleTemplateCache) return; // Already loaded

  const templates = await entities.RoleTemplate.findMany({
    select: {
      name: true,
      primaryPermissions: true,
      secondaryPermissions: true,
    },
  });

  roleTemplateCache = new Map();
  for (const template of templates) {
    roleTemplateCache.set(template.name, {
      primary: BigInt(template.primaryPermissions),
      secondary: BigInt(template.secondaryPermissions),
    });
  }
}

/**
 * Get effective permissions for a user (template + custom overrides)
 */
function getEffectivePermissions(
  roleTemplate: string,
  primaryCustom: bigint,
  secondaryCustom: bigint
): { primary: bigint; secondary: bigint } {
  const template = roleTemplateCache?.get(roleTemplate);
  
  if (!template) {
    // Fallback: no permissions if template not found
    console.error(`Role template '${roleTemplate}' not found in cache`);
    return { primary: 0n, secondary: 0n };
  }

  // Merge template permissions with custom overrides (using bitwise OR)
  return {
    primary: template.primary | primaryCustom,
    secondary: template.secondary | secondaryCustom,
  };
}

/**
 * Verifies if a user has a specific permission in a given salon context.
 * 
 * OPTIMIZED VERSION - Uses bitflags instead of multiple JOINs
 * - Only 1 database query (UserSalon lookup)
 * - Bitwise operations are extremely fast (< 1ms)
 * - No more N+1 query problems
 * 
 * @param user - The authenticated user (must have id and activeSalonId)
 * @param salonId - The salon ID to check permission in
 * @param permission - The permission name to verify (e.g., 'clients:view', 'can_view_clients')
 * @param entities - Prisma entities from Wasp context
 * @throws {HttpError} - 401 if user not authenticated, 403 if no permission or wrong salon
 */
export async function requirePermission(
  user: ContextUser | undefined,
  salonId: string,
  permission: string,
  entities: any
): Promise<void> {
  // Check if user is authenticated
  if (!user || !user.id) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check if user has an active salon
  if (!user.activeSalonId) {
    throw new HttpError(403, 'No active salon selected');
  }

  // Check if user is trying to access the correct salon
  if (user.activeSalonId !== salonId) {
    throw new HttpError(403, 'Access denied: wrong salon context');
  }

  // Ensure role templates are loaded
  await loadRoleTemplates(entities);

  // Get user's salon membership (SINGLE QUERY - super fast!)
  const userSalon = await entities.UserSalon.findUnique({
    where: {
      userId_salonId: {
        userId: user.id,
        salonId: salonId,
      },
    },
    select: {
      isActive: true,
      roleTemplate: true,
      primaryPermissions: true,
      secondaryPermissions: true,
    },
  });

  if (!userSalon || !userSalon.isActive) {
    throw new HttpError(403, 'User not active in this salon');
  }

  // Convert legacy permission name to bitflags
  const permissionBitflags = legacyPermissionToBitflag(permission);

  // Get effective permissions (template + custom overrides)
  const effectivePerms = getEffectivePermissions(
    userSalon.roleTemplate,
    BigInt(userSalon.primaryPermissions || 0),
    BigInt(userSalon.secondaryPermissions || 0)
  );

  // Check permission using bitwise AND (extremely fast!)
  const hasRequiredPermission = hasPermission(
    effectivePerms.primary,
    effectivePerms.secondary,
    permissionBitflags
  );

  if (!hasRequiredPermission) {
    // Log access denied attempt (async, non-blocking)
    logAccessDenied(entities, user.id, salonId, permission, userSalon.roleTemplate).catch(err => {
      console.error('Failed to log access denied attempt:', err);
    });

    throw new HttpError(403, `Access denied: missing permission '${permission}'`);
  }

  // Success - user has permission
  // Optional: Log successful access for audit (only in production)
  if (process.env.NODE_ENV === 'production') {
    logAccessGranted(entities, user.id, salonId, permission).catch(err => {
      console.error('Failed to log access:', err);
    });
  }
}

/**
 * Check if user has permission without throwing error
 * Useful for UI conditional rendering
 */
export async function checkPermission(
  user: ContextUser | undefined,
  salonId: string,
  permission: string,
  entities: any
): Promise<boolean> {
  try {
    await requirePermission(user, salonId, permission, entities);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get all permissions for a user in a salon
 * Returns bitflags for efficient permission checking in bulk
 */
export async function getUserPermissions(
  userId: string,
  salonId: string,
  entities: any
): Promise<{ primary: bigint; secondary: bigint; roleTemplate: string } | null> {
  await loadRoleTemplates(entities);

  const userSalon = await entities.UserSalon.findUnique({
    where: {
      userId_salonId: {
        userId,
        salonId,
      },
    },
    select: {
      isActive: true,
      roleTemplate: true,
      primaryPermissions: true,
      secondaryPermissions: true,
    },
  });

  if (!userSalon || !userSalon.isActive) {
    return null;
  }

  const effectivePerms = getEffectivePermissions(
    userSalon.roleTemplate,
    BigInt(userSalon.primaryPermissions || 0),
    BigInt(userSalon.secondaryPermissions || 0)
  );

  return {
    ...effectivePerms,
    roleTemplate: userSalon.roleTemplate,
  };
}

/**
 * Check multiple permissions at once (useful for UI)
 */
export async function checkMultiplePermissions(
  user: ContextUser | undefined,
  salonId: string,
  permissions: string[],
  entities: any
): Promise<Record<string, boolean>> {
  if (!user || !user.id || !user.activeSalonId) {
    return Object.fromEntries(permissions.map(p => [p, false]));
  }

  await loadRoleTemplates(entities);

  const userSalon = await entities.UserSalon.findUnique({
    where: {
      userId_salonId: {
        userId: user.id,
        salonId,
      },
    },
    select: {
      isActive: true,
      roleTemplate: true,
      primaryPermissions: true,
      secondaryPermissions: true,
    },
  });

  if (!userSalon || !userSalon.isActive) {
    return Object.fromEntries(permissions.map(p => [p, false]));
  }

  const effectivePerms = getEffectivePermissions(
    userSalon.roleTemplate,
    BigInt(userSalon.primaryPermissions || 0),
    BigInt(userSalon.secondaryPermissions || 0)
  );

  const result: Record<string, boolean> = {};
  for (const permission of permissions) {
    const permissionBitflags = legacyPermissionToBitflag(permission);
    result[permission] = hasPermission(
      effectivePerms.primary,
      effectivePerms.secondary,
      permissionBitflags
    );
  }

  return result;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Log access denied attempt (non-blocking)
 */
async function logAccessDenied(
  entities: any,
  userId: string,
  salonId: string,
  permission: string,
  roleTemplate: string
): Promise<void> {
  try {
    await entities.Log.create({
      data: {
        userId,
        entity: 'Permission',
        entityId: salonId,
        action: 'ACCESS_DENIED',
        before: {},
        after: {
          permission,
          roleTemplate,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    // Ignore logging errors - don't block the main flow
    console.error('Failed to log access denied:', error);
  }
}

/**
 * Log successful access (non-blocking, production only)
 */
async function logAccessGranted(
  entities: any,
  userId: string,
  salonId: string,
  permission: string
): Promise<void> {
  try {
    await entities.Log.create({
      data: {
        userId,
        entity: 'Permission',
        entityId: salonId,
        action: 'ACCESS_GRANTED',
        before: {},
        after: {
          permission,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Failed to log access granted:', error);
  }
}

/**
 * Clear the role template cache (useful for testing or hot-reloading)
 */
export function clearRoleTemplateCache(): void {
  roleTemplateCache = null;
}
