import { HttpError } from 'wasp/server';
import type { 
  ListProducts,
  GetProduct,
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
  RecordStockMovement,
  GetLowStockProducts,
  ListProductCategories,
  CreateProductCategory,
  UpdateProductCategory,
  DeleteProductCategory,
  ListProductBrands,
  CreateProductBrand,
  UpdateProductBrand,
  DeleteProductBrand,
  ListSuppliers,
  CreateSupplier,
  UpdateSupplier,
  DeleteSupplier
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';
import { checkLowStock } from './stockManager';

// ============================================================================
// Types - Products
// ============================================================================

type ListProductsInput = {
  salonId: string;
  search?: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  lowStock?: boolean;
  page?: number;
  perPage?: number;
  includeDeleted?: boolean;
};

type ListProductsOutput = {
  products: any[];
  total: number;
  page: number;
  perPage: number;
};

type GetProductInput = {
  productId: string;
  salonId: string;
};

type CreateProductInput = {
  salonId: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  name: string;
  costPrice: number;
  salePrice: number;
  initialStock?: number;
  minimumStock?: number;
  saleCommissionValue?: number;
  saleCommissionType?: 'FIXED' | 'PERCENT';
  unitOfMeasure?: string;
  quantityPerPackage?: number;
  barcode?: string;
  sku?: string;
};

type UpdateProductInput = {
  productId: string;
  salonId: string;
  categoryId?: string;
  brandId?: string;
  supplierId?: string;
  name?: string;
  costPrice?: number;
  salePrice?: number;
  minimumStock?: number;
  saleCommissionValue?: number;
  saleCommissionType?: 'FIXED' | 'PERCENT';
  unitOfMeasure?: string;
  quantityPerPackage?: number;
  barcode?: string;
  sku?: string;
};

type DeleteProductInput = {
  productId: string;
  salonId: string;
};

type RecordStockMovementInput = {
  productId: string;
  salonId: string;
  movementType: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason?: string;
};

type GetLowStockProductsInput = {
  salonId: string;
};

// ============================================================================
// Types - Categories
// ============================================================================

type ListProductCategoriesInput = {
  salonId: string;
  includeDeleted?: boolean;
};

type CreateProductCategoryInput = {
  salonId: string;
  name: string;
  description?: string;
};

type UpdateProductCategoryInput = {
  categoryId: string;
  salonId: string;
  name?: string;
  description?: string;
};

type DeleteProductCategoryInput = {
  categoryId: string;
  salonId: string;
};

// ============================================================================
// Types - Brands
// ============================================================================

type ListProductBrandsInput = {
  salonId: string;
  includeDeleted?: boolean;
};

type CreateProductBrandInput = {
  salonId: string;
  name: string;
  description?: string;
};

type UpdateProductBrandInput = {
  brandId: string;
  salonId: string;
  name?: string;
  description?: string;
};

type DeleteProductBrandInput = {
  brandId: string;
  salonId: string;
};

// ============================================================================
// Types - Suppliers
// ============================================================================

type ListSuppliersInput = {
  salonId: string;
  search?: string;
  includeDeleted?: boolean;
};

type CreateSupplierInput = {
  salonId: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  phoneType?: string;
  phone2?: string;
  phoneType2?: string;
  contactName?: string;
  cnpj?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

type UpdateSupplierInput = {
  supplierId: string;
  salonId: string;
  name?: string;
  description?: string;
  email?: string;
  phone?: string;
  phoneType?: string;
  phone2?: string;
  phoneType2?: string;
  contactName?: string;
  cnpj?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

type DeleteSupplierInput = {
  supplierId: string;
  salonId: string;
};

// ============================================================================
// Queries - Products
// ============================================================================

/**
 * Lists products with filtering and pagination.
 * Permission required: can_view_products
 */
export const listProducts: ListProducts<ListProductsInput, ListProductsOutput> = async (
  { salonId, search, categoryId, brandId, supplierId, lowStock, page = 1, perPage = 20, includeDeleted = false },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_products', context.entities);

  const where: any = {
    salonId,
  };

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { barcode: { contains: search, mode: 'insensitive' } },
      { sku: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (brandId) {
    where.brandId = brandId;
  }

  if (supplierId) {
    where.supplierId = supplierId;
  }

  const [products, total] = await Promise.all([
    context.entities.Product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    context.entities.Product.count({ where }),
  ]);

  // Filter low stock products if requested
  let filteredProducts = products;
  if (lowStock) {
    filteredProducts = products.filter(p => p.stockQuantity <= p.minimumStock);
  }

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Product',
      entityId: salonId,
      action: 'LIST',
      before: null,
      after: { filters: { search, categoryId, brandId, supplierId, lowStock } },
    },
  });

  return {
    products: filteredProducts,
    total: lowStock ? filteredProducts.length : total,
    page,
    perPage,
  };
};

/**
 * Gets detailed information about a specific product.
 * Permission required: can_view_products
 */
export const getProduct: GetProduct<GetProductInput, any> = async (
  { productId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_products', context.entities);

  const product = await context.entities.Product.findUnique({
    where: { id: productId },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
      category: true,
      brand: true,
      supplier: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      updatedBy: {
        select: {
          id: true,
          name: true,
        },
      },
      stockRecords: {
        orderBy: { createdAt: 'desc' },
        take: 20, // Last 20 movements
      },
    },
  });

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  if (product.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this product');
  }

  // Log access
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Product',
      entityId: productId,
      action: 'VIEW',
      before: null,
      after: null,
    },
  });

  return product;
};

