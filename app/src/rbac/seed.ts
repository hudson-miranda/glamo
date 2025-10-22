import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  }
}

/**
 * Creates default roles for a specific salon.
 * This should be called when a new salon is created.
 * 
 * @param salonId - The ID of the salon to create roles for
 */
export async function createDefaultRolesForSalon(salonId: string) {
  console.log(`🌱 Creating default roles for salon ${salonId}...`);

  try {
    for (const roleConfig of DEFAULT_ROLES) {
      // Create role
      const role = await prisma.role.upsert({
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
      const permissions = await prisma.permission.findMany({
        where: {
          name: {
            in: roleConfig.permissions,
          },
        },
      });

      // Create role permissions
      for (const permission of permissions) {
        await prisma.rolePermission.upsert({
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
  }
}

/**
 * Assigns the owner role to a user for a specific salon.
 * This should be called when a user creates a new salon.
 * 
 * @param userId - The ID of the user to assign owner role
 * @param salonId - The ID of the salon
 */
export async function assignOwnerRole(userId: string, salonId: string) {
  console.log(`🔑 Assigning owner role to user ${userId} for salon ${salonId}...`);

  try {
    // Get or create UserSalon record
    const userSalon = await prisma.userSalon.upsert({
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
    const ownerRole = await prisma.role.findUnique({
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
    await prisma.userRole.upsert({
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
    await prisma.user.update({
      where: { id: userId },
      data: {
        activeSalonId: salonId,
      },
    });

    console.log('✅ Owner role assigned successfully');
  } catch (error) {
    console.error('❌ Error assigning owner role:', error);
    throw error;
  }
}

// Main seed function for testing
if (require.main === module) {
  seedRbacPermissionsAndRoles()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
