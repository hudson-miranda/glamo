import { HttpError } from 'wasp/server';
import type { 
  ListServices, 
  GetService, 
  CreateService, 
  UpdateService, 
  DeleteService,
  CreateServiceVariant,
  UpdateServiceVariant,
  DeleteServiceVariant,
  ManageCommissionConfig
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type ListServicesInput = {
  salonId: string;
  search?: string;
  page?: number;
  perPage?: number;
  includeDeleted?: boolean;
};

type ListServicesOutput = {
  services: any[];
  total: number;
  page: number;
  perPage: number;
};

type GetServiceInput = {
  serviceId: string;
  salonId: string;
};

type CreateServiceInput = {
  salonId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  hasVariants?: boolean;
  serviceRoomId?: string;
  costValue?: number;
  costValueType?: 'FIXED' | 'PERCENT';
  nonCommissionableValue?: number;
  nonCommissionableValueType?: 'FIXED' | 'PERCENT';
  cardColor?: string;
};

type UpdateServiceInput = {
  serviceId: string;
  salonId: string;
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  hasVariants?: boolean;
  serviceRoomId?: string;
  costValue?: number;
  costValueType?: 'FIXED' | 'PERCENT';
  nonCommissionableValue?: number;
  nonCommissionableValueType?: 'FIXED' | 'PERCENT';
  cardColor?: string;
};

type DeleteServiceInput = {
  serviceId: string;
  salonId: string;
};

type CreateServiceVariantInput = {
  serviceId: string;
  salonId: string;
  name: string;
  description?: string;
  duration: number;
  price: number;
  costValue?: number;
  costValueType?: 'FIXED' | 'PERCENT';
  nonCommissionableValue?: number;
  nonCommissionableValueType?: 'FIXED' | 'PERCENT';
};

type UpdateServiceVariantInput = {
  variantId: string;
  salonId: string;
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
  costValue?: number;
  costValueType?: 'FIXED' | 'PERCENT';
  nonCommissionableValue?: number;
  nonCommissionableValueType?: 'FIXED' | 'PERCENT';
};

type DeleteServiceVariantInput = {
  variantId: string;
  salonId: string;
};

type ManageCommissionConfigInput = {
  serviceId: string;
  salonId: string;
  commissionType: string;
  baseValueType: 'FIXED' | 'PERCENT';
  baseValue: number;
  deductAssistantsFromProfessional?: boolean;
  soloValue: number;
  soloValueType: 'FIXED' | 'PERCENT';
  withAssistantValue: number;
  withAssistantValueType: 'FIXED' | 'PERCENT';
  asAssistantValue: number;
  asAssistantValueType: 'FIXED' | 'PERCENT';
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists all services for a salon with optional search and pagination.
 * Permission required: can_view_services
 */
export const listServices: ListServices<ListServicesInput, ListServicesOutput> = async (
  { salonId, search = '', page = 1, perPage = 20, includeDeleted = false },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_services', context.entities);

  // Build search filter
  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const where = {
    salonId,
    ...(includeDeleted ? {} : { deletedAt: null }),
    ...searchFilter,
  };

  // Get total count
  const total = await context.entities.Service.count({ where });

  // Get paginated services
  const services = await context.entities.Service.findMany({
    where,
    skip: (page - 1) * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
    include: {
      serviceRoom: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      variants: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      },
      commissionConfig: true,
    },
  });

  return {
    services,
    total,
    page,
    perPage,
  };
};

/**
 * Gets detailed information about a specific service.
 * Permission required: can_view_services
 */
export const getService: GetService<GetServiceInput, any> = async (
  { serviceId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_services', context.entities);

  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    include: {
      serviceRoom: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true },
      },
      variants: {
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      },
      commissionConfig: true,
      categories: true,
    },
  });

  if (!service) {
    throw new HttpError(404, 'Service not found');
  }

  if (service.salonId !== salonId) {
    throw new HttpError(403, 'Service does not belong to this salon');
  }

  return service;
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new service.
 * Permission required: can_create_services
 */
