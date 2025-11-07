import type { Employee, EmployeeSchedule, EmployeeService } from 'wasp/entities';
import type { 
  ListEmployees, 
  GetEmployee,
  CreateEmployee,
  UpdateEmployee,
  DeleteEmployee,
  UpdateEmployeeSchedules,
  UpdateEmployeeServices
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Query: listEmployees
// ============================================================================
type ListEmployeesInput = {
  salonId?: string;
  isActive?: boolean;
  search?: string;
};

type ListEmployeesOutput = {
  employees: (Employee & {
    user: { id: string; name: string | null; email: string | null } | null;
    schedules: EmployeeSchedule[];
    _count: { serviceAssignments: number };
  })[];
  total: number;
};

export const listEmployees: ListEmployees<ListEmployeesInput, ListEmployeesOutput> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  const salonId = args.salonId || context.user.activeSalonId;
  if (!salonId) {
    throw new HttpError(400, 'Salão não especificado');
  }

  // Verificar permissão
  await requirePermission(context.user, salonId, 'employees:read', context.entities);

  const where: any = {
    salonId,
    deletedAt: null,
  };

  if (args.isActive !== undefined) {
    where.isActive = args.isActive;
  }

  if (args.search) {
    where.OR = [
      { name: { contains: args.search, mode: 'insensitive' } },
      { email: { contains: args.search, mode: 'insensitive' } },
      { phone: { contains: args.search, mode: 'insensitive' } },
      { cpf: { contains: args.search, mode: 'insensitive' } },
    ];
  }

  const [employees, total] = await Promise.all([
    context.entities.Employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        schedules: {
          where: { isActive: true },
          orderBy: { dayOfWeek: 'asc' },
        },
        _count: {
          select: {
            serviceAssignments: true,
          },
        },
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' },
      ],
    }),
    context.entities.Employee.count({ where }),
  ]);

  return { employees, total };
};

// ============================================================================
// Query: getEmployee
// ============================================================================
type GetEmployeeInput = {
  id: string;
};

type GetEmployeeOutput = Employee & {
  user: { id: string; name: string | null; email: string | null } | null;
  schedules: EmployeeSchedule[];
  serviceAssignments: (EmployeeService & {
    service: {
      id: string;
      name: string;
      duration: number;
      price: number;
    };
  })[];
};

