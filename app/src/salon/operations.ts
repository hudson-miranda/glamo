import type { Salon, User, UserSalon } from 'wasp/entities';
import type { GetUserSalons, CreateSalon, SwitchActiveSalon } from 'wasp/server/operations';
import { HttpError } from 'wasp/server';
import { Prisma } from '@prisma/client';

/**
 * List all salons the user belongs to
 */
export const getUserSalons: GetUserSalons<void, { id: string; name: string; isActive: boolean }[]> = async (
  _args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const userSalons = await context.entities.UserSalon.findMany({
    where: {
      userId: context.user.id,
      isActive: true,
      deletedAt: null,
    },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return userSalons.map((us) => ({
    id: us.salon.id,
    name: us.salon.name,
    isActive: us.salon.id === context.user!.activeSalonId,
  }));
};

/**
 * Create a new salon and associate the user as owner
 */
type CreateSalonInput = {
  name: string;
  cnpj?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
};

export const createSalon: CreateSalon<CreateSalonInput, Salon> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { name, cnpj, description, phone, email, address, city, state, zipCode } = args;

  if (!name || name.trim().length === 0) {
    throw new HttpError(400, 'Salon name is required');
  }

  // Create salon
  const salon = await context.entities.Salon.create({
    data: {
      name: name.trim(),
      cnpj,
      description,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
    },
  });

  // Get the owner role
  const ownerRole = await context.entities.Role.findFirst({
    where: { name: 'owner' },
  });

  if (!ownerRole) {
    throw new HttpError(500, 'Owner role not found');
  }

  // Create UserSalon relationship
  const userSalon = await context.entities.UserSalon.create({
    data: {
      userId: context.user.id,
      salonId: salon.id,
      isActive: true,
    },
  });

  // Assign owner role to user for this salon
  await context.entities.UserRole.create({
    data: {
      userSalonId: userSalon.id,
      roleId: ownerRole.id,
    },
  });

  // Set as active salon if user doesn't have one
  if (!context.user.activeSalonId) {
    await context.entities.User.update({
      where: { id: context.user.id },
      data: { activeSalonId: salon.id },
    });
  }

  // Log the action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      entity: 'Salon',
      entityId: salon.id,
      action: 'CREATE',
      after: Prisma.DbNull,
    },
  });

  return salon;
};

/**
 * Switch the user's active salon
 */
type SwitchActiveSalonInput = {
  salonId: string;
};

export const switchActiveSalon: SwitchActiveSalon<SwitchActiveSalonInput, User> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'User not authenticated');
  }

  const { salonId } = args;

  // Check if user has access to this salon
  const userSalon = await context.entities.UserSalon.findFirst({
    where: {
      userId: context.user.id,
      salonId,
      isActive: true,
      deletedAt: null,
    },
  });

  if (!userSalon) {
    throw new HttpError(403, 'You do not have access to this salon');
  }

  // Update user's active salon
  const updatedUser = await context.entities.User.update({
    where: { id: context.user.id },
    data: { activeSalonId: salonId },
  });

  return updatedUser;
};
