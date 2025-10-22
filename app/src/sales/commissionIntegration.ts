/**
 * Commission Integration for Sales
 * 
 * This module integrates the commission calculator with sales operations.
 * It calculates commissions for services and products sold, taking into account:
 * - Service commission configurations
 * - Product commission configurations
 * - Professional and assistant roles
 * - Cost and non-commissionable values
 */

import { calculateCommission } from '../services/commissionCalculator';

export type SaleWithItems = {
  id: string;
  saleServices: Array<{
    id: string;
    serviceId: string;
    variantId?: string | null;
    finalPrice: number;
    service: {
      id: string;
      name: string;
      costValue: number;
      costValueType: 'FIXED' | 'PERCENT';
      nonCommissionableValue: number;
      nonCommissionableValueType: 'FIXED' | 'PERCENT';
      commissionConfig?: {
        id: string;
        serviceId: string;
        commissionType: 'SIMPLE' | 'ADVANCED';
        baseValueType: 'FIXED' | 'PERCENT';
        baseValue: number;
        soloValue: number;
        soloValueType: 'FIXED' | 'PERCENT';
        withAssistantValue: number;
        withAssistantValueType: 'FIXED' | 'PERCENT';
        asAssistantValue: number;
        asAssistantValueType: 'FIXED' | 'PERCENT';
        deductAssistantsFromProfessional: boolean;
      } | null;
    };
    variant?: {
      id: string;
      price: number;
      costValue: number;
      costValueType: 'FIXED' | 'PERCENT';
      nonCommissionableValue: number;
      nonCommissionableValueType: 'FIXED' | 'PERCENT';
    } | null;
  }>;
  saleProducts: Array<{
    id: string;
    productId: string;
    quantity: number;
    finalPrice: number;
    product: {
      id: string;
      name: string;
      saleCommissionValue: number;
      saleCommissionType: 'FIXED' | 'PERCENT';
    };
  }>;
};

export type CommissionResult = {
  professionalId: string;
  itemId: string; // ID of SaleService or SaleProduct
  itemType: 'SERVICE' | 'PRODUCT';
  commissionAmount: number;
  commissionableBase: number;
  details: any;
};

/**
 * Calculates commissions for all items in a sale.
 * Returns an array of commission results that can be stored in the database.
 * 
 * Note: This function calculates but does not persist commissions.
 * The caller is responsible for creating commission records.
 */
export async function calculateSaleCommissions(
  sale: SaleWithItems,
  context: any
): Promise<CommissionResult[]> {
  const commissions: CommissionResult[] = [];

  // Calculate commissions for services
  for (const saleService of sale.saleServices) {
    const service = saleService.service;
    const variant = saleService.variant;
    const commissionConfig = service.commissionConfig;

    if (!commissionConfig) {
      // No commission configuration, skip
      continue;
    }

    // Determine price and cost values (use variant if available)
    const price = variant ? variant.price : saleService.finalPrice;
    const costValue = variant ? variant.costValue : service.costValue;
    const costValueType = variant ? variant.costValueType : service.costValueType;
    const nonCommissionableValue = variant 
      ? variant.nonCommissionableValue 
      : service.nonCommissionableValue;
    const nonCommissionableValueType = variant 
      ? variant.nonCommissionableValueType 
      : service.nonCommissionableValueType;

    // TODO: Get professional and assistants from somewhere
    // For now, this is a placeholder. In a real implementation,
    // we'd need to track which professional performed the service
    // and which assistants helped.
    
    // This is a simplified example assuming solo work
    const commissionResult = calculateCommission(
      commissionConfig,
      {
        price,
        costValue,
        costValueType,
        nonCommissionableValue,
        nonCommissionableValueType,
      },
      'SOLO',
      0
    );

    commissions.push({
      professionalId: 'TODO', // Get from sale or service assignment
      itemId: saleService.id,
      itemType: 'SERVICE',
      commissionAmount: commissionResult.commissionValue,
      commissionableBase: commissionResult.commissionableBase,
      details: commissionResult,
    });
  }

  // Calculate commissions for products
  for (const saleProduct of sale.saleProducts) {
    const product = saleProduct.product;
    
    if (product.saleCommissionValue === 0) {
      // No commission for this product
      continue;
    }

    let commissionAmount = 0;
    if (product.saleCommissionType === 'FIXED') {
      commissionAmount = product.saleCommissionValue * saleProduct.quantity;
    } else {
      // PERCENT
      commissionAmount = (saleProduct.finalPrice * product.saleCommissionValue) / 100;
    }

    commissions.push({
      professionalId: 'TODO', // Get from sale employee
      itemId: saleProduct.id,
      itemType: 'PRODUCT',
      commissionAmount,
      commissionableBase: saleProduct.finalPrice,
      details: {
        commissionType: product.saleCommissionType,
        commissionValue: product.saleCommissionValue,
        quantity: saleProduct.quantity,
      },
    });
  }

  return commissions;
}

/**
 * Helper function to store commission records in the database.
 * This would be called after closing a sale.
 * 
 * Note: The actual database model for storing commissions is not defined yet.
 * This is a placeholder for future implementation.
 */
export async function storeCommissionRecords(
  saleId: string,
  commissions: CommissionResult[],
  context: any
): Promise<void> {
  // TODO: Implement commission record storage
  // This would create records in a Commission table that tracks:
  // - saleId
  // - professionalId
  // - itemId (SaleService or SaleProduct)
  // - itemType
  // - commissionAmount
  // - commissionableBase
  // - calculationDetails (JSON)
  // - createdAt
  
  console.log(`Would store ${commissions.length} commission records for sale ${saleId}`);
  
  // For now, just log the commissions that would be stored
  for (const commission of commissions) {
    console.log(`Commission: Professional ${commission.professionalId}, Item ${commission.itemId} (${commission.itemType}), Amount: ${commission.commissionAmount}`);
  }
}
