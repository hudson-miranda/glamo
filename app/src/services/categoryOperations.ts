import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';
import type { 
  ListCategories,
  GetCategory,
  CreateCategory,
  UpdateCategory,
  DeleteCategory,
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type ListCategoriesInput = {
  salonId: string;
  search?: string;
  includeDeleted?: boolean;
};

type GetCategoryInput = {
  categoryId: string;
  salonId: string;
};

type CreateCategoryInput = {
  salonId: string;
  name: string;
  description?: string;
  active?: boolean;
};

type UpdateCategoryInput = {
  categoryId: string;
  salonId: string;
  name?: string;
  description?: string;
  active?: boolean;
};

type DeleteCategoryInput = {
  categoryId: string;
  salonId: string;
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Lists all categories for a salon.
 * Permission required: can_view_services
 */
export const listCategories: ListCategories<ListCategoriesInput, any> = async (
  { salonId, search, includeDeleted = false },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_services', context.entities);

  // Build where clause
  const where: any = {
    salonId,
  };

  if (!includeDeleted) {
    where.deletedAt = null;
  }

  if (search && search.trim().length > 0) {
    where.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { description: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  // Get categories
  const categories = await context.entities.Category.findMany({
    where,
    orderBy: [
      { active: 'desc' },
      { name: 'asc' },
    ],
    include: {
      _count: {
        select: {
          services: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  return categories;
};

/**
 * Gets a single category by ID.
 * Permission required: can_view_services
 */
export const getCategory: GetCategory<GetCategoryInput, any> = async (
  { categoryId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_view_services', context.entities);

  // Get category
  const category = await context.entities.Category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: {
          services: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  if (!category) {
    throw new HttpError(404, 'Category not found');
  }

  if (category.salonId !== salonId) {
    throw new HttpError(403, 'Category does not belong to this salon');
  }

  return category;
};

// ============================================================================
// Actions
// ============================================================================

/**
 * Creates a new category.
 * Permission required: can_create_services
 */
export const createCategory: CreateCategory<CreateCategoryInput, any> = async (
  { salonId, name, description, active = true },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_create_services', context.entities);

  // Validate inputs
  if (!name || name.trim().length === 0) {
    throw new HttpError(400, 'Category name is required');
  }

  if (name.trim().length > 100) {
    throw new HttpError(400, 'Category name cannot exceed 100 characters');
  }

  if (description && description.trim().length > 500) {
    throw new HttpError(400, 'Category description cannot exceed 500 characters');
  }

  // Check for duplicate name in same salon (case-insensitive)
  const existingCategory = await context.entities.Category.findFirst({
    where: {
      salonId,
      name: {
        equals: name.trim(),
        mode: 'insensitive',
      },
      deletedAt: null,
    },
  });

  if (existingCategory) {
    throw new HttpError(400, 'A category with this name already exists');
  }

  // Create the category
  const category = await context.entities.Category.create({
    data: {
      salonId,
      name: name.trim(),
      description: description?.trim(),
      active,
    },
    include: {
      _count: {
        select: {
          services: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  // Log the creation
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Category',
      entityId: category.id,
      action: 'CREATE',
      before: Prisma.DbNull,
      after: category,
    },
  });

  return category;
};

/**
 * Updates an existing category.
 * Permission required: can_edit_services
 */
export const updateCategory: UpdateCategory<UpdateCategoryInput, any> = async (
  { categoryId, salonId, name, description, active },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_edit_services', context.entities);

  // Get existing category
  const existingCategory = await context.entities.Category.findUnique({
    where: { id: categoryId },
  });

  if (!existingCategory) {
    throw new HttpError(404, 'Category not found');
  }

  if (existingCategory.salonId !== salonId) {
    throw new HttpError(403, 'Category does not belong to this salon');
  }

  if (existingCategory.deletedAt) {
    throw new HttpError(400, 'Cannot update deleted category');
  }

  // Validate inputs
  if (name !== undefined && name.trim().length === 0) {
    throw new HttpError(400, 'Category name cannot be empty');
  }

  if (name !== undefined && name.trim().length > 100) {
    throw new HttpError(400, 'Category name cannot exceed 100 characters');
  }

  if (description !== undefined && description.trim().length > 500) {
    throw new HttpError(400, 'Category description cannot exceed 500 characters');
  }

  // Check for duplicate name if name is being changed
  if (name !== undefined && name.trim().toLowerCase() !== existingCategory.name.toLowerCase()) {
    const duplicateCategory = await context.entities.Category.findFirst({
      where: {
        salonId,
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
        deletedAt: null,
        id: { not: categoryId },
      },
    });

    if (duplicateCategory) {
      throw new HttpError(400, 'A category with this name already exists');
    }
  }

  // Prepare update data
  const updateData: any = {};

  if (name !== undefined) updateData.name = name.trim();
  if (description !== undefined) updateData.description = description?.trim();
  if (active !== undefined) updateData.active = active;

  // Update the category
  const category = await context.entities.Category.update({
    where: { id: categoryId },
    data: updateData,
    include: {
      _count: {
        select: {
          services: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  // Log the update
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Category',
      entityId: category.id,
      action: 'UPDATE',
      before: existingCategory,
      after: category,
    },
  });

  return category;
};

/**
 * Soft deletes a category.
 * Permission required: can_delete_services
 */
export const deleteCategory: DeleteCategory<DeleteCategoryInput, any> = async (
  { categoryId, salonId },
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  // Check permission
  await requirePermission(context.user, salonId, 'can_delete_services', context.entities);

  // Get existing category
  const category = await context.entities.Category.findUnique({
    where: { id: categoryId },
    include: {
      services: {
        where: {
          deletedAt: null,
        },
        take: 1,
      },
    },
  });

  if (!category) {
    throw new HttpError(404, 'Category not found');
  }

  if (category.salonId !== salonId) {
    throw new HttpError(403, 'Category does not belong to this salon');
  }

  if (category.deletedAt) {
    throw new HttpError(400, 'Category is already deleted');
  }

  // Check if category has active services
  if (category.services.length > 0) {
    throw new HttpError(
      400,
      'Cannot delete category with active services. Please remove or reassign services first.'
    );
  }

  // Soft delete the category
  const deletedCategory = await context.entities.Category.update({
    where: { id: categoryId },
    data: {
      deletedAt: new Date(),
    },
  });

  // Log the deletion
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Category',
      entityId: deletedCategory.id,
      action: 'DELETE',
      before: category,
      after: deletedCategory,
    },
  });

  return { success: true, message: 'Category deleted successfully' };
};
