import { HttpError } from 'wasp/server';
import { PERMISSION_GROUPS, PERMISSIONS_PRIMARY, PERMISSIONS_SECONDARY } from './permissions';

/**
 * Role Templates with pre-calculated bitflags.
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
    primaryPermissions: PERMISSION_GROUPS.ALL_PRIMARY & ~PERMISSIONS_PRIMARY.SALON_DELETE,
    secondaryPermissions: PERMISSION_GROUPS.ALL_SECONDARY,
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
    secondaryPermissions: 0n,
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
    secondaryPermissions: 0n,
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
    secondaryPermissions: 0n,
  },
];

/**
 * Action to seed role templates - can be called from the frontend
 */
export const seedRoleTemplatesAction = async (
  args: void,
  context: any
): Promise<{ count: number; templates: string[] }> => {
  // Only allow if user is authenticated (optional: add admin check)
  if (!context.user) {
    throw new HttpError(401, 'Not authenticated');
  }

  console.log('🌱 Seeding Role Templates...');

  const seededTemplates: string[] = [];

  try {
    for (const template of ROLE_TEMPLATES) {
      await context.entities.RoleTemplate.upsert({
        where: { name: template.name },
        update: {
          displayName: template.displayName,
          description: template.description,
          primaryPermissions: template.primaryPermissions.toString(),
          secondaryPermissions: template.secondaryPermissions.toString(),
        },
        create: {
          ...template,
          primaryPermissions: template.primaryPermissions.toString(),
          secondaryPermissions: template.secondaryPermissions.toString(),
        },
      });
      seededTemplates.push(template.name);
      console.log(`✅ Seeded role template: ${template.name}`);
    }

    console.log(`✅ Successfully seeded ${ROLE_TEMPLATES.length} role templates`);
    
    return {
      count: seededTemplates.length,
      templates: seededTemplates,
    };
  } catch (error: any) {
    console.error('❌ Error seeding role templates:', error);
    throw new HttpError(500, `Failed to seed role templates: ${error.message}`);
  }
};
