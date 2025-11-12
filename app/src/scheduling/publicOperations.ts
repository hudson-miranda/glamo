// Public Online Booking Operations
// These operations are accessible without authentication for public booking
import { HttpError } from 'wasp/server';
import type { 
  GetPublicBookingConfig, 
  CreatePublicBooking,
  GetPublicAvailability 
} from 'wasp/server/operations';
import { 
  calculateAvailableSlots, 
  isSlotAvailable 
} from './utils/availabilityCalculator';
import { checkAdvancedConflicts } from './utils/conflictDetector';
import { generateConfirmationCode, addMinutes } from './utils/dateUtils';

// ============================================================================
// PUBLIC BOOKING OPERATIONS
// ============================================================================

/**
 * Get public booking configuration and available services/professionals
 * This endpoint is public and doesn't require authentication
 */
export const getPublicBookingConfig: GetPublicBookingConfig<
  { bookingSlug: string },
  {
    salon: {
      id: string;
      name: string;
      description: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      phone: string | null;
      email: string | null;
    };
    bookingConfig: {
      id: string;
      bookingPageTitle: string | null;
      bookingPageDescription: string | null;
      bookingPageLogo: string | null;
      bookingPageBanner: string | null;
      bookingPagePrimaryColor: string;
      bookingPageTheme: string;
      requireClientRegistration: boolean;
      collectClientPhone: boolean;
      collectClientEmail: boolean;
      collectClientNotes: boolean;
      showProfessionalPhotos: boolean;
      showServicePrices: boolean;
      enableServiceSelection: boolean;
      enableProfessionalChoice: boolean;
      autoApproveBookings: boolean;
      bookingTermsText: string | null;
      requireTermsAcceptance: boolean;
      minAdvanceHours: number;
      maxAdvanceDays: number;
      allowSameDayBooking: boolean;
      slotInterval: number;
      bufferTimeMinutes: number;
      freeCancellationHours: number;
    };
    services: Array<{
      id: string;
      name: string;
      description: string | null;
      duration: number;
      price: number;
      categoryId: string | null;
      category?: {
        id: string;
        name: string;
      } | null;
    }>;
    professionals: Array<{
      id: string;
      name: string;
      role: string | null;
      profilePhoto: string | null;
      bio: string | null;
      specialties: string[];
    }>;
  }
> = async ({ bookingSlug }, context) => {
  // Find salon by booking slug
  const salon = await context.entities.Salon.findFirst({
    where: {
      bookingConfig: {
        bookingSlug: bookingSlug,
        enableOnlineBooking: true,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      address: true,
      city: true,
      state: true,
      phone: true,
      email: true,
      bookingConfig: {
        select: {
          id: true,
          bookingPageTitle: true,
          bookingPageDescription: true,
          bookingPageLogo: true,
          bookingPageBanner: true,
          bookingPagePrimaryColor: true,
          bookingPageTheme: true,
          requireClientRegistration: true,
          collectClientPhone: true,
          collectClientEmail: true,
          collectClientNotes: true,
          showProfessionalPhotos: true,
          showServicePrices: true,
          enableServiceSelection: true,
          enableProfessionalChoice: true,
          autoApproveBookings: true,
          bookingTermsText: true,
          requireTermsAcceptance: true,
          minAdvanceHours: true,
          maxAdvanceDays: true,
          allowSameDayBooking: true,
          slotInterval: true,
          bufferTimeMinutes: true,
          freeCancellationHours: true,
        },
      },
    },
  });

  if (!salon || !salon.bookingConfig) {
    throw new HttpError(404, 'Página de agendamento não encontrada ou indisponível');
  }

  // Get active services
  const services = await context.entities.Service.findMany({
    where: {
      salonId: salon.id,
      isActive: true,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      duration: true,
      price: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      { category: { name: 'asc' } },
      { name: 'asc' },
    ],
  });

  // Get active professionals (employees)
  const professionals = await context.entities.Employee.findMany({
    where: {
      salonId: salon.id,
      isActive: true,
      acceptsOnlineBooking: true,
      deletedAt: null,
    },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          name: true,
        },
      },
      role: true,
      profilePhoto: true,
      bio: true,
      specialties: true,
    },
    orderBy: {
      user: {
        name: 'asc',
      },
    },
  });

  return {
    salon: {
      id: salon.id,
      name: salon.name,
      description: salon.description,
      address: salon.address,
      city: salon.city,
      state: salon.state,
      phone: salon.phone,
      email: salon.email,
    },
    bookingConfig: salon.bookingConfig,
    services,
    professionals: professionals.map((p) => ({
      id: p.id,
      name: p.user.name || 'Profissional',
      role: p.role,
      profilePhoto: p.profilePhoto,
      bio: p.bio,
      specialties: p.specialties,
    })),
  };
};

/**
 * Get available time slots for a specific date, service, and professional
 */
export const getPublicAvailability: GetPublicAvailability<
  {
    bookingSlug: string;
    date: string; // ISO date string
    serviceId: string;
    professionalId?: string; // Optional - if not provided, find any available professional
  },
  {
    availableSlots: Array<{
      startTime: string;
      endTime: string;
      professionalId: string;
      professionalName: string;
    }>;
  }