/**
 * Gets products that are below or at minimum stock level.
 * Permission required: can_view_products
 */
export const getLowStockProducts: GetLowStockProducts<GetLowStockProductsInput, any> = async (
  { salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_products', context.entities);

  const products = await context.entities.Product.findMany({
    where: {
      salonId,
      deletedAt: null,
    },
    include: {
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      brand: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Filter products with low stock
  const lowStockProducts = products.filter(p => p.stockQuantity <= p.minimumStock);

  return {
    products: lowStockProducts,
    total: lowStockProducts.length,
  };
};

// ============================================================================
// Actions - Products
// ============================================================================

/**
 * Creates a new product with initial stock.
 * Permission required: can_create_products
 */
export const createProduct: CreateProduct<CreateProductInput, any> = async (
  { salonId, categoryId, brandId, supplierId, name, costPrice, salePrice, initialStock = 0, minimumStock = 0, 
    saleCommissionValue = 0, saleCommissionType = 'FIXED', unitOfMeasure, quantityPerPackage = 1, barcode, sku },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_create_products', context.entities);

  // Validate prices
  if (costPrice < 0 || salePrice < 0) {
    throw new HttpError(400, 'Prices must be non-negative');
  }

  if (initialStock < 0 || minimumStock < 0) {
    throw new HttpError(400, 'Stock quantities must be non-negative');
  }

  // Validate category if provided
  if (categoryId) {
    const category = await context.entities.ProductCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category || category.salonId !== salonId || category.deletedAt) {
      throw new HttpError(400, 'Product category not found');
    }
  }

  // Validate brand if provided
  if (brandId) {
    const brand = await context.entities.ProductBrand.findUnique({
      where: { id: brandId },
    });

    if (!brand || brand.salonId !== salonId || brand.deletedAt) {
      throw new HttpError(400, 'Product brand not found');
    }
  }

  // Validate supplier if provided
  if (supplierId) {
    const supplier = await context.entities.Supplier.findUnique({
      where: { id: supplierId },
    });

    if (!supplier || supplier.salonId !== salonId || supplier.deletedAt) {
      throw new HttpError(400, 'Supplier not found');
    }
  }

  // Create product
  const product = await context.entities.Product.create({
    data: {
      salonId,
      categoryId,
      brandId,
      supplierId,
      createdByUserId: context.user.id,
      name,
      costPrice,
      salePrice,
      stockQuantity: initialStock,
      initialStock,
      minimumStock,
      saleCommissionValue,
      saleCommissionType,
      unitOfMeasure,
      quantityPerPackage,
      barcode,
      sku,
    },
    include: {
      category: true,
      brand: true,
      supplier: true,
    },
  });

  // Record initial stock if any
  if (initialStock > 0) {
    await context.entities.StockRecord.create({
      data: {
        productId: product.id,
        movementType: 'IN',
        quantity: initialStock,
        reason: 'Initial stock',
        previousQuantity: 0,
        finalQuantity: initialStock,
      },
    });
  }

  // Log creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Product',
      entityId: product.id,
      action: 'CREATE',
      before: null,
      after: { name, costPrice, salePrice, initialStock },
    },
  });

  // Check if low stock notification should be sent
  await checkLowStock(product, context);

  return product;
};

