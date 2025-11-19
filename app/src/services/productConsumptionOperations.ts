import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type { 
  ListServiceProductConsumptions,
  CreateServiceProductConsumption,
  UpdateServiceProductConsumption,
  DeleteServiceProductConsumption,
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type ListServiceProductConsumptionsInput = {
  salonId: string;
  serviceId?: string;
  productId?: string;
};

type CreateServiceProductConsumptionInput = {
  salonId: string;
  serviceId: string;
  productId: string;
  quantity: number;
};

type UpdateServiceProductConsumptionInput = {
  consumptionId: string;
  salonId: string;
  quantity: number;
};

type DeleteServiceProductConsumptionInput = {
  consumptionId: string;
  salonId: string;
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists product consumptions.
 * Can filter by serviceId or productId.
 * Permission required: can_view_services
 */
export const listServiceProductConsumptions: ListServiceProductConsumptions<ListServiceProductConsumptionsInput, any> = async (
  { salonId, serviceId, productId },
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

  if (productId) {
    // Verify product belongs to salon
    const product = await context.entities.Product.findUnique({
      where: { id: productId },
    });

    if (!product || product.salonId !== salonId) {
      throw new HttpError(403, 'Product does not belong to this salon');
    }

    where.productId = productId;
  }

  // If neither filter is provided, get all for salon via service relation
  if (!serviceId && !productId) {
    const services = await context.entities.Service.findMany({
      where: { salonId },
      select: { id: true },
    });

    where.serviceId = { in: services.map(s => s.id) };
  }

  // Get consumptions
  const consumptions = await context.entities.ServiceProductConsumption.findMany({
    where,
    include: {
      service: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          unitOfMeasure: true,
          stockQuantity: true,
          minimumStock: true,
        },
      },
    },
    orderBy: [
      { service: { name: 'asc' } },
      { product: { name: 'asc' } },
    ],
  });

  return consumptions;
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new product consumption link.
 * Permission required: can_edit_services
 */
export const createServiceProductConsumption: CreateServiceProductConsumption<CreateServiceProductConsumptionInput, any> = async (
  { salonId, serviceId, productId, quantity },
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
    throw new HttpError(400, 'Cannot add product to deleted service');
  }

  // Verify product belongs to salon
  const product = await context.entities.Product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  if (product.salonId !== salonId) {
    throw new HttpError(403, 'Product does not belong to this salon');
  }

  if (product.deletedAt) {
    throw new HttpError(400, 'Cannot link deleted product');
  }

  // Check for existing link
  const existingConsumption = await context.entities.ServiceProductConsumption.findUnique({
    where: {
      serviceId_productId: {
        serviceId,
        productId,
      },
    },
  });

  if (existingConsumption) {
    throw new HttpError(400, 'This product is already linked to this service');
  }

  // Validate quantity
  if (!quantity || quantity <= 0) {
    throw new HttpError(400, 'Quantity must be greater than 0');
  }

  // Create the consumption link
  const consumption = await context.entities.ServiceProductConsumption.create({
    data: {
      serviceId,
      productId,
      quantity,
    },
    include: {
      service: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          unitOfMeasure: true,
          stockQuantity: true,
          minimumStock: true,
        },
      },
    },
  });

  // Log the creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceProductConsumption',
      entityId: consumption.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: consumption,
    },
  });

  return consumption;
};

/**
 * Updates product consumption quantity.
 * Permission required: can_edit_services
 */
export const updateServiceProductConsumption: UpdateServiceProductConsumption<UpdateServiceProductConsumptionInput, any> = async (
  { consumptionId, salonId, quantity },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Get existing consumption
  const existingConsumption = await context.entities.ServiceProductConsumption.findUnique({
    where: { id: consumptionId },
    include: {
      service: true,
      product: true,
    },
  });

  if (!existingConsumption) {
    throw new HttpError(404, 'Product consumption not found');
  }

  if (existingConsumption.service.salonId !== salonId) {
    throw new HttpError(403, 'Product consumption does not belong to this salon');
  }

  // Validate quantity
  if (!quantity || quantity <= 0) {
    throw new HttpError(400, 'Quantity must be greater than 0');
  }

  // Update the consumption
  const consumption = await context.entities.ServiceProductConsumption.update({
    where: { id: consumptionId },
    data: { quantity },
    include: {
      service: {
        select: {
          id: true,
          name: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          unitOfMeasure: true,
          stockQuantity: true,
          minimumStock: true,
        },
      },
    },
  });

  // Log the update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceProductConsumption',
      entityId: consumption.id,
      action: 'UPDATE',
      before: existingConsumption,
      after: consumption,
    },
  });

  return consumption;
};

/**
 * Deletes a product consumption link.
 * Permission required: can_edit_services
 */
export const deleteServiceProductConsumption: DeleteServiceProductConsumption<DeleteServiceProductConsumptionInput, any> = async (
  { consumptionId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Get existing consumption
  const existingConsumption = await context.entities.ServiceProductConsumption.findUnique({
    where: { id: consumptionId },
    include: {
      service: true,
    },
  });

  if (!existingConsumption) {
    throw new HttpError(404, 'Product consumption not found');
  }

  if (existingConsumption.service.salonId !== salonId) {
    throw new HttpError(403, 'Product consumption does not belong to this salon');
  }

  // Delete the consumption
  await context.entities.ServiceProductConsumption.delete({
    where: { id: consumptionId },
  });

  // Log the deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ServiceProductConsumption',
      entityId: existingConsumption.id,
      action: 'DELETE',
      before: existingConsumption,
      after: Prisma.DbNull,
    },
  });

  return { success: true, message: 'Product consumption deleted successfully' };
};