export const createService: CreateService<CreateServiceInput, any> = async (
  { 
    salonId, 
    name, 
    description, 
    duration, 
    price,
    hasVariants = false,
    serviceRoomId,
    costValue = 0,
    costValueType = 'FIXED',
    nonCommissionableValue = 0,
    nonCommissionableValueType = 'FIXED',
    cardColor,
  },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_create_services', context.entities);

  // Validate inputs
  if (!name || name.trim().length === 0) {
    throw new HttpError(400, 'Service name is required');
  }

  if (duration <= 0) {
    throw new HttpError(400, 'Service duration must be greater than 0');
  }

  if (price < 0) {
    throw new HttpError(400, 'Service price cannot be negative');
  }

  // Validate serviceRoomId if provided
  if (serviceRoomId) {
    const room = await context.entities.ServiceRoom.findUnique({
      where: { id: serviceRoomId },
    });

    if (!room || room.salonId !== salonId) {
      throw new HttpError(400, 'Invalid service room');
    }
  }

  // Create the service
  const service = await context.entities.Service.create({
    data: {
      salonId,
      createdByUserId: context.user.id,
      name: name.trim(),
      description: description?.trim(),
      duration,
      price,
      hasVariants,
      serviceRoomId,
      costValue,
      costValueType,
      nonCommissionableValue,
      nonCommissionableValueType,
      cardColor,
    },
    include: {
      serviceRoom: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Log the creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Service',
      entityId: service.id,
      action: 'CREATE',
      before: null,
      after: {
        name: service.name,
        duration: service.duration,
        price: service.price,
        hasVariants: service.hasVariants,
      },
    },
  });

  return service;
};

/**
 * Updates an existing service.
 * Permission required: can_edit_services
 */
export const updateService: UpdateService<UpdateServiceInput, any> = async (
  { 
    serviceId, 
    salonId,
    name,
    description,
    duration,
    price,
    hasVariants,
    serviceRoomId,
    costValue,
    costValueType,
    nonCommissionableValue,
    nonCommissionableValueType,
    cardColor,
  },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Get existing service
  const existingService = await context.entities.Service.findUnique({
    where: { id: serviceId },
  });

  if (!existingService) {
    throw new HttpError(404, 'Service not found');
  }

  if (existingService.salonId !== salonId) {
    throw new HttpError(403, 'Service does not belong to this salon');
  }

  if (existingService.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted service');
  }

  // Validate inputs
  if (name !== undefined && name.trim().length === 0) {
    throw new HttpError(400, 'Service name cannot be empty');
  }

  if (duration !== undefined && duration <= 0) {
    throw new HttpError(400, 'Service duration must be greater than 0');
  }

  if (price !== undefined && price < 0) {
    throw new HttpError(400, 'Service price cannot be negative');
  }

  // Validate serviceRoomId if provided
  if (serviceRoomId !== undefined && serviceRoomId !== null) {
    const room = await context.entities.ServiceRoom.findUnique({
      where: { id: serviceRoomId },
    });

    if (!room || room.salonId !== salonId) {
      throw new HttpError(400, 'Invalid service room');
    }
  }

  // Prepare update data
  const updateData: any = {
    updatedByUserId: context.user.id,
  };

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim();
  if (duration !== undefined) updateData.duration = duration;
  if (price !== undefined) updateData.price = price;
  if (hasVariants !== undefined) updateData.hasVariants = hasVariants;
  if (serviceRoomId !== undefined) updateData.serviceRoomId = serviceRoomId;
  if (costValue !== undefined) updateData.costValue = costValue;
  if (costValueType !== undefined) updateData.costValueType = costValueType;
  if (nonCommissionableValue !== undefined) updateData.nonCommissionableValue = nonCommissionableValue;
  if (nonCommissionableValueType !== undefined) updateData.nonCommissionableValueType = nonCommissionableValueType;
  if (cardColor !== undefined) updateData.cardColor = cardColor;

  // Update the service
  const service = await context.entities.Service.update({
    where: { id: serviceId },
    data: updateData,
    include: {
      serviceRoom: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      updatedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Log the update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Service',
      entityId: service.id,
      action: 'UPDATE',
      before: {
        name: existingService.name,
        duration: existingService.duration,
        price: existingService.price,
      },
      after: {
        name: service.name,
        duration: service.duration,
        price: service.price,
      },
    },
  });

  return service;
};

/**
 * Soft deletes a service.
 * Permission required: can_delete_services
 */
