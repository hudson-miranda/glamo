/**
 * Public Booking Operations
 * 
 * Operações públicas de agendamento online (sem autenticação).
 * Permite que clientes agendem serviços através de uma página pública.
 * 
 * @module booking/publicOperations
 */

import { HttpError } from 'wasp/server';
import type {
  GetBookingConfig,
  ListPublicServices,
  ListPublicEmployees,
  CalculateAvailability,
  CreatePublicAppointment,
} from 'wasp/server/operations';
import { Prisma } from '@prisma/client';

// ============================================================================
// Utility Functions - Time Manipulation
// ============================================================================

/**
 * Converte string "HH:mm" para Date em uma data específica
 * @param dateStr - Data no formato "YYYY-MM-DD"
 * @param timeStr - Horário no formato "HH:mm"
 * @returns Date object
 */
export function parseDateTime(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`);
}

/**
 * Formata DateTime para string "HH:mm"
 * @param date - Date object
 * @returns Horário no formato "HH:mm"
 */
export function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Adiciona minutos a um DateTime
 * @param date - Date object
 * @param minutes - Minutos a adicionar
 * @returns Novo Date object
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

/**
 * Gera array de slots de tempo como DateTime
 * @param dateStr - Data "YYYY-MM-DD"
 * @param startTime - Horário inicial "HH:mm"
 * @param endTime - Horário final "HH:mm"
 * @param duration - Duração de cada slot em minutos
 * @returns Array de objetos {start: Date, end: Date}
 */
export function generateTimeSlots(
  dateStr: string,
  startTime: string,
  endTime: string,
  duration: number
): Array<{ start: Date; end: Date }> {
  const slots: Array<{ start: Date; end: Date }> = [];
  const startDateTime = parseDateTime(dateStr, startTime);
  const endDateTime = parseDateTime(dateStr, endTime);

  let current = startDateTime;
  while (current.getTime() + duration * 60000 <= endDateTime.getTime()) {
    const slotEnd = addMinutes(current, duration);
    slots.push({ start: new Date(current), end: slotEnd });
    current = slotEnd;
  }

  return slots;
}

/**
 * Verifica se há conflito entre dois períodos de tempo
 * @param slot - Período a verificar {start, end}
 * @param appointment - Período existente {start, end}
 * @returns true se há conflito
 */
export function hasTimeConflict(
  slot: { start: Date; end: Date },
  appointment: { start: Date; end: Date }
): boolean {
  return slot.start < appointment.end && slot.end > appointment.start;
}

/**
 * Gera código de confirmação alfanumérico único
 * @returns Código de 8 caracteres (ex: "A3B9X2Y7")
 */
export function generateConfirmationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Valida formato de email
 * @param email - Email a validar
 * @returns true se válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normaliza telefone (remove caracteres especiais)
 * @param phone - Telefone a normalizar
 * @returns Telefone apenas com dígitos
 * @example normalizePhone("(11) 98765-4321") → "11987654321"
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// ============================================================================
// Query: getBookingConfig
// ============================================================================

type GetBookingConfigInput = {
  bookingSlug: string;
};

type GetBookingConfigOutput = {
  config: {
    id: string;
    enableOnlineBooking: boolean;
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
    requireTermsAcceptance: boolean;
    bookingTermsText: string | null;
    minAdvanceHours: number;
    maxAdvanceDays: number;
    allowSameDayBooking: boolean;
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
  };
};

/**
 * Obtém configurações de agendamento online do salão
 * Operação pública (sem autenticação)
 */
export const getPublicBookingPageConfig: GetBookingConfig<
  GetBookingConfigInput,
  GetBookingConfigOutput
> = async ({ bookingSlug }, context) => {
  // Buscar BookingConfig por slug
  const bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { bookingSlug },
    include: {
      salon: {
        select: {
          id: true,
          name: true,
          description: true,
          address: true,
          city: true,
          state: true,
          phone: true,
          email: true,
          deletedAt: true,
        },
      },
    },
  });

  if (!bookingConfig) {
    throw new HttpError(404, 'Página de agendamento não encontrada');
  }

  if (!bookingConfig.enableOnlineBooking) {
    throw new HttpError(403, 'Agendamento online está desativado');
  }

  if (bookingConfig.salon.deletedAt) {
    throw new HttpError(404, 'Salão não encontrado');
  }

  return {
    config: {
      id: bookingConfig.id,
      enableOnlineBooking: bookingConfig.enableOnlineBooking,
      bookingPageTitle: bookingConfig.bookingPageTitle,
      bookingPageDescription: bookingConfig.bookingPageDescription,
      bookingPageLogo: bookingConfig.bookingPageLogo,
      bookingPageBanner: bookingConfig.bookingPageBanner,
      bookingPagePrimaryColor: bookingConfig.bookingPagePrimaryColor || '#00FF94',
      bookingPageTheme: bookingConfig.bookingPageTheme || 'dark',
      requireClientRegistration: bookingConfig.requireClientRegistration || false,
      collectClientPhone: bookingConfig.collectClientPhone ?? true,
      collectClientEmail: bookingConfig.collectClientEmail ?? true,
      collectClientNotes: bookingConfig.collectClientNotes ?? true,
      showProfessionalPhotos: bookingConfig.showProfessionalPhotos ?? true,
      showServicePrices: bookingConfig.showServicePrices ?? true,
      enableServiceSelection: bookingConfig.enableServiceSelection ?? true,
      enableProfessionalChoice: bookingConfig.enableProfessionalChoice ?? true,
      requireTermsAcceptance: bookingConfig.requireTermsAcceptance || false,
      bookingTermsText: bookingConfig.bookingTermsText,
      minAdvanceHours: bookingConfig.minAdvanceHours || 2,
      maxAdvanceDays: bookingConfig.maxAdvanceDays || 90,
      allowSameDayBooking: bookingConfig.allowSameDayBooking ?? true,
      salon: {
        id: bookingConfig.salon.id,
        name: bookingConfig.salon.name,
        description: bookingConfig.salon.description,
        address: bookingConfig.salon.address,
        city: bookingConfig.salon.city,
        state: bookingConfig.salon.state,
        phone: bookingConfig.salon.phone,
        email: bookingConfig.salon.email,
      },
    },
  };
};

// ============================================================================
// Query: listPublicServices
// ============================================================================

type ListPublicServicesInput = {
  bookingSlug: string;
};

type ListPublicServicesOutput = {
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    duration: number;
    price: number;
    employeeCount: number;
  }>;
};

/**
 * Lista serviços disponíveis para agendamento online
 * Operação pública (sem autenticação)
 */
export const listPublicServices: ListPublicServices<
  ListPublicServicesInput,
  ListPublicServicesOutput
> = async ({ bookingSlug }, context) => {
  // Buscar salon por bookingSlug
  const bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { bookingSlug },
    select: {
      salonId: true,
      enableOnlineBooking: true,
    },
  });

  if (!bookingConfig || !bookingConfig.enableOnlineBooking) {
    throw new HttpError(404, 'Página de agendamento não encontrada');
  }

  const salonId = bookingConfig.salonId;

  // Buscar serviços ativos do salão (usando deletedAt)
  const services = await context.entities.Service.findMany({
    where: {
      salonId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
      description: true,
      duration: true,
      price: true,
    },
    orderBy: {
      name: 'asc',
    },
  });

  // Para cada serviço, contar quantos employees ativos podem fazê-lo
  const servicesWithCount = await Promise.all(
    services.map(async (service) => {
      const employeeCount = await context.entities.EmployeeService.count({
        where: {
          serviceId: service.id,
          employee: {
            salonId,
            acceptsOnlineBooking: true,
            deletedAt: null,
          },
        },
      });

      return {
        ...service,
        employeeCount,
      };
    })
  );

  // Filtrar apenas serviços que têm pelo menos 1 employee disponível
  const availableServices = servicesWithCount.filter((s) => s.employeeCount > 0);

  return {
    services: availableServices,
  };
};

// ============================================================================
// Query: listPublicEmployees
// ============================================================================

type ListPublicEmployeesInput = {
  bookingSlug: string;
  serviceId: string;
};

type ListPublicEmployeesOutput = {
  employees: Array<{
    id: string;
    name: string;
    profilePhoto: string | null;
    bio: string | null;
    specialties: string[];
    customDuration?: number;
    customPrice?: number;
  }>;
};

/**
 * Lista profissionais disponíveis para um serviço específico
 * Operação pública (sem autenticação)
 */
export const listPublicEmployees: ListPublicEmployees<
  ListPublicEmployeesInput,
  ListPublicEmployeesOutput
> = async ({ bookingSlug, serviceId }, context) => {
  // Buscar salon por bookingSlug
  const bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { bookingSlug },
    select: {
      salonId: true,
      enableOnlineBooking: true,
    },
  });

  if (!bookingConfig || !bookingConfig.enableOnlineBooking) {
    throw new HttpError(404, 'Página de agendamento não encontrada');
  }

  const salonId = bookingConfig.salonId;

  // Validar que o serviço existe e pertence ao salão (usando deletedAt)
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      salonId: true,
      deletedAt: true,
    },
  });

  if (!service || service.salonId !== salonId) {
    throw new HttpError(404, 'Serviço não encontrado');
  }

  if (service.deletedAt) {
    throw new HttpError(400, 'Serviço não está disponível');
  }

  // Buscar employees que podem fazer este serviço (usando deletedAt)
  const employeeServices = await context.entities.EmployeeService.findMany({
    where: {
      serviceId,
      employee: {
        salonId,
        acceptsOnlineBooking: true,
        deletedAt: null,
      },
    },
    select: {
      customDuration: true,
      customPrice: true,
      employee: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          bio: true,
          specialties: true,
        },
      },
    },
    orderBy: {
      employee: {
        name: 'asc',
      },
    },
  });

  const employees = employeeServices.map((es) => ({
    id: es.employee.id,
    name: es.employee.name,
    profilePhoto: es.employee.profilePhoto,
    bio: es.employee.bio,
    specialties: es.employee.specialties,
    ...(es.customDuration && { customDuration: es.customDuration }),
    ...(es.customPrice && { customPrice: es.customPrice }),
  }));

  return {
    employees,
  };
};

// ============================================================================
// Query: calculateAvailability
// ============================================================================

type CalculateAvailabilityInput = {
  bookingSlug: string;
  employeeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
};

type CalculateAvailabilityOutput = {
  availableSlots: Array<{
    start: Date;
    end: Date;
  }>;
};

/**
 * Calcula horários disponíveis para um employee em uma data específica
 * Operação pública (sem autenticação)
 */
export const calculateAvailability: CalculateAvailability<
  CalculateAvailabilityInput,
  CalculateAvailabilityOutput
> = async ({ bookingSlug, employeeId, serviceId, date }, context) => {
  // Buscar BookingConfig e validar
  const bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { bookingSlug },
    select: {
      salonId: true,
      enableOnlineBooking: true,
      minAdvanceHours: true,
      maxAdvanceDays: true,
      allowSameDayBooking: true,
      slotInterval: true,
    },
  });

  if (!bookingConfig || !bookingConfig.enableOnlineBooking) {
    throw new HttpError(404, 'Página de agendamento não encontrada');
  }

  const salonId = bookingConfig.salonId;

  // Validar employee (usando deletedAt)
  const employee = await context.entities.Employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      salonId: true,
      acceptsOnlineBooking: true,
      deletedAt: true,
    },
  });

  if (!employee || employee.salonId !== salonId) {
    throw new HttpError(404, 'Profissional não encontrado');
  }

  if (!employee.acceptsOnlineBooking || employee.deletedAt) {
    throw new HttpError(400, 'Profissional não está disponível');
  }

  // Validar service e obter duração
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      salonId: true,
      duration: true,
      deletedAt: true,
    },
  });

  if (!service || service.salonId !== salonId) {
    throw new HttpError(404, 'Serviço não encontrado');
  }

  if (service.deletedAt) {
    throw new HttpError(400, 'Serviço não está disponível');
  }

  // Obter duração customizada se existir
  const employeeService = await context.entities.EmployeeService.findUnique({
    where: {
      employeeId_serviceId: {
        employeeId,
        serviceId,
      },
    },
    select: {
      customDuration: true,
    },
  });

  if (!employeeService) {
    throw new HttpError(400, 'Este profissional não realiza este serviço');
  }

  const duration = employeeService.customDuration || service.duration;

  // Validar data
  const requestedDate = new Date(date + 'T00:00:00');
  const now = new Date();

  const minDate = new Date(now);
  minDate.setHours(now.getHours() + (bookingConfig.minAdvanceHours || 2));

  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + (bookingConfig.maxAdvanceDays || 90));
  maxDate.setHours(23, 59, 59, 999);

  if (requestedDate > maxDate) {
    throw new HttpError(
      400,
      `Agendamento deve ser feito com no máximo ${bookingConfig.maxAdvanceDays} dias de antecedência`
    );
  }

  // Validar same-day booking
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const requestedStart = new Date(requestedDate);
  requestedStart.setHours(0, 0, 0, 0);

  if (!bookingConfig.allowSameDayBooking && requestedStart.getTime() === todayStart.getTime()) {
    throw new HttpError(400, 'Agendamentos no mesmo dia não são permitidos');
  }

  // Buscar horários de trabalho do employee nesta data
  const dayOfWeek = requestedDate.getDay();
  const schedules = await context.entities.EmployeeSchedule.findMany({
    where: {
      employeeId,
      dayOfWeek,
      isActive: true,
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  if (schedules.length === 0) {
    return { availableSlots: [] };
  }

  // Gerar todos os slots possíveis baseados nos schedules
  let allPossibleSlots: Array<{ start: Date; end: Date }> = [];

  for (const schedule of schedules) {
    const slots = generateTimeSlots(date, schedule.startTime, schedule.endTime, duration);
    allPossibleSlots.push(...slots);
  }

  // Buscar appointments existentes do employee nesta data (usando startAt/endAt)
  const startOfDay = new Date(requestedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(requestedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await context.entities.Appointment.findMany({
    where: {
      employeeId,
      startAt: {
        gte: startOfDay,
        lt: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
      deletedAt: null,
    },
    select: {
      startAt: true,
      endAt: true,
    },
  });

  // Filtrar slots que não têm conflito
  const availableSlots = allPossibleSlots.filter((slot) => {
    // Verificar conflito com appointments
    const hasConflict = appointments.some((appt) =>
      hasTimeConflict(
        { start: slot.start, end: slot.end },
        { start: appt.startAt, end: appt.endAt }
      )
    );

    if (hasConflict) return false;

    // Validar horário mínimo de antecedência
    if (slot.start < minDate) return false;

    return true;
  });

  return {
    availableSlots,
  };
};

// ============================================================================
// Action: createPublicAppointment
// ============================================================================

type CreatePublicAppointmentInput = {
  bookingSlug: string;
  employeeId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm

  // Dados do cliente
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: string;
};

type CreatePublicAppointmentOutput = {
  appointment: {
    id: string;
    startAt: Date;
    endAt: Date;
    status: string;
    confirmationCode: string;
  };
  confirmationCode: string;
};

/**
 * Cria um agendamento público (sem autenticação)
 * Operação pública (sem autenticação)
 */
export const createPublicAppointment: CreatePublicAppointment<
  CreatePublicAppointmentInput,
  CreatePublicAppointmentOutput
> = async (
  { bookingSlug, employeeId, serviceId, date, startTime, clientName, clientEmail, clientPhone, notes },
  context
) => {
  // Buscar BookingConfig e validar
  const bookingConfig = await context.entities.BookingConfig.findUnique({
    where: { bookingSlug },
    select: {
      salonId: true,
      enableOnlineBooking: true,
      collectClientPhone: true,
      collectClientEmail: true,
      minAdvanceHours: true,
      maxAdvanceDays: true,
      allowSameDayBooking: true,
      autoApproveBookings: true,
    },
  });

  if (!bookingConfig || !bookingConfig.enableOnlineBooking) {
    throw new HttpError(404, 'Página de agendamento não encontrada');
  }

  const salonId = bookingConfig.salonId;

  // Validar dados do cliente
  if (!clientName || clientName.trim().length < 3) {
    throw new HttpError(400, 'Nome do cliente deve ter pelo menos 3 caracteres');
  }

  if (bookingConfig.collectClientEmail && !clientEmail) {
    throw new HttpError(400, 'Email é obrigatório');
  }

  if (bookingConfig.collectClientPhone && !clientPhone) {
    throw new HttpError(400, 'Telefone é obrigatório');
  }

  if (clientEmail && !isValidEmail(clientEmail)) {
    throw new HttpError(400, 'Email inválido');
  }

  if (clientPhone) {
    const normalizedPhone = normalizePhone(clientPhone);
    if (normalizedPhone.length < 10 || normalizedPhone.length > 11) {
      throw new HttpError(400, 'Telefone inválido');
    }
  }

  // Validar employee (usando deletedAt)
  const employee = await context.entities.Employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      salonId: true,
      userId: true,
      acceptsOnlineBooking: true,
      deletedAt: true,
    },
  });

  if (!employee || employee.salonId !== salonId) {
    throw new HttpError(404, 'Profissional não encontrado');
  }

  if (!employee.acceptsOnlineBooking || employee.deletedAt) {
    throw new HttpError(400, 'Profissional não está disponível');
  }

  // Validar service (usando deletedAt)
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      name: true,
      salonId: true,
      duration: true,
      price: true,
      deletedAt: true,
    },
  });

  if (!service || service.salonId !== salonId) {
    throw new HttpError(404, 'Serviço não encontrado');
  }

  if (service.deletedAt) {
    throw new HttpError(400, 'Serviço não está disponível');
  }

  // Validar EmployeeService
  const employeeService = await context.entities.EmployeeService.findUnique({
    where: {
      employeeId_serviceId: {
        employeeId,
        serviceId,
      },
    },
    select: {
      customDuration: true,
      customPrice: true,
    },
  });

  if (!employeeService) {
    throw new HttpError(400, 'Este profissional não realiza este serviço');
  }

  // Obter duração e preço efetivos
  const duration = employeeService.customDuration || service.duration;
  const price = employeeService.customPrice || service.price;

  // Calcular startAt e endAt como DateTime
  const startAt = parseDateTime(date, startTime);
  const endAt = addMinutes(startAt, duration);

  // Validar data/horário
  const now = new Date();

  const minDate = new Date(now);
  minDate.setHours(now.getHours() + bookingConfig.minAdvanceHours);

  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + bookingConfig.maxAdvanceDays);
  maxDate.setHours(23, 59, 59, 999);

  if (startAt < minDate) {
    throw new HttpError(
      400,
      `Agendamento deve ser feito com pelo menos ${bookingConfig.minAdvanceHours} horas de antecedência`
    );
  }

  if (startAt > maxDate) {
    throw new HttpError(
      400,
      `Agendamento deve ser feito com no máximo ${bookingConfig.maxAdvanceDays} dias de antecedência`
    );
  }

  // Validar same-day booking
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const appointmentDayStart = new Date(startAt);
  appointmentDayStart.setHours(0, 0, 0, 0);

  if (!bookingConfig.allowSameDayBooking && appointmentDayStart.getTime() === todayStart.getTime()) {
    throw new HttpError(400, 'Agendamentos no mesmo dia não são permitidos');
  }

  // Verificar disponibilidade (sem conflitos) usando startAt/endAt
  const dayStart = new Date(startAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(startAt);
  dayEnd.setHours(23, 59, 59, 999);

  const existingAppointments = await context.entities.Appointment.findMany({
    where: {
      employeeId,
      startAt: {
        gte: dayStart,
        lt: dayEnd,
      },
      status: {
        not: 'CANCELLED',
      },
      deletedAt: null,
    },
    select: {
      startAt: true,
      endAt: true,
    },
  });

  const hasConflict = existingAppointments.some((appt) =>
    hasTimeConflict(
      { start: startAt, end: endAt },
      { start: appt.startAt, end: appt.endAt }
    )
  );

  if (hasConflict) {
    throw new HttpError(409, 'Este horário não está mais disponível. Por favor, escolha outro horário.');
  }

  // Buscar ou criar cliente
  let client = await context.entities.Client.findFirst({
    where: {
      salonId,
      ...(clientEmail ? { email: clientEmail } : {}),
      ...(clientPhone ? { phone: normalizePhone(clientPhone) } : {}),
      deletedAt: null,
    },
  });

  // Criar novo cliente se não existir
  if (!client) {
    client = await context.entities.Client.create({
      data: {
        salonId,
        name: clientName.trim(),
        email: clientEmail || null,
        phone: clientPhone ? normalizePhone(clientPhone) : null,
        status: 'ACTIVE',
      },
    });
  }

  // Gerar código de confirmação único
  let confirmationCode = generateConfirmationCode();
  
  let existingCode = await context.entities.Appointment.findFirst({
    where: { confirmationCode },
  });

  while (existingCode) {
    confirmationCode = generateConfirmationCode();
    existingCode = await context.entities.Appointment.findFirst({
      where: { confirmationCode },
    });
  }

  // Criar appointment com startAt e endAt (DateTime)
  const appointment = await context.entities.Appointment.create({
    data: {
      salonId,
      clientId: client.id,
      professionalId: employee.userId || employee.id,
      employeeId,
      startAt,
      endAt,
      status: bookingConfig.autoApproveBookings ? 'CONFIRMED' : 'PENDING',
      confirmationCode,
      notes: notes || null,
      bookedOnline: true,
      bookingSource: 'CLIENT_ONLINE',
      totalPrice: price,
      finalPrice: price,
    },
  });

  // Criar AppointmentService
  await context.entities.AppointmentService.create({
    data: {
      appointmentId: appointment.id,
      serviceId,
      customPrice: price,
      customDuration: duration,
      discount: 0,
    },
  });

  // Criar log de auditoria
  await context.entities.Log.create({
    data: {
      userId: null, // Agendamento público (sem user)
      entity: 'Appointment',
      entityId: appointment.id,
      action: 'PUBLIC_BOOKING',
      before: Prisma.DbNull,
      after: {
        salonId,
        clientId: client.id,
        employeeId,
        serviceId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        clientName,
        clientEmail,
        clientPhone,
      },
    },
  });

  return {
    appointment: {
      id: appointment.id,
      startAt: appointment.startAt,
      endAt: appointment.endAt,
      status: appointment.status,
      confirmationCode: appointment.confirmationCode!,
    },
    confirmationCode,
  };
};
