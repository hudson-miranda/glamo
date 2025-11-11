import { PrismaClient } from '@prisma/client';

// Define all permissions
const PERMISSIONS = [
  // Client permissions
  { name: 'can_view_clients', description: 'View clients list and details' },
  { name: 'can_create_clients', description: 'Create new clients' },
  { name: 'can_edit_clients', description: 'Edit existing clients' },
  { name: 'can_delete_clients', description: 'Delete clients' },

  // Appointment permissions
  { name: 'can_view_appointments', description: 'View appointments' },
  { name: 'can_create_appointments', description: 'Create new appointments' },
  { name: 'can_edit_appointments', description: 'Edit existing appointments' },
  { name: 'can_delete_appointments', description: 'Delete/cancel appointments' },
  { name: 'can_view_all_appointments', description: 'View all appointments (not just own)' },

  // Service permissions
  { name: 'can_view_services', description: 'View services list' },
  { name: 'can_create_services', description: 'Create new services' },
  { name: 'can_edit_services', description: 'Edit existing services' },
  { name: 'can_delete_services', description: 'Delete services' },
  { name: 'can_manage_commissions', description: 'Manage commission configurations' },

  // Sales permissions
  { name: 'can_view_sales', description: 'View sales records' },
  { name: 'can_create_sales', description: 'Create new sales' },
  { name: 'can_edit_sales', description: 'Edit existing sales' },
  { name: 'can_delete_sales', description: 'Delete/cancel sales' },
  { name: 'can_view_all_sales', description: 'View all sales (not just own)' },
  { name: 'can_apply_discounts', description: 'Apply discounts to sales' },

  // Inventory permissions
  { name: 'can_view_inventory', description: 'View inventory and stock levels' },
  { name: 'can_create_products', description: 'Create new products' },
  { name: 'can_edit_products', description: 'Edit existing products' },
  { name: 'can_delete_products', description: 'Delete products' },
  { name: 'can_adjust_stock', description: 'Adjust stock levels' },

  // Cash register permissions
  { name: 'can_view_cash', description: 'View cash register information' },
  { name: 'can_open_cash', description: 'Open cash register session' },
  { name: 'can_close_cash', description: 'Close cash register session' },
  { name: 'can_record_cash_movement', description: 'Record cash movements (sangria/suprimento)' },

  // Report permissions
  { name: 'can_view_reports', description: 'View reports' },
  { name: 'can_view_commission_reports', description: 'View commission reports' },
  { name: 'can_export_reports', description: 'Export reports' },

  // User/Staff management permissions
  { name: 'can_view_staff', description: 'View staff members' },
  { name: 'can_invite_staff', description: 'Invite new staff members' },
  { name: 'can_edit_staff', description: 'Edit staff member details' },
  { name: 'can_remove_staff', description: 'Remove staff members' },
  { name: 'can_manage_roles', description: 'Manage roles and permissions' },

  // Employee permissions
  { name: 'employees:read', description: 'View employees list and details' },
  { name: 'employees:create', description: 'Create new employees' },
  { name: 'employees:update', description: 'Edit existing employees' },
  { name: 'employees:delete', description: 'Delete employees' },

  // Loyalty Program permissions
  { name: 'loyalty:view', description: 'View loyalty programs' },
  { name: 'loyalty:manage', description: 'Create and manage loyalty programs' },
  
  // Referral Program permissions
  { name: 'referral:view', description: 'View referral programs' },
  { name: 'referral:manage', description: 'Create and manage referral programs' },
  
  // Advanced Analytics permissions
  { name: 'analytics:view', description: 'View advanced analytics' },
  { name: 'analytics:manage', description: 'Manage analytics settings' },
  
  // Photos/Gallery permissions
  { name: 'photos:view', description: 'View photo gallery' },
  { name: 'photos:manage', description: 'Upload and manage photos' },
  
  // Anamnesis permissions
  { name: 'anamnesis:view', description: 'View anamnesis forms' },
  { name: 'anamnesis:manage', description: 'Create and manage anamnesis forms' },
  
  // Advanced Scheduling permissions
  { name: 'scheduling:view', description: 'View advanced scheduling features' },
  { name: 'scheduling:manage', description: 'Manage time blocks and waiting lists' },

  // Salon settings permissions
  { name: 'can_edit_salon_settings', description: 'Edit salon settings' },
  { name: 'can_view_logs', description: 'View audit logs' },
];