/**
 * Updates an existing product.
 * Permission required: can_update_products
 */
export const updateProduct: UpdateProduct<UpdateProductInput, any> = async (
  { productId, salonId, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_update_products', context.entities);

  const product = await context.entities.Product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  if (product.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this product');
  }

  if (product.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted product');
  }

  // Validate prices if provided
  if (updates.costPrice !== undefined && updates.costPrice < 0) {
    throw new HttpError(400, 'Cost price must be non-negative');
  }

  if (updates.salePrice !== undefined && updates.salePrice < 0) {
    throw new HttpError(400, 'Sale price must be non-negative');
  }

  // Validate category if provided
  if (updates.categoryId) {
    const category = await context.entities.ProductCategory.findUnique({
      where: { id: updates.categoryId },
    });

    if (!category || category.salonId !== salonId || category.deletedAt) {
      throw new HttpError(400, 'Product category not found');
    }
  }

  // Validate brand if provided
  if (updates.brandId) {
    const brand = await context.entities.ProductBrand.findUnique({
      where: { id: updates.brandId },
    });

    if (!brand || brand.salonId !== salonId || brand.deletedAt) {
      throw new HttpError(400, 'Product brand not found');
    }
  }

  // Validate supplier if provided
  if (updates.supplierId) {
    const supplier = await context.entities.Supplier.findUnique({
      where: { id: updates.supplierId },
    });

    if (!supplier || supplier.salonId !== salonId || supplier.deletedAt) {
      throw new HttpError(400, 'Supplier not found');
    }
  }

  // Update product
  const updatedProduct = await context.entities.Product.update({
    where: { id: productId },
    data: {
      ...updates,
      updatedByUserId: context.user.id,
    },
    include: {
      category: true,
      brand: true,
      supplier: true,
    },
  });

  // Log update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Product',
      entityId: productId,
      action: 'UPDATE',
      before: {
        name: product.name,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
      },
      after: {
        name: updates.name,
        costPrice: updates.costPrice,
        salePrice: updates.salePrice,
      },
    },
  });

  return updatedProduct;
};

/**
 * Soft deletes a product (prevents deletion if used in sales).
 * Permission required: can_delete_products
 */
export const deleteProduct: DeleteProduct<DeleteProductInput, any> = async (
  { productId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_delete_products', context.entities);

  const product = await context.entities.Product.findUnique({
    where: { id: productId },
    include: {
      saleProducts: {
        take: 1,
      },
    },
  });

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  if (product.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this product');
  }

  if (product.deletedAt) {
    throw new HttpError(400, 'Product is already deleted');
  }

  // Check if product is used in any sales
  if (product.saleProducts.length > 0) {
    throw new HttpError(400, 'Cannot delete product that has been used in sales. Consider archiving instead.');
  }

  // Soft delete
  const deletedProduct = await context.entities.Product.update({
    where: { id: productId },
    data: {
      deletedAt: new Date(),
    },
  });

  // Log deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Product',
      entityId: productId,
      action: 'DELETE',
      before: { name: product.name },
      after: null,
    },
  });

  return deletedProduct;
};

/**
 * Records a stock movement (IN, OUT, or ADJUST).
 * Permission required: can_manage_stock
 */
