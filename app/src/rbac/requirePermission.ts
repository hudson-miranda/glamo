import type { User } from 'wasp/entities';
import { HttpError } from 'wasp/server';

export interface ContextUser {
  id: string;
  activeSalonId?: string | null;
}

/**
 * Verifies if a user has a specific permission in a given salon context.
 * 
 * @param user - The authenticated user (must have id and activeSalonId)
 * @param salonId - The salon ID to check permission in
 * @param permission - The permission name to verify (e.g., 'can_view_clients')
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

  // Get user's roles and permissions for this salon
  const userSalon = await entities.UserSalon.findUnique({
    where: {
      userId_salonId: {
        userId: user.id,
        salonId: salonId,
      },
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userSalon || !userSalon.isActive) {
    throw new HttpError(403, 'User not active in this salon');
  }

  // Extract all permissions from user's roles
  const userPermissions = new Set<string>();
  
  for (const userRole of userSalon.userRoles) {
    for (const rolePermission of userRole.role.rolePermissions) {
      userPermissions.add(rolePermission.permission.name);
    }
  }

  // Check if user has the required permission
  if (!userPermissions.has(permission)) {
    // Log access denied attempt (but don't let logging failures block the permission check)
    try {
      await entities.Log.create({
        data: {
          userId: user.id,
          entity: 'Permission',
          entityId: salonId,
          action: 'ACCESS_DENIED',
          before: {},
          after: {
            permission,
            userPermissions: Array.from(userPermissions),
          },
        },
      });
    } catch (logError) {
      // Silently fail logging - permission check is more important
      console.error('Failed to log access denied attempt:', logError);
    }

    throw new HttpError(403, `Access denied: missing permission '${permission}'`);
  }

  // Permission check passed
}

/**
 * Checks if a user has a specific permission without throwing an error.
 * Useful for conditional UI rendering or feature flags.
 * 
 * @param user - The authenticated user
 * @param salonId - The salon ID to check permission in
 * @param permission - The permission name to verify
 * @param prisma - Prisma client instance
 * @returns true if user has permission, false otherwise
 */
export async function hasPermission(
  user: ContextUser | undefined,
  salonId: string,
  permission: string,
  prisma: any
): Promise<boolean> {
  try {
    await requirePermission(user, salonId, permission, prisma);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Gets all permissions a user has in a given salon.
 * 
 * @param userId - The user ID
 * @param salonId - The salon ID
 * @param prisma - Prisma client instance
 * @returns Array of permission names
 */
export async function getUserPermissions(
  userId: string,
  salonId: string,
  prisma: any
): Promise<string[]> {
  const userSalon = await prisma.userSalon.findUnique({
    where: {
      userId_salonId: {
        userId,
        salonId,
      },
    },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userSalon || !userSalon.isActive) {
    return [];
  }

  const permissions = new Set<string>();
  
  for (const userRole of userSalon.userRoles) {
    for (const rolePermission of userRole.role.rolePermissions) {
      permissions.add(rolePermission.permission.name);
    }
  }

  return Array.from(permissions);
}
