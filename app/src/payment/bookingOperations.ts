import { HttpError } from 'wasp/server';
import type {
  GetBookingConfig,
  UpdateBookingPaymentConfig,
} from 'wasp/server/operations';
import { requirePermission } from '../rbac/requirePermission';

// ============================================================================
// Types
// ============================================================================

type GetBookingConfigInput = {
  salonId: string;
};

type UpdateBookingPaymentConfigInput = {
  salonId: string;
  // Online Payment Configuration
  requireOnlinePayment?: boolean;
  acceptOnlineDeposit?: boolean;
  depositType?: 'FIXED' | 'PERCENTAGE';
  depositAmount?: number;
  minDepositAmount?: number;
  acceptFullPayment?: boolean;
  // Cancellation Payment Policies
  allowCancellation?: boolean;
  cancellationDeadlineHours?: number;
  cancellationFeeType?: 'FIXED' | 'PERCENTAGE';
  cancellationFeeAmount?: number;
  refundDeposit?: boolean;
};

// ============================================================================
// Query: Get Booking Config
// ============================================================================

export const getBookingConfig: GetBookingConfig<GetBookingConfigInput, any> = async (
  args,
  context
) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Check permission
  await requirePermission(context, 'salon.settings.view', args.salonId);

  // Get booking config
  let bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { salonId: args.salonId },
  });

  // If no config exists, create default one
  if (!bookingConfig) {
    bookingConfig = await context.entities.BookingConfig.create({
      data: {
        salonId: args.salonId,
      },
    });
  }

  return bookingConfig;
};

// ============================================================================
// Action: Update Booking Payment Config
// ============================================================================

export const updateBookingPaymentConfig: UpdateBookingPaymentConfig<
  UpdateBookingPaymentConfigInput,
  any
> = async (args, context) => {
  if (!context.user) {
    throw new HttpError(401, 'Você precisa estar autenticado.');
  }

  // Check permission
  await requirePermission(context, 'salon.settings.update', args.salonId);

  const { salonId, ...updateData } = args;

  // Validate data
  if (updateData.depositAmount !== undefined && updateData.depositAmount < 0) {
    throw new HttpError(400, 'Valor do depósito não pode ser negativo.');
  }

  if (updateData.minDepositAmount !== undefined && updateData.minDepositAmount < 0) {
    throw new HttpError(400, 'Valor mínimo do depósito não pode ser negativo.');
  }

  if (updateData.cancellationFeeAmount !== undefined && updateData.cancellationFeeAmount < 0) {
    throw new HttpError(400, 'Taxa de cancelamento não pode ser negativa.');
  }

  if (
    updateData.depositType === 'PERCENTAGE' &&
    updateData.depositAmount !== undefined &&
    (updateData.depositAmount < 0 || updateData.depositAmount > 100)
  ) {
    throw new HttpError(400, 'Porcentagem do depósito deve estar entre 0 e 100.');
  }

  if (
    updateData.cancellationFeeType === 'PERCENTAGE' &&
    updateData.cancellationFeeAmount !== undefined &&
    (updateData.cancellationFeeAmount < 0 || updateData.cancellationFeeAmount > 100)
  ) {
    throw new HttpError(400, 'Porcentagem da taxa de cancelamento deve estar entre 0 e 100.');
  }

  // Get or create booking config
  let bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { salonId },
  });

  if (!bookingConfig) {
    bookingConfig = await context.entities.BookingConfig.create({
      data: {
        salonId,
        ...updateData,
      },
    });
  } else {
    bookingConfig = await context.entities.BookingConfig.update({
      where: { salonId },
      data: updateData,
    });
  }

  // Log action
  await context.entities.Log.create({
    data: {
      userId: context.user.id,
      action: 'UPDATE_BOOKING_PAYMENT_CONFIG',
      entity: 'BookingConfig',
      entityId: bookingConfig.id,
      description: `Configurações de pagamento online atualizadas`,
    },
  });

  return bookingConfig;
};
