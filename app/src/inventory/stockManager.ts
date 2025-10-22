/**
 * Stock Management Helper
 * 
 * This module provides helper functions for stock management:
 * - Low stock detection and notification
 * - Stock movement validation
 * - Negative stock prevention
 */

import { createSystemNotification } from '../notifications/operations';

export type Product = {
  id: string;
  salonId: string;
  name: string;
  stockQuantity: number;
  minimumStock: number;
};

/**
 * Checks if a product is at or below minimum stock level
 * and creates a notification if needed.
 */
export async function checkLowStock(
  product: Product,
  context: any
): Promise<void> {
  if (product.stockQuantity <= product.minimumStock) {
    // Create a system notification for low stock
    // Find salon owner or managers to notify
    const usersToNotify = await context.entities.UserSalon.findMany({
      where: {
        salonId: product.salonId,
        isActive: true,
        userRoles: {
          some: {
            role: {
              name: {
                in: ['owner', 'manager'],
              },
            },
          },
        },
      },
      include: {
        user: true,
      },
    });

    // Create notification for each user
    for (const userSalon of usersToNotify) {
      try {
        await createSystemNotification(
          context.entities,
          userSalon.userId,
          product.salonId,
          'Low Stock Alert',
          `Product "${product.name}" is at or below minimum stock level. Current: ${product.stockQuantity}, Minimum: ${product.minimumStock}`,
          'WARNING',
          'INTERNAL'
        );
      } catch (error) {
        console.error(`Failed to create low stock notification for user ${userSalon.userId}:`, error);
      }
    }
  }
}

/**
 * Validates if a stock movement would result in negative stock.
 * Throws an error if the movement is invalid.
 */
export function validateStockMovement(
  currentStock: number,
  movementType: 'IN' | 'OUT' | 'ADJUST',
  quantity: number,
  allowNegative: boolean = false
): void {
  if (quantity < 0) {
    throw new Error('Quantity must be non-negative');
  }

  if (movementType === 'OUT' && !allowNegative) {
    const finalStock = currentStock - quantity;
    if (finalStock < 0) {
      throw new Error(`Insufficient stock. Available: ${currentStock}, Required: ${quantity}`);
    }
  }

  if (movementType === 'ADJUST' && !allowNegative && quantity < 0) {
    throw new Error('Cannot adjust stock to negative value');
  }
}

/**
 * Calculates the final stock quantity after a movement.
 */
export function calculateFinalStock(
  currentStock: number,
  movementType: 'IN' | 'OUT' | 'ADJUST',
  quantity: number
): number {
  switch (movementType) {
    case 'IN':
      return currentStock + quantity;
    case 'OUT':
      return currentStock - quantity;
    case 'ADJUST':
      return quantity; // Direct adjustment
    default:
      throw new Error('Invalid movement type');
  }
}

/**
 * Gets all products that are currently below minimum stock.
 */
export async function getLowStockProductsList(
  salonId: string,
  context: any
): Promise<Product[]> {
  const products = await context.entities.Product.findMany({
    where: {
      salonId,
      deletedAt: null,
    },
    select: {
      id: true,
      salonId: true,
      name: true,
      stockQuantity: true,
      minimumStock: true,
    },
  });

  return products.filter((p: Product) => p.stockQuantity <= p.minimumStock);
}

/**
 * Records a stock movement and updates the product quantity.
 * This is a helper function that combines the validation and recording.
 */
export async function recordStockMovementHelper(
  productId: string,
  movementType: 'IN' | 'OUT' | 'ADJUST',
  quantity: number,
  reason: string,
  context: any,
  allowNegative: boolean = false
): Promise<any> {
  const product = await context.entities.Product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Validate movement
  validateStockMovement(product.stockQuantity, movementType, quantity, allowNegative);

  // Calculate final stock
  const finalQuantity = calculateFinalStock(product.stockQuantity, movementType, quantity);

  // Update product stock
  await context.entities.Product.update({
    where: { id: productId },
    data: {
      stockQuantity: finalQuantity,
    },
  });

  // Record movement
  const stockRecord = await context.entities.StockRecord.create({
    data: {
      productId,
      movementType,
      quantity: movementType === 'ADJUST' ? finalQuantity : quantity,
      reason,
      previousQuantity: product.stockQuantity,
      finalQuantity,
    },
  });

  // Check if low stock notification should be sent
  if (finalQuantity <= product.minimumStock) {
    await checkLowStock(
      {
        ...product,
        stockQuantity: finalQuantity,
      },
      context
    );
  }

  return {
    stockRecord,
    previousQuantity: product.stockQuantity,
    finalQuantity,
  };
}