// Define default roles with their permissions
const DEFAULT_ROLES = [
  {
    name: 'owner',
    permissions: PERMISSIONS.map(p => p.name), // Owner has all permissions
  },
  {
    name: 'manager',
    permissions: [
      'can_view_clients', 'can_create_clients', 'can_edit_clients', 'can_delete_clients',
      'can_view_appointments', 'can_create_appointments', 'can_edit_appointments', 'can_delete_appointments', 'can_view_all_appointments',
      'can_view_services', 'can_create_services', 'can_edit_services',
      'can_view_sales', 'can_create_sales', 'can_edit_sales', 'can_delete_sales', 'can_view_all_sales', 'can_apply_discounts',
      'can_view_inventory', 'can_create_products', 'can_edit_products', 'can_adjust_stock',
      'can_view_cash', 'can_open_cash', 'can_close_cash', 'can_record_cash_movement',
      'can_view_reports', 'can_view_commission_reports', 'can_export_reports',
      'can_view_staff', 'can_invite_staff', 'can_edit_staff',
      'employees:read', 'employees:create', 'employees:update', 'employees:delete',
      'loyalty:view', 'loyalty:manage',
      'referral:view', 'referral:manage',
      'analytics:view', 'analytics:manage',
      'photos:view', 'photos:manage',
      'anamnesis:view', 'anamnesis:manage',
      'scheduling:view', 'scheduling:manage',
      'can_view_logs',
    ],
  },
  {
    name: 'professional',
    permissions: [
      'can_view_clients', 'can_create_clients', 'can_edit_clients',
      'can_view_appointments', 'can_create_appointments', 'can_edit_appointments',
      'can_view_services',
      'can_view_sales', 'can_create_sales',
      'can_view_commission_reports',
      'loyalty:view',
      'referral:view',
      'photos:view', 'photos:manage',
      'anamnesis:view',
      'scheduling:view',
    ],
  },
  {
    name: 'cashier',
    permissions: [
      'can_view_clients', 'can_create_clients',
      'can_view_appointments',
      'can_view_services',
      'can_view_sales', 'can_create_sales', 'can_edit_sales', 'can_view_all_sales', 'can_apply_discounts',
      'can_view_inventory',
      'can_view_cash', 'can_open_cash', 'can_close_cash', 'can_record_cash_movement',
      'can_view_reports',
    ],
  },
  {
    name: 'assistant',
    permissions: [
      'can_view_clients',
      'can_view_appointments',
      'can_view_services',
      'can_view_sales',
    ],
  },
  {
    name: 'client',
    permissions: [
      'can_view_appointments', // Only their own
      'can_create_appointments', // For self-booking
    ],
  },
];

/**
 * Seeds the database with default permissions and roles.
 * This should be run once when setting up the system.
 */