export const getEmployee: GetEmployee<GetEmployeeInput, GetEmployeeOutput> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  const employee = await context.entities.Employee.findUnique({
    where: { id: args.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      schedules: {
        where: { isActive: true },
        orderBy: { dayOfWeek: 'asc' },
      },
      serviceAssignments: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!employee) {
    throw new HttpError(404, 'Colaborador não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, employee.salonId, 'employees:read', context.entities);

  return employee;
};

// ============================================================================
// Action: createEmployee
// ============================================================================
type CreateEmployeeInput = {
  salonId?: string;
  name: string;
  email?: string;
  phone?: string;
  phone2?: string;
  instagram?: string;
  birthDate?: string;
  color?: string;
  cpf?: string;
  rg?: string;
  rgIssuingBody?: string;
  pixKey?: string;
  bankName?: string;
  bankAgency?: string;
  bankAccount?: string;
  bankDigit?: string;
  accountType?: string;
  personType?: string;
  companyName?: string;
  cnpj?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  position?: string;
  permissions?: string[];
  commissionType?: string;
  commissionValue?: number;
  tipRule?: string;
  canReceiveTips?: boolean;
  tipsOnlyFromAppointments?: boolean;
  schedules?: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
  sendInvite?: boolean;
};

export const createEmployee: CreateEmployee<CreateEmployeeInput, Employee> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  const salonId = args.salonId || context.user.activeSalonId;
  if (!salonId) {
    throw new HttpError(400, 'Salão não especificado');
  }

  // Verificar permissão
  await requirePermission(context.user, salonId, 'employees:create', context.entities);

  // Validações
  if (!args.name || args.name.trim().length < 3) {
    throw new HttpError(400, 'Nome deve ter no mínimo 3 caracteres');
  }

  // Se email foi fornecido, verificar se já existe um user com esse email
  let userId: string | undefined;
  if (args.email) {
    const existingUser = await context.entities.User.findUnique({
      where: { email: args.email },
    });
    userId = existingUser?.id;
  }

  // Criar o colaborador
  const employee = await context.entities.Employee.create({
    data: {
      salonId,
      userId,
      name: args.name.trim(),
      email: args.email?.trim(),
      phone: args.phone?.replace(/\D/g, ''),
      phone2: args.phone2?.replace(/\D/g, ''),
      instagram: args.instagram?.trim(),
      birthDate: args.birthDate ? new Date(args.birthDate) : undefined,
      color: args.color || generateRandomColor(),
      cpf: args.cpf?.replace(/\D/g, ''),
      rg: args.rg?.replace(/\D/g, ''),
      rgIssuingBody: args.rgIssuingBody?.trim(),
      pixKey: args.pixKey?.trim(),
      bankName: args.bankName?.trim(),
      bankAgency: args.bankAgency?.trim(),
      bankAccount: args.bankAccount?.trim(),
      bankDigit: args.bankDigit?.trim(),
      accountType: args.accountType,
      personType: args.personType || 'Pessoa Física',
      companyName: args.companyName?.trim(),
      cnpj: args.cnpj?.replace(/\D/g, ''),
      address: args.address?.trim(),
      addressNumber: args.addressNumber?.trim(),
      complement: args.complement?.trim(),
      neighborhood: args.neighborhood?.trim(),
      city: args.city?.trim(),
      state: args.state?.trim().toUpperCase(),
      zipCode: args.zipCode?.replace(/\D/g, ''),
      position: args.position,
      permissions: args.permissions || [],
      commissionType: args.commissionType,
      commissionValue: args.commissionValue,
      tipRule: args.tipRule,
      canReceiveTips: args.canReceiveTips ?? true,
      tipsOnlyFromAppointments: args.tipsOnlyFromAppointments ?? true,
    },
  });

  // Criar horários de trabalho se fornecidos
  if (args.schedules && args.schedules.length > 0) {
    await context.entities.EmployeeSchedule.createMany({
      data: args.schedules.map((schedule) => ({
        employeeId: employee.id,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
      })),
    });
  }

  // Se email foi fornecido e sendInvite = true, enviar convite
  if (args.email && args.sendInvite !== false) {
    try {
      // Buscar ou criar role padrão para colaboradores
      const defaultRole = await context.entities.Role.findFirst({
        where: {
          salonId,
          name: { in: ['Profissional', 'Colaborador', 'Employee'] },
        },
      });

      if (defaultRole) {
        await context.entities.SalonInvite.create({
          data: {
            salonId,
            invitedBy: context.user.id,
            email: args.email,
            roleId: defaultRole.id,
            status: 'PENDING',
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
          },
        });
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error);
      // Não falhar a criação do employee se o convite falhar
    }
  }

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Employee',
      entityId: employee.id,
      action: 'CREATE',
      after: {
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
      },
    },
  });

  return employee;
};

// ============================================================================
// Action: updateEmployee
// ============================================================================
type UpdateEmployeeInput = CreateEmployeeInput & {
  id: string;
};

export const updateEmployee: UpdateEmployee<UpdateEmployeeInput, Employee> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  const employee = await context.entities.Employee.findUnique({
    where: { id: args.id },
  });

  if (!employee) {
    throw new HttpError(404, 'Colaborador não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, employee.salonId, 'employees:update', context.entities);

  // Atualizar employee
  const updated = await context.entities.Employee.update({
    where: { id: args.id },
    data: {
      name: args.name?.trim(),
      email: args.email?.trim(),
      phone: args.phone?.replace(/\D/g, ''),
      phone2: args.phone2?.replace(/\D/g, ''),
      instagram: args.instagram?.trim(),
      birthDate: args.birthDate ? new Date(args.birthDate) : undefined,
      color: args.color,
      cpf: args.cpf?.replace(/\D/g, ''),
      rg: args.rg?.replace(/\D/g, ''),
      rgIssuingBody: args.rgIssuingBody?.trim(),
      pixKey: args.pixKey?.trim(),
      bankName: args.bankName?.trim(),
      bankAgency: args.bankAgency?.trim(),
      bankAccount: args.bankAccount?.trim(),
      bankDigit: args.bankDigit?.trim(),
      accountType: args.accountType,
      personType: args.personType,
      companyName: args.companyName?.trim(),
      cnpj: args.cnpj?.replace(/\D/g, ''),
      address: args.address?.trim(),
      addressNumber: args.addressNumber?.trim(),
      complement: args.complement?.trim(),
      neighborhood: args.neighborhood?.trim(),
      city: args.city?.trim(),
      state: args.state?.trim().toUpperCase(),
      zipCode: args.zipCode?.replace(/\D/g, ''),
      position: args.position,
      permissions: args.permissions,
      commissionType: args.commissionType,
      commissionValue: args.commissionValue,
      tipRule: args.tipRule,
      canReceiveTips: args.canReceiveTips,
      tipsOnlyFromAppointments: args.tipsOnlyFromAppointments,
    },
  });

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Employee',
      entityId: employee.id,
      action: 'UPDATE',
      after: {
        name: updated.name,
        email: updated.email,
      },
    },
  });

  return updated;
};

