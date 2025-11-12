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
 * Converte string "HH:mm" para minutos desde meia-noite
 * @param timeStr - Horário no formato "HH:mm"
 * @returns Minutos desde 00:00
 * @example parseTime("09:30") → 570
 */
export function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Converte minutos desde meia-noite para string "HH:mm"
 * @param minutes - Minutos desde 00:00
 * @returns Horário no formato "HH:mm"
 * @example formatTime(570) → "09:30"
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Adiciona minutos a um horário
 * @param timeStr - Horário no formato "HH:mm"
 * @param minutes - Minutos a adicionar
 * @returns Novo horário no formato "HH:mm"
 * @example addMinutes("09:00", 30) → "09:30"
 */
export function addMinutes(timeStr: string, minutes: number): string {
  const totalMinutes = parseTime(timeStr) + minutes;
  return formatTime(totalMinutes);
}

/**
 * Gera array de slots de tempo
 * @param startTime - Horário inicial "HH:mm"
 * @param endTime - Horário final "HH:mm"
 * @param duration - Duração de cada slot em minutos
 * @returns Array de horários "HH:mm"
 * @example generateTimeSlots("09:00", "12:00", 60) → ["09:00", "10:00", "11:00"]
 */
export function generateTimeSlots(startTime: string, endTime: string, duration: number): string[] {
  const slots: string[] = [];
  const startMinutes = parseTime(startTime);
  const endMinutes = parseTime(endTime);

  for (let current = startMinutes; current + duration <= endMinutes; current += duration) {
    slots.push(formatTime(current));
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
  slot: { start: string; end: string },
  appointment: { start: string; end: string }
): boolean {
  const slotStart = parseTime(slot.start);
  const slotEnd = parseTime(slot.end);
  const apptStart = parseTime(appointment.start);
  const apptEnd = parseTime(appointment.end);

  return slotStart < apptEnd && slotEnd > apptStart;
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
export const getBookingConfig: GetBookingConfig<
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

  // Validações
  if (!bookingConfig) {
    throw new HttpError(404, 'Página de agendamento não encontrada');
  }

  if (!bookingConfig.enableOnlineBooking) {
    throw new HttpError(403, 'Agendamento online não está ativo para este salão');
  }

  if (bookingConfig.salon.deletedAt) {
    throw new HttpError(404, 'Salão não está mais disponível');
  }

  return {
    config: {
      id: bookingConfig.id,
      enableOnlineBooking: bookingConfig.enableOnlineBooking,
      bookingPageTitle: bookingConfig.bookingPageTitle,
      bookingPageDescription: bookingConfig.bookingPageDescription,
      bookingPageLogo: bookingConfig.bookingPageLogo,
      bookingPageBanner: bookingConfig.bookingPageBanner,
      bookingPagePrimaryColor: bookingConfig.bookingPagePrimaryColor,
      bookingPageTheme: bookingConfig.bookingPageTheme,
      requireClientRegistration: bookingConfig.requireClientRegistration,
      collectClientPhone: bookingConfig.collectClientPhone,
      collectClientEmail: bookingConfig.collectClientEmail,
      collectClientNotes: bookingConfig.collectClientNotes,
      showProfessionalPhotos: bookingConfig.showProfessionalPhotos,
      showServicePrices: bookingConfig.showServicePrices,
      enableServiceSelection: bookingConfig.enableServiceSelection,
      enableProfessionalChoice: bookingConfig.enableProfessionalChoice,
      requireTermsAcceptance: bookingConfig.requireTermsAcceptance,
      bookingTermsText: bookingConfig.bookingTermsText,
      minAdvanceHours: bookingConfig.minAdvanceHours,
      maxAdvanceDays: bookingConfig.maxAdvanceDays,
      allowSameDayBooking: bookingConfig.allowSameDayBooking,
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

  // Buscar serviços ativos do salão
  const services = await context.entities.Service.findMany({
    where: {
      salonId,
      isActive: true,
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
            isActive: true,
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

  // Validar que o serviço existe e pertence ao salão
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      salonId: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!service || service.salonId !== salonId) {
    throw new HttpError(404, 'Serviço não encontrado');
  }

  if (!service.isActive || service.deletedAt) {
    throw new HttpError(400, 'Serviço não está disponível');
  }

  // Buscar employees que podem fazer este serviço
  const employeeServices = await context.entities.EmployeeService.findMany({
    where: {
      serviceId,
      employee: {
        salonId,
        isActive: true,
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
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }>;
};

/**
 * Calcula slots de horário disponíveis para um employee em uma data
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
    },
  });

  if (!bookingConfig || !bookingConfig.enableOnlineBooking) {
    throw new HttpError(404, 'Página de agendamento não encontrada');
  }

  const salonId = bookingConfig.salonId;

  // Validar employee
  const employee = await context.entities.Employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      salonId: true,
      isActive: true,
      acceptsOnlineBooking: true,
      deletedAt: true,
    },
  });

  if (!employee || employee.salonId !== salonId) {
    throw new HttpError(404, 'Profissional não encontrado');
  }

  if (!employee.isActive || !employee.acceptsOnlineBooking || employee.deletedAt) {
    throw new HttpError(400, 'Profissional não está disponível para agendamento online');
  }

  // Validar service
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      salonId: true,
      duration: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!service || service.salonId !== salonId) {
    throw new HttpError(404, 'Serviço não encontrado');
  }

  if (!service.isActive || service.deletedAt) {
    throw new HttpError(400, 'Serviço não está disponível');
  }

  // Validar que o employee pode fazer este serviço
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

  // Obter duração efetiva do serviço
  const duration = employeeService.customDuration || service.duration;

  // Validar data
  const requestedDate = new Date(date + 'T00:00:00');
  const now = new Date();
  
  // Validar limites de data
  const minDate = new Date(now);
  minDate.setHours(now.getHours() + bookingConfig.minAdvanceHours);
  
  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + bookingConfig.maxAdvanceDays);
  maxDate.setHours(23, 59, 59, 999);

  if (requestedDate > maxDate) {
    throw new HttpError(
      400,
      `Data muito distante. Agendamentos são permitidos até ${bookingConfig.maxAdvanceDays} dias no futuro.`
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

  // Calcular dia da semana (0 = Domingo, 6 = Sábado)
  const dayOfWeek = requestedDate.getDay();

  // Buscar schedules do employee para este dia da semana
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
  let allPossibleSlots: Array<{ startTime: string; endTime: string }> = [];

  for (const schedule of schedules) {
    const slots = generateTimeSlots(schedule.startTime, schedule.endTime, duration);
    allPossibleSlots.push(
      ...slots.map((start) => ({
        startTime: start,
        endTime: addMinutes(start, duration),
      }))
    );
  }

  // Buscar appointments existentes do employee nesta data
  const startOfDay = new Date(requestedDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(requestedDate);
  endOfDay.setHours(23, 59, 59, 999);

  const appointments = await context.entities.Appointment.findMany({
    where: {
      employeeId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
      deletedAt: null,
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  // Filtrar slots que não têm conflito
  const availableSlots = allPossibleSlots.filter((slot) => {
    // Verificar conflito com appointments
    const hasConflict = appointments.some((appt) =>
      hasTimeConflict(
        { start: slot.startTime, end: slot.endTime },
        { start: appt.startTime, end: appt.endTime }
      )
    );

    if (hasConflict) return false;

    // Validar horário mínimo de antecedência
    const slotDateTime = new Date(date + 'T' + slot.startTime + ':00');
    if (slotDateTime < minDate) return false;

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
    date: Date;
    startTime: string;
    endTime: string;
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

  // Validar employee
  const employee = await context.entities.Employee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      salonId: true,
      isActive: true,
      acceptsOnlineBooking: true,
      deletedAt: true,
    },
  });

  if (!employee || employee.salonId !== salonId) {
    throw new HttpError(404, 'Profissional não encontrado');
  }

  if (!employee.isActive || !employee.acceptsOnlineBooking || employee.deletedAt) {
    throw new HttpError(400, 'Profissional não está disponível');
  }

  // Validar service
  const service = await context.entities.Service.findUnique({
    where: { id: serviceId },
    select: {
      id: true,
      name: true,
      salonId: true,
      duration: true,
      price: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!service || service.salonId !== salonId) {
    throw new HttpError(404, 'Serviço não encontrado');
  }

  if (!service.isActive || service.deletedAt) {
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

  // Calcular endTime
  const endTime = addMinutes(startTime, duration);

  // Validar data/horário
  const appointmentDate = new Date(date + 'T00:00:00');
  const now = new Date();

  const minDate = new Date(now);
  minDate.setHours(now.getHours() + bookingConfig.minAdvanceHours);

  const maxDate = new Date(now);
  maxDate.setDate(maxDate.getDate() + bookingConfig.maxAdvanceDays);
  maxDate.setHours(23, 59, 59, 999);

  const appointmentDateTime = new Date(date + 'T' + startTime + ':00');

  if (appointmentDateTime < minDate) {
    throw new HttpError(
      400,
      `Agendamento deve ser feito com pelo menos ${bookingConfig.minAdvanceHours} horas de antecedência`
    );
  }

  if (appointmentDate > maxDate) {
    throw new HttpError(
      400,
      `Agendamento deve ser feito com no máximo ${bookingConfig.maxAdvanceDays} dias de antecedência`
    );
  }

  // Validar same-day booking
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const appointmentStart = new Date(appointmentDate);
  appointmentStart.setHours(0, 0, 0, 0);

  if (!bookingConfig.allowSameDayBooking && appointmentStart.getTime() === todayStart.getTime()) {
    throw new HttpError(400, 'Agendamentos no mesmo dia não são permitidos');
  }

  // Verificar disponibilidade (sem conflitos)
  const startOfDay = new Date(appointmentDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(appointmentDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await context.entities.Appointment.findMany({
    where: {
      employeeId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: {
        not: 'CANCELLED',
      },
      deletedAt: null,
    },
    select: {
      startTime: true,
      endTime: true,
    },
  });

  const hasConflict = existingAppointments.some((appt) =>
    hasTimeConflict(
      { start: startTime, end: endTime },
      { start: appt.startTime, end: appt.endTime }
    )
  );

  if (hasConflict) {
    throw new HttpError(409, 'Este horário não está mais disponível. Por favor, escolha outro horário.');
  }

  // Buscar ou criar cliente
  let client = null;

  // Tentar encontrar cliente existente por email ou telefone
  if (clientEmail) {
    client = await context.entities.Client.findFirst({
      where: {
        salonId,
        email: clientEmail,
        deletedAt: null,
      },
    });
  }

  if (!client && clientPhone) {
    const normalizedPhone = normalizePhone(clientPhone);
    client = await context.entities.Client.findFirst({
      where: {
        salonId,
        phone: normalizedPhone,
        deletedAt: null,
      },
    });
  }

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
  } else {
    // Atualizar dados do cliente se necessário
    await context.entities.Client.update({
      where: { id: client.id },
      data: {
        name: clientName.trim(),
        ...(clientEmail && { email: clientEmail }),
        ...(clientPhone && { phone: normalizePhone(clientPhone) }),
      },
    });
  }

  // Gerar código de confirmação único
  let confirmationCode = generateConfirmationCode();
  
  // Garantir que o código seja único
  let existingCode = await context.entities.Appointment.findFirst({
    where: { confirmationCode },
  });

  while (existingCode) {
    confirmationCode = generateConfirmationCode();
    existingCode = await context.entities.Appointment.findFirst({
      where: { confirmationCode },
    });
  }

  // Criar appointment
  const appointment = await context.entities.Appointment.create({
    data: {
      salonId,
      clientId: client.id,
      professionalId: employee.userId || employeeId,
      employeeId,
      date: appointmentDate,
      startAt: appointmentDateTime,
      endAt: new Date(date + 'T' + endTime + ':00'),
      startTime,
      endTime,
      status: bookingConfig.autoApproveBookings ? 'CONFIRMED' : 'PENDING',
      confirmationCode,
      notes: notes || null,
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
        date,
        startTime,
        endTime,
        clientName,
        clientEmail,
        clientPhone,
      },
    },
  });

  // TODO: Enviar email de confirmação se clientEmail fornecido
  // Isso seria integrado com o sistema de notificações

  return {
    appointment: {
      id: appointment.id,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      status: appointment.status,
      confirmationCode: appointment.confirmationCode,
    },
    confirmationCode,
  };
};