export async function seedRbacPermissionsAndRoles() {
  const prisma = new PrismaClient();
  
  console.log('🌱 Seeding RBAC permissions and roles...');

  try {
    // Create all permissions
    console.log('Creating permissions...');
    for (const perm of PERMISSIONS) {
      await prisma.permission.upsert({
        where: { name: perm.name },
        update: { description: perm.description },
        create: perm,
      });
    }
    console.log(`✅ Created ${PERMISSIONS.length} permissions`);

    // Note: Roles are salon-specific, so they need to be created per salon
    // This function just ensures permissions exist globally
    
    console.log('✅ RBAC seed completed successfully');
  } catch (error) {
    console.error('❌ Error seeding RBAC:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Creates default roles for a specific salon.
 * This should be called when a new salon is created.
 * 
 * @param salonId - The ID of the salon to create roles for
 * @param entities - Prisma entities from context
 */
export async function createDefaultRolesForSalon(salonId: string, entities?: any) {
  console.log(`🌱 Creating default roles for salon ${salonId}...`);

  // Use entities if provided (from Wasp context), otherwise use direct prisma
  const db = entities || new PrismaClient();
  const shouldDisconnect = !entities;

  try {
    // First, ensure all permissions exist (auto-seed if missing)
    console.log('Ensuring permissions exist...');
    for (const perm of PERMISSIONS) {
      await (entities ? db.Permission : db.permission).upsert({
        where: { name: perm.name },
        update: { description: perm.description },
        create: perm,
      });
    }
    console.log(`✅ Ensured ${PERMISSIONS.length} permissions exist`);

    for (const roleConfig of DEFAULT_ROLES) {
      // Create role
      const role = await (entities ? db.Role : db.role).upsert({
        where: {
          salonId_name: {
            salonId,
            name: roleConfig.name,
          },
        },
        update: {},
        create: {
          salonId,
          name: roleConfig.name,
        },
      });

      // Get permission IDs
      const permissions = await (entities ? db.Permission : db.permission).findMany({
        where: {
          name: {
            in: roleConfig.permissions,
          },
        },
      });

      // Create role permissions
      for (const permission of permissions) {
        await (entities ? db.RolePermission : db.rolePermission).upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }

      console.log(`✅ Created role '${roleConfig.name}' with ${permissions.length} permissions`);
    }

    console.log('✅ Default roles created successfully');
  } catch (error) {
    console.error('❌ Error creating default roles:', error);
    throw error;
  } finally {
    if (shouldDisconnect && !entities) {
      await (db as PrismaClient).$disconnect();
    }
  }
}

/**
 * Assigns the owner role to a user for a specific salon.
 * This should be called when a user creates a new salon.
 * 
 * @param userId - The ID of the user to assign owner role
 * @param salonId - The ID of the salon
 * @param entities - Prisma entities from context
 */
export async function assignOwnerRole(userId: string, salonId: string, entities?: any) {
  console.log(`🔑 Assigning owner role to user ${userId} for salon ${salonId}...`);

  // Use entities if provided (from Wasp context), otherwise use direct prisma
  const db = entities || new PrismaClient();
  const shouldDisconnect = !entities;

  try {
    // Get or create UserSalon record
    const userSalon = await (entities ? db.UserSalon : db.userSalon).upsert({
      where: {
        userId_salonId: {
          userId,
          salonId,
        },
      },
      update: {
        isActive: true,
      },
      create: {
        userId,
        salonId,
        isActive: true,
      },
    });

    // Get the owner role for this salon
    const ownerRole = await (entities ? db.Role : db.role).findUnique({
      where: {
        salonId_name: {
          salonId,
          name: 'owner',
        },
      },
    });

    if (!ownerRole) {
      throw new Error(`Owner role not found for salon ${salonId}`);
    }

    // Assign owner role to user
    await (entities ? db.UserRole : db.userRole).upsert({
      where: {
        userSalonId_roleId: {
          userSalonId: userSalon.id,
          roleId: ownerRole.id,
        },
      },
      update: {},
      create: {
        userSalonId: userSalon.id,
        roleId: ownerRole.id,
      },
    });

    // Update user's active salon if not set
    await (entities ? db.User : db.user).update({
      where: { id: userId },
      data: {
        activeSalonId: salonId,
      },
    });

    console.log('✅ Owner role assigned successfully');
  } catch (error) {
    console.error('❌ Error assigning owner role:', error);
    throw error;
  } finally {
    if (shouldDisconnect && !entities) {
      await (db as PrismaClient).$disconnect();
    }
  }
}
