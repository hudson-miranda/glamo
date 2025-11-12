import type { EmployeeService } from 'wasp/entities';
import type { 
  ListEmployeeServices,
  AssignServiceToEmployee,
  RemoveServiceFromEmployee,
  UpdateEmployeeServiceDetails
} from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Query: listEmployeeServices
// ============================================================================
type ListEmployeeServicesInput = {
  employeeId: string;
};

type ListEmployeeServicesOutput = {
  services: (EmployeeService & {
    service: {
      id: string;
      name: string;
      description: string | null;
      duration: number;
      price: number;
    };
  })[];
  total: number;
};

export const listEmployeeServices: ListEmployeeServices<ListEmployeeServicesInput, ListEmployeeServicesOutput> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  // Verificar se o employee existe e obter salonId
  const employee = await context.entities.Employee.findUnique({
    where: { id: args.employeeId },
    select: { id: true, salonId: true },
  });

  if (!employee) {
    throw new HttpError(404, 'Colaborador não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, employee.salonId, 'employees:read', context.entities);

  const where = {
    employeeId: args.employeeId,
  };

  const [services, total] = await Promise.all([
    context.entities.EmployeeService.findMany({
      where,
      include: {
        service: {
          select: {
            id: true,
            name: true,
            description: true,
            duration: true,
            price: true,
          },
        },
      },
      orderBy: {
        service: {
          name: 'asc',
        },
      },
    }),
    context.entities.EmployeeService.count({ where }),
  ]);

  return { services, total };
};

// ============================================================================
// Action: assignServiceToEmployee
// ============================================================================
type AssignServiceToEmployeeInput = {
  employeeId: string;
  serviceId: string;
  customDuration?: number;
  customPrice?: number;
  commission?: number;
};

export const assignServiceToEmployee: AssignServiceToEmployee<AssignServiceToEmployeeInput, EmployeeService> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  // Verificar se o employee existe e obter salonId
  const employee = await context.entities.Employee.findUnique({
    where: { id: args.employeeId },
    select: { id: true, salonId: true, name: true },
  });

  if (!employee) {
    throw new HttpError(404, 'Colaborador não encontrado');
  }

  // Verificar permissão
  await requirePermission(context.user, employee.salonId, 'employees:update', context.entities);

  // Verificar se o serviço existe e pertence ao mesmo salão
  const service = await context.entities.Service.findUnique({
    where: { id: args.serviceId },
    select: { id: true, salonId: true, name: true, deletedAt: true },
  });

  if (!service) {
    throw new HttpError(404, 'Serviço não encontrado');
  }

  if (service.salonId !== employee.salonId) {
    throw new HttpError(400, 'Serviço não pertence ao mesmo salão');
  }

  if (service.deletedAt) {
    throw new HttpError(400, 'Serviço está deletado');
  }

  // Validações
  if (args.customDuration !== undefined && args.customDuration <= 0) {
    throw new HttpError(400, 'Duração customizada deve ser maior que 0');
  }

  if (args.customPrice !== undefined && args.customPrice < 0) {
    throw new HttpError(400, 'Preço customizado não pode ser negativo');
  }

  if (args.commission !== undefined && (args.commission < 0 || args.commission > 100)) {
    throw new HttpError(400, 'Comissão deve estar entre 0 e 100');
  }

  // Verificar se já existe essa associação
  const existing = await context.entities.EmployeeService.findFirst({
    where: {
      employeeId: args.employeeId,
      serviceId: args.serviceId,
    },
  });

  if (existing) {
    throw new HttpError(400, 'Colaborador já está associado a este serviço');
  }

  // Criar associação
  const employeeService = await context.entities.EmployeeService.create({
    data: {
      employeeId: args.employeeId,
      serviceId: args.serviceId,
      customDuration: args.customDuration,
      customPrice: args.customPrice,
      commission: args.commission,
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          description: true,
          duration: true,
          price: true,
        },
      },
    },
  });

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'EmployeeService',
      entityId: employeeService.id,
      action: 'CREATE',
      after: {
        employeeId: args.employeeId,
        employeeName: employee.name,
        serviceId: args.serviceId,
        serviceName: service.name,
        customDuration: args.customDuration,
        customPrice: args.customPrice,
        commission: args.commission,
      },
    },
  });

  return employeeService;
};

