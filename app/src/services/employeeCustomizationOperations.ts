import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type { 
  ListServiceEmployeeCustomizations,
  GetServiceEmployeeCustomization,
  CreateServiceEmployeeCustomization,
  UpdateServiceEmployeeCustomization,
  DeleteServiceEmployeeCustomization,
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type ListServiceEmployeeCustomizationsInput = {
  salonId: string;
  serviceId?: string;
  employeeId?: string;
};

type GetServiceEmployeeCustomizationInput = {
  customizationId: string;
  salonId: string;
};

type CreateServiceEmployeeCustomizationInput = {
  salonId: string;
  serviceId: string;
  employeeId: string;
  price?: number;
  duration?: number;
  costValue?: number;
  costValueType?: 'FIXED' | 'PERCENT';
  allowOnlineBooking?: boolean;
};

type UpdateServiceEmployeeCustomizationInput = {
  customizationId: string;
  salonId: string;
  price?: number;
  duration?: number;
  costValue?: number;
  costValueType?: 'FIXED' | 'PERCENT';
  allowOnlineBooking?: boolean;
};

type DeleteServiceEmployeeCustomizationInput = {
  customizationId: string;
  salonId: string;
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists employee customizations.
 * Can filter by serviceId or employeeId.
 * Permission required: can_view_services
 */
export const listServiceEmployeeCustomizations: ListServiceEmployeeCustomizations<ListServiceEmployeeCustomizationsInput, any> = async (
  { salonId, serviceId, employeeId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_services', context.entities);

  // Build where clause
  const where: any = {};

  if (serviceId) {
    // Verify service belongs to salon
    const service = await context.entities.Service.findUnique({
      where: { id: serviceId },
    });

    if (!service || service.salonId !== salonId) {
      throw new HttpError(403, 'Service does not belong to this salon');
    }

    where.serviceId = serviceId;
  }

  if (employeeId) {
    // Verify employee belongs to salon
    const employee = await context.entities.Employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.salonId !== salonId) {
      throw new HttpError(403, 'Employee does not belong to this salon');
    }

    where.employeeId = employeeId;
  }

  // If neither filter is provided, get all for salon via service relation
  if (!serviceId && !employeeId) {
    const services = await context.entities.Service.findMany({
      where: { salonId },
      select: { id: true },
    });

    where.serviceId = { in: services.map(s => s.id) };
  }

  // Get customizations
  const customizations = await context.entities.ServiceEmployeeCustomization.findMany({
    where,
    include: {
      service: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { service: { name: 'asc' } },
      { employee: { name: 'asc' } },
    ],
  });

  return customizations;
};

/**
 * Gets a single customization by ID.
 * Permission required: can_view_services
 */
export const getServiceEmployeeCustomization: GetServiceEmployeeCustomization<GetServiceEmployeeCustomizationInput, any> = async (
  { customizationId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_services', context.entities);

  // Get customization
  const customization = await context.entities.ServiceEmployeeCustomization.findUnique({
    where: { id: customizationId },
    include: {
      service: true,
      employee: true,
    },
  });

  if (!customization) {
    throw new HttpError(404, 'Customization not found');
  }

  if (customization.service.salonId !== salonId) {
    throw new HttpError(403, 'Customization does not belong to this salon');
  }

  return customization;
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new employee customization.
 * Permission required: can_edit_services
 */
export const createServiceEmployeeCustomization: CreateServiceEmployeeCustomization<CreateServiceEmployeeCustomizationInput, any> = async (
  { salonId, serviceId, employeeId, price, duration, costValue, costValueType, allowOnlineBooking },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Verify service belongs to salon
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new HttpError(404, 'Service not found');
  }

  if (service.salonId !== salonId) {
    throw new HttpError(403, 'Service does not belong to this salon');
  }

  if (service.deletedAt) {
    throw new HttpError(400, 'Cannot add customization to deleted service');
  }

  // Verify employee belongs to salon
  const employee = await context.entities.Employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee) {
    throw new HttpError(404, 'Employee not found');
  }

  if (employee.salonId !== salonId) {
    throw new HttpError(403, 'Employee does not belong to this salon');
  }

  if (employee.deletedAt) {
    throw new HttpError(400, 'Cannot add customization for deleted employee');
  }

  // Check for existing customization
  const existingCustomization = await context.entities.ServiceEmployeeCustomization.findUnique({
    where: {
      serviceId_employeeId: {
        serviceId,
        employeeId,
      },
    },
  });

  if (existingCustomization) {
    throw new HttpError(400, 'Customization for this service and employee already exists');
  }

  // Validate inputs
  if (price !== undefined && price < 0) {
    throw new HttpError(400, 'Price cannot be negative');
  }

  if (duration !== undefined && duration <= 0) {
    throw new HttpError(400, 'Duration must be greater than 0');
  }

  if (costValue !== undefined && costValue < 0) {
    throw new HttpError(400, 'Cost value cannot be negative');
  }

  if (costValueType !== undefined && costValueType !== 'FIXED' && costValueType !== 'PERCENT') {
    throw new HttpError(400, 'Invalid cost value type. Must be FIXED or PERCENT');
  }

  if (costValueType === 'PERCENT' && costValue !== undefined && costValue > 100) {
    throw new HttpError(400, 'Percentage cost value cannot exceed 100%');
  }

  // Create the customization
  const customization = await context.entities.ServiceEmployeeCustomization.create({
    data: {
      serviceId,
      employeeId,
      price,
      duration,
      costValue,
      costValueType,
      allowOnlineBooking,
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Log the creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceEmployeeCustomization',
      entityId: customization.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: customization,
    },
  });

  return customization;
};

/**
 * Updates an employee customization.
 * Permission required: can_edit_services
 */
export const updateServiceEmployeeCustomization: UpdateServiceEmployeeCustomization<UpdateServiceEmployeeCustomizationInput, any> = async (
  { customizationId, salonId, price, duration, costValue, costValueType, allowOnlineBooking },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Get existing customization
  const existingCustomization = await context.entities.ServiceEmployeeCustomization.findUnique({
    where: { id: customizationId },
    include: {
      service: true,
    },
  });

  if (!existingCustomization) {
    throw new HttpError(404, 'Customization not found');
  }

  if (existingCustomization.service.salonId !== salonId) {
    throw new HttpError(403, 'Customization does not belong to this salon');
  }

  // Validate inputs
  if (price !== undefined && price < 0) {
    throw new HttpError(400, 'Price cannot be negative');
  }

  if (duration !== undefined && duration <= 0) {
    throw new HttpError(400, 'Duration must be greater than 0');
  }

  if (costValue !== undefined && costValue < 0) {
    throw new HttpError(400, 'Cost value cannot be negative');
  }

  if (costValueType !== undefined && costValueType !== 'FIXED' && costValueType !== 'PERCENT') {
    throw new HttpError(400, 'Invalid cost value type. Must be FIXED or PERCENT');
  }

  if (costValueType === 'PERCENT' && costValue !== undefined && costValue > 100) {
    throw new HttpError(400, 'Percentage cost value cannot exceed 100%');
  }

  // Prepare update data
  const updateData: any = {};

  if (price !== undefined) updateData.price = price;
  if (duration !== undefined) updateData.duration = duration;
  if (costValue !== undefined) updateData.costValue = costValue;
  if (costValueType !== undefined) updateData.costValueType = costValueType;
  if (allowOnlineBooking !== undefined) updateData.allowOnlineBooking = allowOnlineBooking;

  // Update the customization
  const customization = await context.entities.ServiceEmployeeCustomization.update({
    where: { id: customizationId },
    data: updateData,
    include: {
      service: {
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
        },
      },
      employee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Log the update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceEmployeeCustomization',
      entityId: customization.id,
      action: 'UPDATE',
      before: existingCustomization,
      after: customization,
    },
  });

  return customization;
};

/**
 * Deletes an employee customization.
 * Permission required: can_edit_services
 */
export const deleteServiceEmployeeCustomization: DeleteServiceEmployeeCustomization<DeleteServiceEmployeeCustomizationInput, any> = async (
  { customizationId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Get existing customization
  const existingCustomization = await context.entities.ServiceEmployeeCustomization.findUnique({
    where: { id: customizationId },
    include: {
      service: true,
    },
  });

  if (!existingCustomization) {
    throw new HttpError(404, 'Customization not found');
  }

  if (existingCustomization.service.salonId !== salonId) {
    throw new HttpError(403, 'Customization does not belong to this salon');
  }

  // Delete the customization
  await context.entities.ServiceEmployeeCustomization.delete({
    where: { id: customizationId },
  });

  // Log the deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceEmployeeCustomization',
      entityId: existingCustomization.id,
      action: 'DELETE',
      before: existingCustomization,
      after: Prisma.DbNull,
    },
  });

  return { success: true, message: 'Customization deleted successfully' };
};
