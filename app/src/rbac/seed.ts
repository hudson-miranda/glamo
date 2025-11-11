import { PrismaClient } from '@prisma/client';
import { PERMISSION_GROUPS, PERMISSIONS_PRIMARY, PERMISSIONS_SECONDARY } from './permissions';

/**
 * Role Templates with pre-calculated bitflags.
 * These are global templates that will be seeded into the database.
 */
const ROLE_TEMPLATES = [
  {
    name: 'owner',
    displayName: 'Proprietário',
    description: 'Acesso completo a todas as funcionalidades do sistema',
    isSystem: true,
    primaryPermissions: PERMISSION_GROUPS.ALL_PRIMARY,
    secondaryPermissions: PERMISSION_GROUPS.ALL_SECONDARY,
  },
  {
    name: 'manager',
    displayName: 'Gerente',
    description: 'Acesso gerencial com maioria das permissões, exceto exclusão de salão',
    isSystem: true,
    primaryPermissions: PERMISSION_GROUPS.ALL_PRIMARY & ~PERMISSIONS_PRIMARY.SALON_DELETE, // All primary except delete salon
    secondaryPermissions: PERMISSION_GROUPS.ALL_SECONDARY, // All secondary permissions
  },
  {
    name: 'professional',
    displayName: 'Profissional',
    description: 'Acesso operacional para profissionais (cabeleireiro, manicure, etc.)',
    isSystem: true,
    primaryPermissions: (
      PERMISSIONS_PRIMARY.CLIENTS_VIEW |
      PERMISSIONS_PRIMARY.CLIENTS_CREATE |
      PERMISSIONS_PRIMARY.CLIENTS_EDIT |
      PERMISSIONS_PRIMARY.APPOINTMENTS_VIEW |
      PERMISSIONS_PRIMARY.APPOINTMENTS_CREATE |
      PERMISSIONS_PRIMARY.APPOINTMENTS_EDIT |
      PERMISSIONS_PRIMARY.SERVICES_VIEW |
      PERMISSIONS_PRIMARY.SALES_VIEW |
      PERMISSIONS_PRIMARY.SALES_CREATE |
      PERMISSIONS_PRIMARY.REPORTS_VIEW
    ),
    secondaryPermissions: (
      PERMISSIONS_SECONDARY.LOYALTY_VIEW |
      PERMISSIONS_SECONDARY.REFERRAL_VIEW |
      PERMISSIONS_SECONDARY.PHOTOS_VIEW |
      PERMISSIONS_SECONDARY.PHOTOS_MANAGE |
      PERMISSIONS_SECONDARY.ANAMNESIS_VIEW |
      PERMISSIONS_SECONDARY.SCHEDULING_VIEW
    ),
  },
  {
    name: 'cashier',
    displayName: 'Caixa',
    description: 'Acesso focado em vendas, caixa e relatórios financeiros',
    isSystem: true,
    primaryPermissions: (
      PERMISSIONS_PRIMARY.CLIENTS_VIEW |
      PERMISSIONS_PRIMARY.CLIENTS_CREATE |
      PERMISSIONS_PRIMARY.APPOINTMENTS_VIEW |
      PERMISSIONS_PRIMARY.SERVICES_VIEW |
      PERMISSION_GROUPS.SALES_ALL |
      PERMISSIONS_PRIMARY.INVENTORY_VIEW |
      PERMISSIONS_PRIMARY.CASH_REGISTER_OPEN |
      PERMISSIONS_PRIMARY.CASH_REGISTER_CLOSE |
      PERMISSIONS_PRIMARY.CASH_REGISTER_VIEW |
      PERMISSIONS_PRIMARY.CASH_REGISTER_ADJUST |
      PERMISSIONS_PRIMARY.REPORTS_VIEW
    ),
    secondaryPermissions: 0n, // No advanced modules
  },
  {
    name: 'assistant',
    displayName: 'Assistente',
    description: 'Acesso básico de visualização',
    isSystem: true,
    primaryPermissions: (
      PERMISSIONS_PRIMARY.CLIENTS_VIEW |
      PERMISSIONS_PRIMARY.APPOINTMENTS_VIEW |
      PERMISSIONS_PRIMARY.SERVICES_VIEW |
      PERMISSIONS_PRIMARY.SALES_VIEW
    ),
    secondaryPermissions: 0n, // No advanced modules
  },
  {
    name: 'client',
    displayName: 'Cliente',
    description: 'Acesso limitado para clientes (visualizar e criar próprios agendamentos)',
    isSystem: true,
    primaryPermissions: (
      PERMISSIONS_PRIMARY.APPOINTMENTS_VIEW |
      PERMISSIONS_PRIMARY.APPOINTMENTS_CREATE
    ),
    secondaryPermissions: 0n, // No advanced modules
  },
];

/**
 * Seeds the database with RoleTemplates.
 * This should be run once when setting up the system or during migration.
 * 
 * NOTE: This requires the Prisma migration to be run first!
 * Run: wasp db migrate-dev --name rbac_bitflags
 */
export async function seedRoleTemplates() {
  const prisma = new PrismaClient();
  
  console.log('🌱 Seeding Role Templates...');

  try {
    for (const template of ROLE_TEMPLATES) {
      await (prisma as any).roleTemplate.upsert({
        where: { name: template.name },
        update: {
          displayName: template.displayName,
          description: template.description,
          primaryPermissions: BigInt(template.primaryPermissions.toString()),
          secondaryPermissions: BigInt(template.secondaryPermissions.toString()),
        },
        create: {
          ...template,
          primaryPermissions: BigInt(template.primaryPermissions.toString()),
          secondaryPermissions: BigInt(template.secondaryPermissions.toString()),
        },
      });
      console.log(`✅ Seeded role template: ${template.name}`);
    }

    console.log(`✅ Successfully seeded ${ROLE_TEMPLATES.length} role templates`);
  } catch (error) {
    console.error('❌ Error seeding role templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DEPRECATED: Old function kept for backward compatibility during migration.
 * Use seedRoleTemplates() instead.
 */
export async function seedRbacPermissionsAndRoles() {
  console.log('⚠️  seedRbacPermissionsAndRoles is DEPRECATED. Use seedRoleTemplates() instead.');
  await seedRoleTemplates();
}

/**
 * DEPRECATED: Roles are no longer created per salon.
 * Users are now assigned roleTemplates directly in UserSalon.
 * This function is kept for backward compatibility but does nothing.
 */
export async function createDefaultRolesForSalon(salonId: string, entities?: any) {
  console.log(`⚠️  createDefaultRolesForSalon is DEPRECATED. Roles are now global templates.`);
  console.log(`   New salons automatically use roleTemplates. No per-salon role creation needed.`);
  // Return empty array to maintain compatibility with old code
  return [];
}

/**
 * DEPRECATED: Owner role is now assigned directly via UserSalon.roleTemplate.
 * This function is kept for backward compatibility but should not be used.
 */
export async function assignOwnerRole(userId: string, salonId: string, entities?: any) {
  console.log(`⚠️  assignOwnerRole is DEPRECATED. Use UserSalon.roleTemplate = 'owner' instead.`);
  console.log(`   This should be handled in salon creation operations now.`);
}