// ============================================================================
// Action: updateEmployeeServiceDetails
// ============================================================================
type UpdateEmployeeServiceDetailsInput = {
  employeeServiceId: string;
  customDuration?: number | null;
  customPrice?: number | null;
  commission?: number | null;
};

export const updateEmployeeServiceDetails: UpdateEmployeeServiceDetails<UpdateEmployeeServiceDetailsInput, EmployeeService> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  // Verificar se a associação existe
  const employeeService = await context.entities.EmployeeService.findUnique({
    where: { id: args.employeeServiceId },
    include: {
      employee: {
        select: { id: true, salonId: true, name: true },
      },
      service: {
        select: { id: true, name: true },
      },
    },
  });

  if (!employeeService) {
    throw new HttpError(404, 'Associação não encontrada');
  }

  // Verificar permissão
  await requirePermission(context.user, employeeService.employee.salonId, 'employees:update', context.entities);

  // Validações
  if (args.customDuration !== undefined && args.customDuration !== null && args.customDuration <= 0) {
    throw new HttpError(400, 'Duração customizada deve ser maior que 0');
  }

  if (args.customPrice !== undefined && args.customPrice !== null && args.customPrice < 0) {
    throw new HttpError(400, 'Preço customizado não pode ser negativo');
  }

  if (args.commission !== undefined && args.commission !== null && (args.commission < 0 || args.commission > 100)) {
    throw new HttpError(400, 'Comissão deve estar entre 0 e 100');
  }

  const before = {
    customDuration: employeeService.customDuration,
    customPrice: employeeService.customPrice,
    commission: employeeService.commission,
  };

  // Atualizar detalhes
  const updated = await context.entities.EmployeeService.update({
    where: { id: args.employeeServiceId },
    data: {
      customDuration: args.customDuration,
      customPrice: args.customPrice,
      commission: args.commission,
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          description: true,
          duration: true,
          price: true,
        },
      },
    },
  });

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'EmployeeService',
      entityId: employeeService.id,
      action: 'UPDATE',
      before,
      after: {
        customDuration: updated.customDuration,
        customPrice: updated.customPrice,
        commission: updated.commission,
      },
    },
  });

  return updated;
};

// ============================================================================
// Action: removeServiceFromEmployee
// ============================================================================
type RemoveServiceFromEmployeeInput = {
  employeeServiceId: string;
};

export const removeServiceFromEmployee: RemoveServiceFromEmployee<RemoveServiceFromEmployeeInput, EmployeeService> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado');
  }

  // Verificar se a associação existe
  const employeeService = await context.entities.EmployeeService.findUnique({
    where: { id: args.employeeServiceId },
    include: {
      employee: {
        select: { id: true, salonId: true, name: true },
      },
      service: {
        select: { id: true, name: true },
      },
    },
  });

  if (!employeeService) {
    throw new HttpError(404, 'Associação não encontrada');
  }

  // Verificar permissão
  await requirePermission(context.user, employeeService.employee.salonId, 'employees:update', context.entities);

  // Verificar se há appointments futuros com esse employee e serviço
  const futureAppointments = await context.entities.Appointment.count({
    where: {
      employeeId: employeeService.employeeId,
      serviceId: employeeService.serviceId,
      date: {
        gte: new Date(),
      },
      status: {
        not: 'CANCELLED',
      },
    },
  });

  if (futureAppointments > 0) {
    throw new HttpError(
      400,
      `Não é possível remover este serviço. Existem ${futureAppointments} agendamento(s) futuro(s) com este colaborador e serviço.`
    );
  }

  // Deletar associação (permanente)
  const deleted = await context.entities.EmployeeService.delete({
    where: { id: args.employeeServiceId },
  });

  // Log da ação
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'EmployeeService',
      entityId: employeeService.id,
      action: 'DELETE',
      before: {
        employeeId: employeeService.employeeId,
        employeeName: employeeService.employee.name,
        serviceId: employeeService.serviceId,
        serviceName: employeeService.service.name,
      },
    },
  });

  return deleted;
};