> = async ({ bookingSlug, date, serviceId, professionalId }, context) => {
  // Find salon by booking slug
  const salon = await context.entities.Salon.findFirst({
    where: {
      bookingConfig: {
        bookingSlug: bookingSlug,
        enableOnlineBooking: true,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      bookingConfig: {
        select: {
          minAdvanceHours: true,
          maxAdvanceDays: true,
          allowSameDayBooking: true,
          slotInterval: true,
          bufferTimeMinutes: true,
        },
      },
    },
  });

  if (!salon || !salon.bookingConfig) {
    throw new HttpError(404, 'Página de agendamento não encontrada');
  }

  // Get service details
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      name: true,
      duration: true,
      salonId: true,
    },
  });

  if (!service || service.salonId !== salon.id) {
    throw new HttpError(404, 'Serviço não encontrado');
  }

  // Validate date
  const requestedDate = new Date(date);
  const now = new Date();
  const minDate = addMinutes(now, salon.bookingConfig.minAdvanceHours * 60);
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + salon.bookingConfig.maxAdvanceDays);

  if (requestedDate < minDate || requestedDate > maxDate) {
    throw new HttpError(400, 'Data fora do período permitido para agendamento');
  }

  // Check if same-day booking is allowed
  if (!salon.bookingConfig.allowSameDayBooking) {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const requestedStartOfDay = new Date(requestedDate);
    requestedStartOfDay.setHours(0, 0, 0, 0);

    if (requestedStartOfDay.getTime() === startOfToday.getTime()) {
      throw new HttpError(400, 'Agendamento no mesmo dia não permitido');
    }
  }

  // Get professionals to check
  let professionalsToCheck: string[] = [];
  if (professionalId) {
    // Verify professional exists and is active
    const professional = await context.entities.Employee.findUnique({
      where: { id: professionalId },
      select: {
        id: true,
        isActive: true,
        acceptsOnlineBooking: true,
        salonId: true,
      },
    });

    if (!professional || professional.salonId !== salon.id || !professional.isActive || !professional.acceptsOnlineBooking) {
      throw new HttpError(404, 'Profissional não disponível');
    }

    professionalsToCheck = [professionalId];
  } else {
    // Get all active professionals
    const professionals = await context.entities.Employee.findMany({
      where: {
        salonId: salon.id,
        isActive: true,
        acceptsOnlineBooking: true,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    professionalsToCheck = professionals.map((p) => p.id);
  }

  if (professionalsToCheck.length === 0) {
    return { availableSlots: [] };
  }

  // Calculate available slots for each professional
  const allSlots: Array<{
    startTime: string;
    endTime: string;
    professionalId: string;
    professionalName: string;
  }> = [];

  for (const profId of professionalsToCheck) {
    try {
      const slots = await calculateAvailableSlots(
        {
          salonId: salon.id,
          employeeId: profId,
          date: requestedDate,
          serviceDuration: service.duration,
        },
        context.entities
      );

      // Get professional name
      const professional = await context.entities.Employee.findUnique({
        where: { id: profId },
        select: {
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      const professionalName = professional?.user.name || 'Profissional';

      // Add professional info to each slot
      slots.forEach((slot) => {
        allSlots.push({
          startTime: slot.startTime.toISOString(),
          endTime: slot.endTime.toISOString(),
          professionalId: profId,
          professionalName,
        });
      });
    } catch (error) {
      console.error(`Error calculating slots for professional ${profId}:`, error);
      // Continue with other professionals
    }
  }

  // Sort slots by time
  allSlots.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return { availableSlots: allSlots };
};

/**
 * Create a public booking (appointment)
 * This endpoint is public and doesn't require authentication
 */
export const createPublicBooking: CreatePublicBooking<
  {
    bookingSlug: string;
    serviceId: string;
    professionalId: string;
    startTime: string; // ISO datetime string
    clientData: {
      name: string;
      phone?: string;
      email?: string;
      notes?: string;
    };
    termsAccepted?: boolean;
  },
  {
    appointmentId: string;
    confirmationCode: string;
    message: string;
  }
> = async (
  { bookingSlug, serviceId, professionalId, startTime, clientData, termsAccepted },
  context
) => {
  // Find salon by booking slug
  const salon = await context.entities.Salon.findFirst({
    where: {
      bookingConfig: {
        bookingSlug: bookingSlug,
        enableOnlineBooking: true,
      },
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      bookingConfig: {
        select: {
          requireClientRegistration: true,
          collectClientPhone: true,
          collectClientEmail: true,
          requireTermsAcceptance: true,
          autoApproveBookings: true,
          sendConfirmationEmail: true,
          sendConfirmationSMS: true,
          minAdvanceHours: true,
          maxAdvanceDays: true,
          allowSameDayBooking: true,
        },
      },
    },
  });

  if (!salon || !salon.bookingConfig) {
    throw new HttpError(404, 'Página de agendamento não encontrada');
  }

  // Validate required fields based on booking config
  if (salon.bookingConfig.collectClientPhone && !clientData.phone) {
    throw new HttpError(400, 'Telefone é obrigatório');
  }

  if (salon.bookingConfig.collectClientEmail && !clientData.email) {
    throw new HttpError(400, 'Email é obrigatório');
  }

  if (salon.bookingConfig.requireTermsAcceptance && !termsAccepted) {
    throw new HttpError(400, 'É necessário aceitar os termos e condições');
  }

  // Validate service
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      salonId: true,
      isActive: true,
    },
  });

  if (!service || service.salonId !== salon.id || !service.isActive) {
    throw new HttpError(404, 'Serviço não encontrado ou inativo');
  }

  // Validate professional
  const professional = await context.entities.Employee.findUnique({
    where: { id: professionalId },
    select: {
      id: true,
      userId: true,
      salonId: true,
      isActive: true,
      acceptsOnlineBooking: true,
    },
  });

  if (!professional || professional.salonId !== salon.id || !professional.isActive || !professional.acceptsOnlineBooking) {
    throw new HttpError(404, 'Profissional não disponível');
  }

  // Validate date/time
  const appointmentStartTime = new Date(startTime);
  const appointmentEndTime = addMinutes(appointmentStartTime, service.duration);
  const now = new Date();
  const minDate = addMinutes(now, salon.bookingConfig.minAdvanceHours * 60);
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + salon.bookingConfig.maxAdvanceDays);

  if (appointmentStartTime < minDate) {
    throw new HttpError(400, `Agendamento deve ser feito com pelo menos ${salon.bookingConfig.minAdvanceHours} horas de antecedência`);
  }

  if (appointmentStartTime > maxDate) {
    throw new HttpError(400, `Agendamento deve ser feito com no máximo ${salon.bookingConfig.maxAdvanceDays} dias de antecedência`);
  }

  // Check same-day booking
  if (!salon.bookingConfig.allowSameDayBooking) {
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const appointmentStartOfDay = new Date(appointmentStartTime);
    appointmentStartOfDay.setHours(0, 0, 0, 0);

    if (appointmentStartOfDay.getTime() === startOfToday.getTime()) {
      throw new HttpError(400, 'Agendamento no mesmo dia não permitido');
    }
  }

  // Check for conflicts
  const conflicts = await checkAdvancedConflicts(
    {
      salonId: salon.id,
      employeeId: professionalId,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      excludeAppointmentId: undefined,
    },
    context.entities
  );

  if (conflicts.hasConflict) {
    throw new HttpError(409, 'Horário não disponível. Por favor, escolha outro horário.');
  }

  // Find or create client
  let client = null;

  if (clientData.phone) {
    // Try to find existing client by phone
    client = await context.entities.Client.findFirst({
      where: {
        salonId: salon.id,
        phone: clientData.phone,
        deletedAt: null,
      },
    });
  }

  if (!client && clientData.email) {
    // Try to find by email
    client = await context.entities.Client.findFirst({
      where: {
        salonId: salon.id,
        email: clientData.email,
        deletedAt: null,
      },
    });
  }

  // Create new client if not found
  if (!client) {
    client = await context.entities.Client.create({
      data: {
        salonId: salon.id,
        name: clientData.name,
        phone: clientData.phone || null,
        email: clientData.email || null,
        source: 'ONLINE_BOOKING',
        status: 'ACTIVE',
      },
    });
  } else {
    // Update client info if needed
    await context.entities.Client.update({
      where: { id: client.id },
      data: {
        name: clientData.name,
        phone: clientData.phone || client.phone,
        email: clientData.email || client.email,
      },
    });
  }

  // Generate confirmation code
  const confirmationCode = generateConfirmationCode();

  // Create appointment
  const appointment = await context.entities.Appointment.create({
    data: {
      salonId: salon.id,
      clientId: client.id,
      professionalId: professional.userId,
      startTime: appointmentStartTime,
      endTime: appointmentEndTime,
      status: salon.bookingConfig.autoApproveBookings ? 'CONFIRMED' : 'PENDING',
      confirmationCode,
      source: 'ONLINE_BOOKING',
      notes: clientData.notes || null,
      services: {
        create: [
          {
            serviceId: service.id,
            quantity: 1,
            price: service.price,
            duration: service.duration,
          },
        ],
      },
    },
    select: {
      id: true,
      confirmationCode: true,
      status: true,
    },
  });

  // TODO: Send confirmation email/SMS
  // This would integrate with the notification system
  // if (salon.bookingConfig.sendConfirmationEmail && clientData.email) {
  //   await sendBookingConfirmationEmail(...)
  // }
  // if (salon.bookingConfig.sendConfirmationSMS && clientData.phone) {
  //   await sendBookingConfirmationSMS(...)
  // }

  return {
    appointmentId: appointment.id,
    confirmationCode: appointment.confirmationCode,
    message: salon.bookingConfig.autoApproveBookings
      ? 'Agendamento confirmado com sucesso! Você receberá uma confirmação por email.'
      : 'Agendamento recebido! Aguarde a confirmação do salão.',
  };
};