export const recordStockMovement: RecordStockMovement<RecordStockMovementInput, any> = async (
  { productId, salonId, movementType, quantity, reason },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_manage_stock', context.entities);

  if (quantity <= 0) {
    throw new HttpError(400, 'Quantity must be positive');
  }

  const product = await context.entities.Product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new HttpError(404, 'Product not found');
  }

  if (product.salonId !== salonId) {
    throw new HttpError(403, 'Access denied to this product');
  }

  if (product.deletedAt) {
    throw new HttpError(400, 'Cannot manage stock of deleted product');
  }

  const previousQuantity = product.stockQuantity;
  let finalQuantity: number;

  switch (movementType) {
    case 'IN':
      finalQuantity = previousQuantity + quantity;
      break;
    case 'OUT':
      finalQuantity = previousQuantity - quantity;
      if (finalQuantity < 0) {
        throw new HttpError(400, `Insufficient stock. Available: ${previousQuantity}, Required: ${quantity}`);
      }
      break;
    case 'ADJUST':
      finalQuantity = quantity; // Direct adjustment to specific quantity
      break;
    default:
      throw new HttpError(400, 'Invalid movement type');
  }

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
      reason: reason || `Manual ${movementType} by ${context.user.name || context.user.email}`,
      previousQuantity,
      finalQuantity,
    },
  });

  // Log movement
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'StockRecord',
      entityId: stockRecord.id,
      action: 'CREATE',
      before: { stockQuantity: previousQuantity },
      after: { stockQuantity: finalQuantity, movementType, quantity },
    },
  });

  // Check if low stock notification should be sent
  const updatedProduct = await context.entities.Product.findUnique({
    where: { id: productId },
  });
  
  if (updatedProduct) {
    await checkLowStock(updatedProduct, context);
  }

  return {
    stockRecord,
    previousQuantity,
    finalQuantity,
  };
};

// ============================================================================
// Queries - Categories
// ============================================================================

export const listProductCategories: ListProductCategories<ListProductCategoriesInput, any> = async (
  { salonId, includeDeleted = false },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_products', context.entities);

  const where: any = { salonId };
  
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  const categories = await context.entities.ProductCategory.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return categories;
};

// ============================================================================
// Actions - Categories
// ============================================================================

export const createProductCategory: CreateProductCategory<CreateProductCategoryInput, any> = async (
  { salonId, name, description },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_create_products', context.entities);

  const category = await context.entities.ProductCategory.create({
    data: {
      salonId,
      name,
      description,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ProductCategory',
      entityId: category.id,
      action: 'CREATE',
      before: null,
      after: { name },
    },
  });

  return category;
};

export const updateProductCategory: UpdateProductCategory<UpdateProductCategoryInput, any> = async (
  { categoryId, salonId, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_update_products', context.entities);

  const category = await context.entities.ProductCategory.findUnique({
    where: { id: categoryId },
  });

  if (!category || category.salonId !== salonId) {
    throw new HttpError(404, 'Category not found');
  }

  const updatedCategory = await context.entities.ProductCategory.update({
    where: { id: categoryId },
    data: updates,
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ProductCategory',
      entityId: categoryId,
      action: 'UPDATE',
      before: { name: category.name },
      after: { name: updates.name },
    },
  });

  return updatedCategory;
};