export const deleteService: DeleteService<DeleteServiceInput, any> = async (
  { serviceId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_delete_services', context.entities);

  // Get existing service
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    include: {
      appointmentServices: {
        where: {
          appointment: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'],
            },
          },
        },
      },
    },
  });

  if (!service) {
    throw new HttpError(404, 'Service not found');
  }

  if (service.salonId !== salonId) {
    throw new HttpError(403, 'Service does not belong to this salon');
  }

  if (service.deletedAt) {
    throw new HttpError(400, 'Service is already deleted');
  }

  // Check for active appointments
  if (service.appointmentServices.length > 0) {
    throw new HttpError(
      400,
      'Cannot delete service with active appointments. Please cancel or complete appointments first.'
    );
  }

  // Soft delete the service
  const deletedService = await context.entities.Service.update({
    where: { id: serviceId },
    data: {
      deletedAt: new Date(),
      updatedByUserId: context.user.id,
    },
  });

  // Log the deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Service',
      entityId: service.id,
      action: 'DELETE',
      before: {
        name: service.name,
        deletedAt: null,
      },
      after: {
        name: service.name,
        deletedAt: deletedService.deletedAt,
      },
    },
  });

  return { success: true, message: 'Service deleted successfully' };
};

/**
 * Creates a new service variant.
 * Permission required: can_create_services
 */
export const createServiceVariant: CreateServiceVariant<CreateServiceVariantInput, any> = async (
  {
    serviceId,
    salonId,
    name,
    description,
    duration,
    price,
    costValue = 0,
    costValueType = 'FIXED',
    nonCommissionableValue = 0,
    nonCommissionableValueType = 'FIXED',
  },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_create_services', context.entities);

  // Validate service exists and belongs to salon
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
    throw new HttpError(400, 'Cannot add variant to deleted service');
  }

  // Validate inputs
  if (!name || name.trim().length === 0) {
    throw new HttpError(400, 'Variant name is required');
  }

  if (duration <= 0) {
    throw new HttpError(400, 'Variant duration must be greater than 0');
  }

  if (price < 0) {
    throw new HttpError(400, 'Variant price cannot be negative');
  }

  // Create the variant
  const variant = await context.entities.ServiceVariant.create({
    data: {
      serviceId,
      name: name.trim(),
      description: description?.trim(),
      duration,
      price,
      costValue,
      costValueType,
      nonCommissionableValue,
      nonCommissionableValueType,
    },
  });

  // Update service to mark it has variants
  if (!service.hasVariants) {
    await context.entities.Service.update({
      where: { id: serviceId },
      data: {
        hasVariants: true,
        updatedByUserId: context.user.id,
      },
    });
  }

  // Log the creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceVariant',
      entityId: variant.id,
      action: 'CREATE',
      before: null,
      after: {
        serviceId,
        name: variant.name,
        duration: variant.duration,
        price: variant.price,
      },
    },
  });

  return variant;
};

/**
 * Updates an existing service variant.
 * Permission required: can_edit_services
 */
export const updateServiceVariant: UpdateServiceVariant<UpdateServiceVariantInput, any> = async (
  {
    variantId,
    salonId,
    name,
    description,
    duration,
    price,
    costValue,
    costValueType,
    nonCommissionableValue,
    nonCommissionableValueType,
  },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Get existing variant with service
  const existingVariant = await context.entities.ServiceVariant.findUnique({
    where: { id: variantId },
    include: { service: true },
  });

  if (!existingVariant) {
    throw new HttpError(404, 'Service variant not found');
  }

  if (existingVariant.service.salonId !== salonId) {
    throw new HttpError(403, 'Service variant does not belong to this salon');
  }

  if (existingVariant.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted variant');
  }

  // Validate inputs
  if (name !== undefined && name.trim().length === 0) {
    throw new HttpError(400, 'Variant name cannot be empty');
  }

  if (duration !== undefined && duration <= 0) {
    throw new HttpError(400, 'Variant duration must be greater than 0');
  }

  if (price !== undefined && price < 0) {
    throw new HttpError(400, 'Variant price cannot be negative');
  }

  // Prepare update data
  const updateData: any = {};

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim();
  if (duration !== undefined) updateData.duration = duration;
  if (price !== undefined) updateData.price = price;
  if (costValue !== undefined) updateData.costValue = costValue;
  if (costValueType !== undefined) updateData.costValueType = costValueType;
  if (nonCommissionableValue !== undefined) updateData.nonCommissionableValue = nonCommissionableValue;
  if (nonCommissionableValueType !== undefined) updateData.nonCommissionableValueType = nonCommissionableValueType;

  // Update the variant
  const variant = await context.entities.ServiceVariant.update({
    where: { id: variantId },
    data: updateData,
  });

  // Log the update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceVariant',
      entityId: variant.id,
      action: 'UPDATE',
      before: {
        name: existingVariant.name,
        duration: existingVariant.duration,
        price: existingVariant.price,
      },
      after: {
        name: variant.name,
        duration: variant.duration,
        price: variant.price,
      },
    },
  });

  return variant;
};