// ============================================================================
// Action: deleteEmployee
// ============================================================================
type DeleteEmployeeInput = {
  id: string;
};

export const deleteEmployee: DeleteEmployee<DeleteEmployeeInput, Employee> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  const employee = await context.entities.Employee.findUnique({
    where: { id: args.id },
  });

  if (!employee) {
    throw new HttpError(404, 'Colaborador não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, employee.salonId, 'employees:delete', context.entities);

  // Soft delete
  const deleted = await context.entities.Employee.update({
    where: { id: args.id },
    data: {
      deletedAt: new Date(),
      isActive: false,
    },
  });

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Employee',
      entityId: employee.id,
      action: 'DELETE',
      before: {
        name: employee.name,
        email: employee.email,
      },
    },
  });

  return deleted;
};

// ============================================================================
// Action: updateEmployeeSchedules
// ============================================================================
type UpdateEmployeeSchedulesInput = {
  employeeId: string;
  schedules: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }>;
};

export const updateEmployeeSchedules: UpdateEmployeeSchedules<UpdateEmployeeSchedulesInput, void> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  const employee = await context.entities.Employee.findUnique({
    where: { id: args.employeeId },
  });

  if (!employee) {
    throw new HttpError(404, 'Colaborador não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, employee.salonId, 'employees:update', context.entities);

  // Desativar todos os horários existentes
  await context.entities.EmployeeSchedule.updateMany({
    where: { employeeId: args.employeeId },
    data: { isActive: false },
  });

  // Criar novos horários
  if (args.schedules && args.schedules.length > 0) {
    await context.entities.EmployeeSchedule.createMany({
      data: args.schedules.map((schedule) => ({
        employeeId: args.employeeId,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isActive: true,
      })),
    });
  }

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'EmployeeSchedule',
      entityId: employee.id,
      action: 'UPDATE',
      after: {
        schedules: args.schedules.length,
      },
    },
  });
};

// ============================================================================
// Action: updateEmployeeServices
// ============================================================================
type UpdateEmployeeServicesInput = {
  employeeId: string;
  serviceIds: string[];
};

export const updateEmployeeServices: UpdateEmployeeServices<UpdateEmployeeServicesInput, void> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  const employee = await context.entities.Employee.findUnique({
    where: { id: args.employeeId },
  });

  if (!employee) {
    throw new HttpError(404, 'Colaborador não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, employee.salonId, 'employees:update', context.entities);

  // Remover todas as associações existentes
  await context.entities.EmployeeService.deleteMany({
    where: { employeeId: args.employeeId },
  });

  // Criar novas associações
  if (args.serviceIds && args.serviceIds.length > 0) {
    await context.entities.EmployeeService.createMany({
      data: args.serviceIds.map((serviceId) => ({
        employeeId: args.employeeId,
        serviceId,
      })),
    });
  }

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'EmployeeService',
      entityId: employee.id,
      action: 'UPDATE',
      after: {
        services: args.serviceIds.length,
      },
    },
  });
};

// ============================================================================
// Utility Functions
// ============================================================================
function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B4D9', '#A8E6CF',
    '#FFD93D', '#6BCF7F', '#FF8B94', '#C7CEEA', '#FFDAC1'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