export const deleteProductCategory: DeleteProductCategory<DeleteProductCategoryInput, any> = async (
  { categoryId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_delete_products', context.entities);

  const category = await context.entities.ProductCategory.findUnique({
    where: { id: categoryId },
    include: {
      products: {
        take: 1,
      },
    },
  });

  if (!category || category.salonId !== salonId) {
    throw new HttpError(404, 'Category not found');
  }

  if (category.products.length > 0) {
    throw new HttpError(400, 'Cannot delete category with products');
  }

  const deletedCategory = await context.entities.ProductCategory.update({
    where: { id: categoryId },
    data: {
      deletedAt: new Date(),
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ProductCategory',
      entityId: categoryId,
      action: 'DELETE',
      before: { name: category.name },
      after: null,
    },
  });

  return deletedCategory;
};

// ============================================================================
// Queries - Brands (Similar pattern to Categories)
// ============================================================================

export const listProductBrands: ListProductBrands<ListProductBrandsInput, any> = async (
  { salonId, includeDeleted = false },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_products', context.entities);

  const where: any = { salonId };
  
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  const brands = await context.entities.ProductBrand.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return brands;
};

export const createProductBrand: CreateProductBrand<CreateProductBrandInput, any> = async (
  { salonId, name, description },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_create_products', context.entities);

  const brand = await context.entities.ProductBrand.create({
    data: {
      salonId,
      name,
      description,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ProductBrand',
      entityId: brand.id,
      action: 'CREATE',
      before: null,
      after: { name },
    },
  });

  return brand;
};

export const updateProductBrand: UpdateProductBrand<UpdateProductBrandInput, any> = async (
  { brandId, salonId, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_update_products', context.entities);

  const brand = await context.entities.ProductBrand.findUnique({
    where: { id: brandId },
  });

  if (!brand || brand.salonId !== salonId) {
    throw new HttpError(404, 'Brand not found');
  }

  const updatedBrand = await context.entities.ProductBrand.update({
    where: { id: brandId },
    data: updates,
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ProductBrand',
      entityId: brandId,
      action: 'UPDATE',
      before: { name: brand.name },
      after: { name: updates.name },
    },
  });

  return updatedBrand;
};

export const deleteProductBrand: DeleteProductBrand<DeleteProductBrandInput, any> = async (
  { brandId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_delete_products', context.entities);

  const brand = await context.entities.ProductBrand.findUnique({
    where: { id: brandId },
    include: {
      products: {
        take: 1,
      },
    },
  });

  if (!brand || brand.salonId !== salonId) {
    throw new HttpError(404, 'Brand not found');
  }

  if (brand.products.length > 0) {
    throw new HttpError(400, 'Cannot delete brand with products');
  }

  const deletedBrand = await context.entities.ProductBrand.update({
    where: { id: brandId },
    data: {
      deletedAt: new Date(),
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'ProductBrand',
      entityId: brandId,
      action: 'DELETE',
      before: { name: brand.name },
      after: null,
    },
  });

  return deletedBrand;
};

// ============================================================================
// Queries - Suppliers
// ============================================================================

export const listSuppliers: ListSuppliers<ListSuppliersInput, any> = async (
  { salonId, search, includeDeleted = false },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_view_products', context.entities);

  const where: any = { salonId };
  
  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { cnpj: { contains: search, mode: 'insensitive' } },
    ];
  }

  const suppliers = await context.entities.Supplier.findMany({
    where,
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return suppliers;
};

export const createSupplier: CreateSupplier<CreateSupplierInput, any> = async (
  { salonId, ...data },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_create_products', context.entities);

  const supplier = await context.entities.Supplier.create({
    data: {
      salonId,
      ...data,
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Supplier',
      entityId: supplier.id,
      action: 'CREATE',
      before: null,
      after: { name: data.name },
    },
  });

  return supplier;
};

export const updateSupplier: UpdateSupplier<UpdateSupplierInput, any> = async (
  { supplierId, salonId, ...updates },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_update_products', context.entities);

  const supplier = await context.entities.Supplier.findUnique({
    where: { id: supplierId },
  });

  if (!supplier || supplier.salonId !== salonId) {
    throw new HttpError(404, 'Supplier not found');
  }

  const updatedSupplier = await context.entities.Supplier.update({
    where: { id: supplierId },
    data: updates,
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Supplier',
      entityId: supplierId,
      action: 'UPDATE',
      before: { name: supplier.name },
      after: { name: updates.name },
    },
  });

  return updatedSupplier;
};

export const deleteSupplier: DeleteSupplier<DeleteSupplierInput, any> = async (
  { supplierId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  await requirePermission(context.user, salonId, 'can_delete_products', context.entities);

  const supplier = await context.entities.Supplier.findUnique({
    where: { id: supplierId },
    include: {
      products: {
        take: 1,
      },
    },
  });

  if (!supplier || supplier.salonId !== salonId) {
    throw new HttpError(404, 'Supplier not found');
  }

  if (supplier.products.length > 0) {
    throw new HttpError(400, 'Cannot delete supplier with products');
  }

  const deletedSupplier = await context.entities.Supplier.update({
    where: { id: supplierId },
    data: {
      deletedAt: new Date(),
    },
  });

  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Supplier',
      entityId: supplierId,
      action: 'DELETE',
      before: { name: supplier.name },
      after: null,
    },
  });

  return deletedSupplier;
};
