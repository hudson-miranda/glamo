// Booking Configuration Operations
import type { BookingPolicyConfig } from './types';
import { requirePermission } from '@src/rbac/requirePermission';
import { HttpError } from 'wasp/server';

/**
 * Get booking configuration for a salon
 */
export const getBookingConfig = async (
  { salonId }: { salonId: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  await requirePermission(
    context.user,
    salonId,
    'can_view_appointments',
    context.entities
  );

  let config = await context.entities.BookingConfig.findUnique({
    where: { salonId }
  });

  // Create default config if doesn't exist
  if (!config) {
    config = await context.entities.BookingConfig.create({
      data: {
        salonId,
        minAdvanceHours: 2,
        maxAdvanceDays: 90,
        freeCancellationHours: 24,
        lateCancellationHours: 12,
        lateCancellationFee: 50,
        allowRescheduling: true,
        maxRescheduleCount: 2,
        minRescheduleHours: 24,
        noShowFeePercent: 100,
        autoMarkNoShowMinutes: 15,
        allowSameDayBooking: true,
        slotInterval: 15,
        bufferTimeMinutes: 0,
        enableReminders: true,
        reminder24h: true,
        reminder2h: true,
        reminderChannels: ['EMAIL', 'SMS']
      }
    });
  }

  return config;
};

/**
 * Update booking configuration
 */
export const updateBookingConfig = async (
  args: {
    salonId: string;
    config: Partial<BookingPolicyConfig>;
  },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  await requirePermission(
    context.user,
    args.salonId,
    'can_edit_salon_settings',
    context.entities
  );

  // Validate config values
  if (args.config.minAdvanceHours !== undefined && args.config.minAdvanceHours < 0) {
    throw new HttpError(400, 'Horas mínimas de antecedência não pode ser negativo');
  }

  if (args.config.maxAdvanceDays !== undefined && args.config.maxAdvanceDays < 1) {
    throw new HttpError(400, 'Dias máximos de antecedência deve ser pelo menos 1');
  }

  if (args.config.slotInterval !== undefined && ![15, 30, 60].includes(args.config.slotInterval)) {
    throw new HttpError(400, 'Intervalo de horário deve ser 15, 30 ou 60 minutos');
  }

  // Check if config exists
  const existing = await context.entities.BookingConfig.findUnique({
    where: { salonId: args.salonId }
  });

  let updated;

  if (existing) {
    // Update existing config
    updated = await context.entities.BookingConfig.update({
      where: { salonId: args.salonId },
      data: args.config
    });
  } else {
    // Create new config with provided values
    updated = await context.entities.BookingConfig.create({
      data: {
        salonId: args.salonId,
        ...args.config
      }
    });
  }

  return updated;
};

/**
 * Get default booking configuration (for reference)
 */
export const getDefaultBookingConfig = async (
  _args: Record<string, never>,
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  return {
    minAdvanceHours: 2,
    maxAdvanceDays: 90,
    freeCancellationHours: 24,
    lateCancellationHours: 12,
    lateCancellationFee: 50,
    allowRescheduling: true,
    maxRescheduleCount: 2,
    minRescheduleHours: 24,
    noShowFeePercent: 100,
    autoMarkNoShowMinutes: 15,
    allowSameDayBooking: true,
    slotInterval: 15,
    bufferTimeMinutes: 0,
    enableReminders: true,
    reminder24h: true,
    reminder2h: true,
    reminderChannels: ['EMAIL', 'SMS']
  };
};

/**
 * Reset booking configuration to defaults
 */
export const resetBookingConfig = async (
  { salonId }: { salonId: string },
  context: any
) => {
  if (!context.user) {
    throw new HttpError(401, 'Não autenticado');
  }

  await requirePermission(
    context.user,
    salonId,
    'can_edit_salon_settings',
    context.entities
  );

  const defaults = await getDefaultBookingConfig({}, context);

  const config = await context.entities.BookingConfig.upsert({
    where: { salonId },
    update: defaults,
    create: {
      salonId,
      ...defaults
    }
  });

  return config;
};