/**
 * Soft deletes a service variant.
 * Permission required: can_delete_services
 */
export const deleteServiceVariant: DeleteServiceVariant<DeleteServiceVariantInput, any> = async (
  { variantId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_delete_services', context.entities);

  // Get existing variant with service
  const variant = await context.entities.ServiceVariant.findUnique({
    where: { id: variantId },
    include: {
      service: true,
      appointmentServices: {
        where: {
          appointment: {
            status: {
              in: ['PENDING', 'CONFIRMED', 'IN_SERVICE'],
            },
          },
        },
      },
    },
  });

  if (!variant) {
    throw new HttpError(404, 'Service variant not found');
  }

  if (variant.service.salonId !== salonId) {
    throw new HttpError(403, 'Service variant does not belong to this salon');
  }

  if (variant.deletedAt) {
    throw new HttpError(400, 'Variant is already deleted');
  }

  // Check for active appointments
  if (variant.appointmentServices.length > 0) {
    throw new HttpError(
      400,
      'Cannot delete variant with active appointments. Please cancel or complete appointments first.'
    );
  }

  // Soft delete the variant
  const deletedVariant = await context.entities.ServiceVariant.update({
    where: { id: variantId },
    data: {
      deletedAt: new Date(),
    },
  });

  // Log the deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceVariant',
      entityId: variant.id,
      action: 'DELETE',
      before: {
        name: variant.name,
        deletedAt: null,
      },
      after: {
        name: variant.name,
        deletedAt: deletedVariant.deletedAt,
      },
    },
  });

  return { success: true, message: 'Service variant deleted successfully' };
};

/**
 * Creates or updates commission configuration for a service.
 * Permission required: can_manage_commissions
 */
export const manageCommissionConfig: ManageCommissionConfig<ManageCommissionConfigInput, any> = async (
  {
    serviceId,
    salonId,
    commissionType,
    baseValueType,
    baseValue,
    deductAssistantsFromProfessional = false,
    soloValue,
    soloValueType,
    withAssistantValue,
    withAssistantValueType,
    asAssistantValue,
    asAssistantValueType,
  },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_manage_commissions', context.entities);

  // Validate service exists and belongs to salon
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    include: { commissionConfig: true },
  });

  if (!service) {
    throw new HttpError(404, 'Service not found');
  }

  if (service.salonId !== salonId) {
    throw new HttpError(403, 'Service does not belong to this salon');
  }

  if (service.deletedAt) {
    throw new HttpError(400, 'Cannot manage commission for deleted service');
  }

  // Validate commission values
  if (baseValue < 0 || soloValue < 0 || withAssistantValue < 0 || asAssistantValue < 0) {
    throw new HttpError(400, 'Commission values cannot be negative');
  }

  const configData = {
    commissionType,
    baseValueType,
    baseValue,
    deductAssistantsFromProfessional,
    soloValue,
    soloValueType,
    withAssistantValue,
    withAssistantValueType,
    asAssistantValue,
    asAssistantValueType,
  };

  let commissionConfig;
  let action = 'UPDATE';

  if (service.commissionConfig) {
    // Update existing config
    commissionConfig = await context.entities.CommissionConfig.update({
      where: { id: service.commissionConfig.id },
      data: configData,
    });
  } else {
    // Create new config
    action = 'CREATE';
    commissionConfig = await context.entities.CommissionConfig.create({
      data: {
        serviceId,
        ...configData,
      },
    });
  }

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'CommissionConfig',
      entityId: commissionConfig.id,
      action,
      before: service.commissionConfig ? {
        soloValue: service.commissionConfig.soloValue,
        withAssistantValue: service.commissionConfig.withAssistantValue,
        asAssistantValue: service.commissionConfig.asAssistantValue,
      } : null,
      after: {
        soloValue: commissionConfig.soloValue,
        withAssistantValue: commissionConfig.withAssistantValue,
        asAssistantValue: commissionConfig.asAssistantValue,
      },
    },
  });

  return commissionConfig;
};
