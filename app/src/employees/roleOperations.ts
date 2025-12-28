import type { Role } from 'wasp/entities';
import { HttpError } from 'wasp/server';
import type { GetRoles, CreateRole, UpdateRole, DeleteRole } from 'wasp/server/operations';

// ============================================================================
// Types
// ============================================================================

type CreateRoleInput = {
  salonId: string;
  name: string;
  description?: string;
  isOwner?: boolean;
  // Agenda
  scheduleAccess?: boolean;
  scheduleCreate?: boolean;
  scheduleEdit?: boolean;
  scheduleDelete?: boolean;
  scheduleViewAll?: boolean;
  // Anamneses
  anamnesisAccess?: boolean;
  anamnesisCreate?: boolean;
  anamnesisEdit?: boolean;
  anamnesisDelete?: boolean;
  // Avaliações (NPS)
  reviewsAccess?: boolean;
  reviewsCreate?: boolean;
  reviewsEdit?: boolean;
  reviewsDelete?: boolean;
  // Campanhas
  campaignsAccess?: boolean;
  campaignsCreate?: boolean;
  campaignsEdit?: boolean;
  campaignsDelete?: boolean;
  // Clientes
  clientsAccess?: boolean;
  clientsCreate?: boolean;
  clientsEdit?: boolean;
  clientsDelete?: boolean;
  clientsViewPhones?: boolean;
  clientsNotes?: boolean;
  clientsEditCredits?: boolean;
  // Comandas
  commandsAccess?: boolean;
  commandsCreate?: boolean;
  commandsEdit?: boolean;
  commandsDelete?: boolean;
  commandsViewBilled?: boolean;
  commandsEditAssist?: boolean;
  // Comissões
  commissionsAccess?: boolean;
  commissionsCreate?: boolean;
  commissionsEdit?: boolean;
  commissionsDelete?: boolean;
  // Compras
  purchasesAccess?: boolean;
  purchasesCreate?: boolean;
  purchasesEdit?: boolean;
  purchasesDelete?: boolean;
  // Financeiro
  expensesAccess?: boolean;
  expensesCreate?: boolean;
  expensesEdit?: boolean;
  expensesDelete?: boolean;
  cashClosureAccess?: boolean;
  financialPanelAccess?: boolean;
  receivablesAccess?: boolean;
  receivablesCreate?: boolean;
  receivablesEdit?: boolean;
  receivablesDelete?: boolean;
  transfersAccess?: boolean;
  transfersCreate?: boolean;
  transfersEdit?: boolean;
  transfersDelete?: boolean;
  advancesAccess?: boolean;
  advancesCreate?: boolean;
  advancesEdit?: boolean;
  advancesDelete?: boolean;
  // Fornecedores
  suppliersAccess?: boolean;
  suppliersCreate?: boolean;
  suppliersEdit?: boolean;
  suppliersDelete?: boolean;
  // Metas
  goalsAccess?: boolean;
  goalsCreate?: boolean;
  goalsEdit?: boolean;
  goalsDelete?: boolean;
  goalsViewAll?: boolean;
  // Notificações
  notificationsAll?: boolean;
  // Notas Fiscais
  invoicesAccess?: boolean;
  invoicesCreate?: boolean;
  invoicesEdit?: boolean;
  invoicesDelete?: boolean;
  // Pacotes
  packagesAccess?: boolean;
  packagesCreate?: boolean;
  packagesEdit?: boolean;
  packagesDelete?: boolean;
  // Produtos/Serviços
  productsAccess?: boolean;
  productsCreate?: boolean;
  productsEdit?: boolean;
  productsDelete?: boolean;
  // Promoções
  promotionsAccess?: boolean;
  promotionsCreate?: boolean;
  promotionsEdit?: boolean;
  promotionsDelete?: boolean;
  // Profissionais
  professionalsAccess?: boolean;
  professionalsCreate?: boolean;
  professionalsEdit?: boolean;
  professionalsDelete?: boolean;
  // Relatórios
  reportsFinancialAccess?: boolean;
  reportsScheduleAccess?: boolean;
  reportsClientsAccess?: boolean;
  reportsSalesAccess?: boolean;
  reportsStockAccess?: boolean;
  reportsInvoicesAccess?: boolean;
  reportsRankingAccess?: boolean;
  reportsMessagesAccess?: boolean;
  // Salários
  salariesAccess?: boolean;
  salariesCreate?: boolean;
  salariesEdit?: boolean;
  salariesDelete?: boolean;
  // WhatsApp Marketing
  whatsappAccess?: boolean;
  whatsappCreate?: boolean;
  whatsappEdit?: boolean;
  whatsappDelete?: boolean;
  // Venda por Assinatura
  subscriptionSalesAccess?: boolean;
  subscriptionSalesCreate?: boolean;
  subscriptionSalesEdit?: boolean;
  subscriptionSalesDelete?: boolean;
};

type UpdateRoleInput = CreateRoleInput & {
  id: string;
};

// ============================================================================
// Queries
// ============================================================================

export const getRoles: GetRoles<{ salonId: string }, Role[]> = async ({ salonId }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Usuário não autenticado');
  }

  const roles = await context.entities.Role.findMany({
    where: {
      salonId,
      deletedAt: null,
    },
    orderBy: {
      name: 'asc',
    },
  });

  return roles;
};

// ============================================================================
// Actions
// ============================================================================

export const createRole: CreateRole<CreateRoleInput, Role> = async (input, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Usuário não autenticado');
  }

  // Verificar se já existe um role com o mesmo nome neste salão
  const existingRole = await context.entities.Role.findFirst({
    where: {
      salonId: input.salonId,
      name: input.name,
      deletedAt: null,
    },
  });

  if (existingRole) {
    throw new HttpError(400, 'Já existe um cargo com este nome');
  }

  const role = await context.entities.Role.create({
    data: input,
  });

  return role;
};

export const updateRole: UpdateRole<UpdateRoleInput, Role> = async (input, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Usuário não autenticado');
  }

  const { id, ...data } = input;

  // Verificar se existe outro role com o mesmo nome
  if (data.name) {
    const existingRole = await context.entities.Role.findFirst({
      where: {
        salonId: data.salonId,
        name: data.name,
        deletedAt: null,
        id: { not: id },
      },
    });

    if (existingRole) {
      throw new HttpError(400, 'Já existe um cargo com este nome');
    }
  }

  const role = await context.entities.Role.update({
    where: { id },
    data,
  });

  return role;
};

export const deleteRole: DeleteRole<{ id: string }, Role> = async ({ id }, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Usuário não autenticado');
  }

  // Soft delete
  const role = await context.entities.Role.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });

  return role;
};
