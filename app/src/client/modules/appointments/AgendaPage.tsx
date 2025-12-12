import { useState, useMemo, useEffect } from 'react';
import { useQuery, listAppointments, listEmployees, listClients, updateAppointmentStatus } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../components/ui/dialog';
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  MoreVertical,
  CalendarDays,
  CalendarRange,
} from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';
import AppointmentModal from './components/AppointmentModal';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfDay,
  endOfDay,
  addDays, 
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  parseISO,
  isSameDay,
  setHours,
  setMinutes,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  getHours,
  getMinutes,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'day' | 'week' | 'month';

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'warning' | 'info' | 'success'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_SERVICE: 'default',
  DONE: 'success',
  CANCELLED: 'destructive',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  IN_SERVICE: 'Em Atendimento',
  DONE: 'Concluído',
  CANCELLED: 'Cancelado',
};

const statusIcons: Record<string, any> = {
  PENDING: AlertCircle,
  CONFIRMED: CheckCircle,
  IN_SERVICE: PlayCircle,
  DONE: CheckCircle,
  CANCELLED: XCircle,
};

// Horários de funcionamento (9h às 20h)
const BUSINESS_HOURS = {
  start: 9,
  end: 20,
};

// Gerar slots de 30 minutos
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    slots.push({ hour, minute: 0 });
    slots.push({ hour, minute: 30 });
  }
  return slots;
};

const TIME_SLOTS = generateTimeSlots();

// Cores para diferentes profissionais (palette moderna)
const PROFESSIONAL_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-orange-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-teal-500',
];

export default function AgendaPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();

  // Estados de visualização
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{
    date: Date;
    time: { hour: number; minute: number };
    professionalId: string;
  } | null>(null);

  // Estados de filtros
  const [search, setSearch] = useState('');
  const [filterProfessionals, setFilterProfessionals] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Estados de modais
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Calcular período baseado no modo de visualização
  const getDateRange = () => {
    switch (viewMode) {
      case 'day':
        return {
          start: format(startOfDay(currentDate), 'yyyy-MM-dd'),
          end: format(endOfDay(currentDate), 'yyyy-MM-dd'),
        };
      case 'week':
        return {
          start: format(startOfWeek(currentDate, { locale: ptBR }), 'yyyy-MM-dd'),
          end: format(endOfWeek(currentDate, { locale: ptBR }), 'yyyy-MM-dd'),
        };
      case 'month':
        return {
          start: format(startOfMonth(currentDate), 'yyyy-MM-dd'),
          end: format(endOfMonth(currentDate), 'yyyy-MM-dd'),
        };
    }
  };

  const { start: startDate, end: endDate } = getDateRange();

  // Queries
  const { data: appointmentsData, isLoading, error, refetch } = useQuery(
    listAppointments,
    {
      salonId: activeSalonId || '',
      status: filterStatus !== 'all' ? (filterStatus as any) : undefined,
      startDate,
      endDate,
      page: 1,
      perPage: 1000,
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const { data: employeesData } = useQuery(
    listEmployees,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );

  const { data: clientsData } = useQuery(
    listClients,
    { salonId: activeSalonId || '', page: 1, perPage: 1000 },
    { enabled: !!activeSalonId }
  );

  const appointments = appointmentsData?.appointments || [];
  const employees = employeesData?.employees || [];
  const clients = clientsData?.clients || [];

  // Profissionais filtrados
  const visibleProfessionals = useMemo(() => {
    if (filterProfessionals.length === 0) {
      return employees;
    }
    return employees.filter((emp: any) => filterProfessionals.includes(emp.userId));
  }, [employees, filterProfessionals]);

  // Filtrar agendamentos
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (appt) =>
          appt.client?.name?.toLowerCase().includes(searchLower) ||
          appt.professional?.name?.toLowerCase().includes(searchLower) ||
          appt.services?.some((s: any) => s.service?.name?.toLowerCase().includes(searchLower))
      );
    }

    if (filterProfessionals.length > 0) {
      filtered = filtered.filter((appt) => filterProfessionals.includes(appt.professionalId));
    }

    return filtered;
  }, [appointments, search, filterProfessionals]);

  const hasActiveFilters =
    search !== '' || filterProfessionals.length > 0 || filterStatus !== 'all';

  const handleClearFilters = () => {
    setSearch('');
    setFilterProfessionals([]);
    setFilterStatus('all');
  };

  // Navegação
  const handlePrev = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
    }
  };

  const handleNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Dias da semana para visualização semanal
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { locale: ptBR });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate]);

  // Dias do mês para visualização mensal
  const monthDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const calendarStart = startOfWeek(start, { locale: ptBR });
    const calendarEnd = endOfWeek(end, { locale: ptBR });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Agrupar agendamentos por profissional, data e horário
  const appointmentsByProfessionalAndTime = useMemo(() => {
    const grouped: Record<string, Record<string, Record<string, any[]>>> = {};

    filteredAppointments.forEach((appt) => {
      const professionalId = appt.professionalId;
      const dateKey = format(parseISO(appt.startAt), 'yyyy-MM-dd');
      const timeKey = format(parseISO(appt.startAt), 'HH:mm');

      if (!grouped[professionalId]) grouped[professionalId] = {};
      if (!grouped[professionalId][dateKey]) grouped[professionalId][dateKey] = {};
      if (!grouped[professionalId][dateKey][timeKey])
        grouped[professionalId][dateKey][timeKey] = [];

      grouped[professionalId][dateKey][timeKey].push(appt);
    });

    return grouped;
  }, [filteredAppointments]);

  // Agrupar agendamentos por dia para visualização mensal
  const appointmentsByDay = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    filteredAppointments.forEach((appt) => {
      const dateKey = format(parseISO(appt.startAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(appt);
    });
    return grouped;
  }, [filteredAppointments]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = filteredAppointments.length;
    const pending = filteredAppointments.filter((a) => a.status === 'PENDING').length;
    const confirmed = filteredAppointments.filter((a) => a.status === 'CONFIRMED').length;
    const done = filteredAppointments.filter((a) => a.status === 'DONE').length;
    const cancelled = filteredAppointments.filter((a) => a.status === 'CANCELLED').length;

    return { total, pending, confirmed, done, cancelled };
  }, [filteredAppointments]);

  const formatTime = (dateString: string) => {
    return format(parseISO(dateString), 'HH:mm', { locale: ptBR });
  };

  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleSlotClick = (
    date: Date,
    time: { hour: number; minute: number },
    professionalId: string
  ) => {
    setSelectedSlot({ date, time, professionalId });
    setSelectedAppointment(null);
    setIsAppointmentModalOpen(true);
  };

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailsModalOpen(true);
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      await updateAppointmentStatus({
        appointmentId,
        salonId: activeSalonId!,
        status: newStatus as any,
      });

      toast({
        title: 'Status atualizado',
        description: 'O status do agendamento foi atualizado com sucesso',
      });

      refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível atualizar o status',
        variant: 'destructive',
      });
    }
  };

  const toggleProfessionalFilter = (professionalId: string) => {
    setFilterProfessionals((prev) =>
      prev.includes(professionalId)
        ? prev.filter((id) => id !== professionalId)
        : [...prev, professionalId]
    );
  };

  // Calcular duração e posição do agendamento na grade
  const getAppointmentStyle = (appointment: any) => {
    const start = parseISO(appointment.startAt);
    const end = parseISO(appointment.endAt);
    const startMinutes = getHours(start) * 60 + getMinutes(start);
    const endMinutes = getHours(end) * 60 + getMinutes(end);
    const duration = endMinutes - startMinutes;
    const height = (duration / 30) * 60; // 60px por slot de 30 min

    return {
      height: `${height}px`,
      minHeight: '40px',
    };
  };

  const getPeriodTitle = () => {
    switch (viewMode) {
      case 'day':
        return format(currentDate, "EEEE, dd 'de' MMMM", { locale: ptBR });
      case 'week':
        const weekStart = startOfWeek(currentDate, { locale: ptBR });
        const weekEnd = endOfWeek(currentDate, { locale: ptBR });
        return `${format(weekStart, 'dd MMM', { locale: ptBR })} - ${format(
          weekEnd,
          'dd MMM yyyy',
          { locale: ptBR }
        )}`;
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: ptBR });
    }
  };

  if (!activeSalonId) {
    return (
      <div className='flex items-center justify-center h-96'>
        <p className='text-muted-foreground'>Selecione um salão para continuar</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Agenda</h1>
          <p className='text-muted-foreground'>Gerencie os agendamentos do seu salão</p>
        </div>
        <Button onClick={() => setIsAppointmentModalOpen(true)}>
          <Plus className='mr-2 h-4 w-4' />
          Novo Agendamento
        </Button>
      </div>

      {/* Stats Cards */}
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5'>
        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-primary/10 rounded-lg'>
                <CalendarIcon className='h-6 w-6 text-primary' />
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Total</p>
                <p className='text-2xl font-bold'>{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-yellow-500/10 rounded-lg'>
                <AlertCircle className='h-6 w-6 text-yellow-500' />
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Pendentes</p>
                <p className='text-2xl font-bold'>{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-blue-500/10 rounded-lg'>
                <CheckCircle className='h-6 w-6 text-blue-500' />
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Confirmados</p>
                <p className='text-2xl font-bold'>{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-green-500/10 rounded-lg'>
                <CheckCircle className='h-6 w-6 text-green-500' />
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Concluídos</p>
                <p className='text-2xl font-bold'>{stats.done}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-6'>
            <div className='flex items-center gap-4'>
              <div className='p-3 bg-red-500/10 rounded-lg'>
                <XCircle className='h-6 w-6 text-red-500' />
              </div>
              <div>
                <p className='text-sm font-medium text-muted-foreground'>Cancelados</p>
                <p className='text-2xl font-bold'>{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Selector & Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4'>
            {/* View Mode Buttons */}
            <div className='flex items-center justify-between flex-wrap gap-4'>
              <div className='flex items-center gap-2'>
                <Button
                  variant={viewMode === 'day' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setViewMode('day')}
                >
                  <CalendarDays className='mr-2 h-4 w-4' />
                  Diário
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setViewMode('week')}
                >
                  <CalendarRange className='mr-2 h-4 w-4' />
                  Semanal
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setViewMode('month')}
                >
                  <CalendarIcon className='mr-2 h-4 w-4' />
                  Mensal
                </Button>
              </div>

              {/* Navigation */}
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='sm' onClick={handleToday}>
                  Hoje
                </Button>
                <Button variant='outline' size='icon' onClick={handlePrev}>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <div className='min-w-[200px] text-center'>
                  <span className='font-medium capitalize'>{getPeriodTitle()}</span>
                </div>
                <Button variant='outline' size='icon' onClick={handleNext}>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className='flex flex-col gap-4'>
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar por cliente, profissional ou serviço...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='pl-10'
                />
              </div>

              <div className='flex items-center gap-2 flex-wrap'>
                {/* Filtro de Profissionais */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='gap-2'>
                      <User className='h-4 w-4' />
                      Profissionais
                      {filterProfessionals.length > 0 && (
                        <Badge variant='secondary' className='ml-1 px-1.5 py-0.5 text-xs'>
                          {filterProfessionals.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-56'>
                    <DropdownMenuLabel>Selecionar profissionais</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {employees.map((emp: any) => (
                      <DropdownMenuItem
                        key={emp.userId}
                        onClick={() => toggleProfessionalFilter(emp.userId)}
                        className='flex items-center gap-2'
                      >
                        <div
                          className={`w-4 h-4 rounded border ${
                            filterProfessionals.includes(emp.userId)
                              ? 'bg-primary border-primary'
                              : 'border-input'
                          }`}
                        >
                          {filterProfessionals.includes(emp.userId) && (
                            <CheckCircle className='h-3 w-3 text-primary-foreground' />
                          )}
                        </div>
                        {emp.user?.name || emp.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Filtro de Status */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='gap-2'>
                      <Filter className='h-4 w-4' />
                      Status
                      {filterStatus !== 'all' && (
                        <Badge variant='secondary' className='ml-1 px-1.5 py-0.5 text-xs'>
                          1
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                      Todos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('PENDING')}>
                      Pendente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('CONFIRMED')}>
                      Confirmado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('IN_SERVICE')}>
                      Em Atendimento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('DONE')}>
                      Concluído
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterStatus('CANCELLED')}>
                      Cancelado
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleClearFilters}
                    className='gap-2'
                  >
                    <X className='h-4 w-4' />
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views */}
      {isLoading ? (
        <Card>
          <CardContent className='flex items-center justify-center p-12'>
            <p className='text-sm text-muted-foreground'>Carregando agenda...</p>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className='flex items-center justify-center p-12'>
            <p className='text-sm text-destructive'>
              Erro ao carregar agenda: {error.message}
            </p>
          </CardContent>
        </Card>
      ) : visibleProfessionals.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center p-12 text-center'>
            <User className='h-12 w-12 text-muted-foreground mb-4' />
            <h3 className='text-lg font-semibold mb-2'>Nenhum profissional selecionado</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              Selecione pelo menos um profissional para visualizar a agenda
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Day & Week View - Timeline por profissional */}
          {(viewMode === 'day' || viewMode === 'week') && (
            <Card>
              <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                  <div className='min-w-[800px]'>
                    {/* Header com nomes dos profissionais */}
                    <div className='grid border-b sticky top-0 bg-background z-10'
                      style={{
                        gridTemplateColumns: `80px repeat(${
                          viewMode === 'day' ? visibleProfessionals.length : weekDays.length
                        }, 1fr)`,
                      }}
                    >
                      <div className='p-4 border-r bg-muted/50'>
                        <Clock className='h-4 w-4 text-muted-foreground' />
                      </div>
                      {viewMode === 'day'
                        ? visibleProfessionals.map((emp: any, idx) => (
                            <div
                              key={emp.userId}
                              className='p-4 border-r text-center bg-muted/50'
                            >
                              <div className='font-medium'>{emp.user?.name || emp.name}</div>
                              <div
                                className={`w-2 h-2 rounded-full mx-auto mt-2 ${
                                  PROFESSIONAL_COLORS[idx % PROFESSIONAL_COLORS.length]
                                }`}
                              />
                            </div>
                          ))
                        : weekDays.map((day) => (
                            <div
                              key={day.toString()}
                              className={`p-4 border-r text-center ${
                                isToday(day) ? 'bg-primary/5' : 'bg-muted/50'
                              }`}
                            >
                              <div className='text-sm text-muted-foreground'>
                                {format(day, 'EEE', { locale: ptBR })}
                              </div>
                              <div
                                className={`text-lg font-medium ${
                                  isToday(day) ? 'text-primary' : ''
                                }`}
                              >
                                {format(day, 'dd', { locale: ptBR })}
                              </div>
                            </div>
                          ))}
                    </div>

                    {/* Grade de horários */}
                    <div className='relative'>
                      {TIME_SLOTS.map((slot, slotIdx) => (
                        <div
                          key={`${slot.hour}-${slot.minute}`}
                          className={`grid border-b ${
                            slot.minute === 0 ? 'border-b-2' : ''
                          }`}
                          style={{
                            gridTemplateColumns: `80px repeat(${
                              viewMode === 'day'
                                ? visibleProfessionals.length
                                : weekDays.length
                            }, 1fr)`,
                            height: '60px',
                          }}
                        >
                          {/* Coluna de horários */}
                          <div
                            className={`p-2 border-r text-xs text-muted-foreground ${
                              slot.minute === 0 ? 'font-medium' : 'text-muted-foreground/60'
                            }`}
                          >
                            {slot.minute === 0
                              ? `${slot.hour.toString().padStart(2, '0')}:00`
                              : ''}
                          </div>

                          {/* Células de agendamento */}
                          {viewMode === 'day'
                            ? visibleProfessionals.map((emp: any, empIdx) => {
                                const dateKey = format(currentDate, 'yyyy-MM-dd');
                                const timeKey = `${slot.hour
                                  .toString()
                                  .padStart(2, '0')}:${slot.minute
                                  .toString()
                                  .padStart(2, '0')}`;
                                const slotAppointments =
                                  appointmentsByProfessionalAndTime[emp.userId]?.[dateKey]?.[
                                    timeKey
                                  ] || [];

                                return (
                                  <div
                                    key={emp.userId}
                                    className='border-r relative group hover:bg-muted/30 cursor-pointer transition-colors'
                                    onClick={() => {
                                      if (slotAppointments.length === 0) {
                                        handleSlotClick(currentDate, slot, emp.userId);
                                      }
                                    }}
                                  >
                                    {slotAppointments.length === 0 && (
                                      <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                                        <Plus className='h-4 w-4 text-muted-foreground' />
                                      </div>
                                    )}
                                    {slotAppointments.map((appt) => (
                                      <div
                                        key={appt.id}
                                        className={`absolute inset-x-1 rounded p-1 text-xs text-white cursor-pointer ${
                                          PROFESSIONAL_COLORS[
                                            empIdx % PROFESSIONAL_COLORS.length
                                          ]
                                        } hover:opacity-90 transition-opacity overflow-hidden`}
                                        style={getAppointmentStyle(appt)}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleAppointmentClick(appt);
                                        }}
                                      >
                                        <div className='font-medium truncate'>
                                          {appt.client?.name}
                                        </div>
                                        <div className='text-[10px] opacity-90 truncate'>
                                          {appt.services
                                            ?.map((s: any) => s.service?.name)
                                            .join(', ')}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })
                            : weekDays.map((day) => {
                                const dateKey = format(day, 'yyyy-MM-dd');
                                const hasAppointments = visibleProfessionals.some(
                                  (emp: any) => {
                                    const timeKey = `${slot.hour
                                      .toString()
                                      .padStart(2, '0')}:${slot.minute
                                      .toString()
                                      .padStart(2, '0')}`;
                                    return (
                                      appointmentsByProfessionalAndTime[emp.userId]?.[
                                        dateKey
                                      ]?.[timeKey]?.length > 0
                                    );
                                  }
                                );

                                return (
                                  <div
                                    key={day.toString()}
                                    className={`border-r relative group hover:bg-muted/30 cursor-pointer transition-colors ${
                                      isToday(day) ? 'bg-primary/5' : ''
                                    }`}
                                    onClick={() => {
                                      if (!hasAppointments && visibleProfessionals.length > 0) {
                                        handleSlotClick(day, slot, visibleProfessionals[0].userId);
                                      }
                                    }}
                                  >
                                    {!hasAppointments && (
                                      <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                                        <Plus className='h-4 w-4 text-muted-foreground' />
                                      </div>
                                    )}
                                    {visibleProfessionals.map((emp: any, empIdx) => {
                                      const timeKey = `${slot.hour
                                        .toString()
                                        .padStart(2, '0')}:${slot.minute
                                        .toString()
                                        .padStart(2, '0')}`;
                                      const slotAppointments =
                                        appointmentsByProfessionalAndTime[emp.userId]?.[
                                          dateKey
                                        ]?.[timeKey] || [];

                                      return slotAppointments.map((appt) => (
                                        <div
                                          key={appt.id}
                                          className={`absolute inset-x-1 rounded p-1 text-xs text-white cursor-pointer ${
                                            PROFESSIONAL_COLORS[
                                              empIdx % PROFESSIONAL_COLORS.length
                                            ]
                                          } hover:opacity-90 transition-opacity overflow-hidden`}
                                          style={getAppointmentStyle(appt)}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAppointmentClick(appt);
                                          }}
                                        >
                                          <div className='font-medium truncate'>
                                            {appt.client?.name}
                                          </div>
                                          <div className='text-[10px] opacity-90 truncate'>
                                            {appt.services
                                              ?.map((s: any) => s.service?.name)
                                              .join(', ')}
                                          </div>
                                        </div>
                                      ));
                                    })}
                                  </div>
                                );
                              })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Month View - Calendar Grid */}
          {viewMode === 'month' && (
            <Card>
              <CardContent className='p-6'>
                <div className='calendar-grid'>
                  {/* Header dos dias da semana */}
                  <div className='grid grid-cols-7 gap-2 mb-2'>
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                      <div
                        key={day}
                        className='text-center text-sm font-medium text-muted-foreground py-2'
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Grid de dias */}
                  <div className='grid grid-cols-7 gap-2'>
                    {monthDays.map((day, idx) => {
                      const dateKey = format(day, 'yyyy-MM-dd');
                      const dayAppointments = appointmentsByDay[dateKey] || [];
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const isTodayDate = isToday(day);

                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            if (visibleProfessionals.length > 0) {
                              handleSlotClick(
                                day,
                                { hour: 9, minute: 0 },
                                visibleProfessionals[0].userId
                              );
                            }
                          }}
                          className={`min-h-[100px] p-2 rounded-lg border cursor-pointer transition-colors ${
                            isTodayDate
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/30 hover:bg-muted/50'
                          } ${!isCurrentMonth ? 'opacity-50' : ''}`}
                        >
                          <div
                            className={`text-sm font-medium mb-1 ${
                              isTodayDate ? 'text-primary' : 'text-foreground'
                            }`}
                          >
                            {format(day, 'd')}
                          </div>
                          <div className='space-y-1'>
                            {dayAppointments.slice(0, 2).map((appt: any) => {
                              const professionalIdx = visibleProfessionals.findIndex(
                                (emp: any) => emp.userId === appt.professionalId
                              );
                              const colorClass =
                                PROFESSIONAL_COLORS[
                                  professionalIdx !== -1
                                    ? professionalIdx % PROFESSIONAL_COLORS.length
                                    : 0
                                ];

                              return (
                                <div
                                  key={appt.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAppointmentClick(appt);
                                  }}
                                  className={`text-xs p-1 rounded ${colorClass} text-white truncate hover:opacity-90`}
                                >
                                  {formatTime(appt.startAt)} - {appt.client?.name}
                                </div>
                              );
                            })}
                            {dayAppointments.length > 2 && (
                              <div className='text-xs text-muted-foreground'>
                                +{dayAppointments.length - 2} mais
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={setIsAppointmentModalOpen}
        onSuccess={() => refetch()}
        initialData={
          selectedSlot
            ? {
                date: selectedSlot.date,
                time: selectedSlot.time,
                professionalId: selectedSlot.professionalId,
              }
            : undefined
        }
      />

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
            <DialogDescription>Informações completas do agendamento</DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium'>Cliente</p>
                  <p className='text-sm text-muted-foreground'>
                    {selectedAppointment.client?.name}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Profissional</p>
                  <p className='text-sm text-muted-foreground'>
                    {selectedAppointment.professional?.name}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Data</p>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(selectedAppointment.startAt)}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium'>Horário</p>
                  <p className='text-sm text-muted-foreground'>
                    {formatTime(selectedAppointment.startAt)} -{' '}
                    {formatTime(selectedAppointment.endAt)}
                  </p>
                </div>
                <div className='col-span-2'>
                  <p className='text-sm font-medium mb-2'>Status</p>
                  <div className='flex items-center gap-2'>
                    <Badge variant={statusColors[selectedAppointment.status]}>
                      {statusLabels[selectedAppointment.status]}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='outline' size='sm'>
                          Alterar Status
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {selectedAppointment.status !== 'CONFIRMED' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(selectedAppointment.id, 'CONFIRMED')
                            }
                          >
                            <CheckCircle className='mr-2 h-4 w-4 text-blue-500' />
                            Confirmar
                          </DropdownMenuItem>
                        )}
                        {selectedAppointment.status !== 'IN_SERVICE' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(selectedAppointment.id, 'IN_SERVICE')
                            }
                          >
                            <PlayCircle className='mr-2 h-4 w-4' />
                            Iniciar Atendimento
                          </DropdownMenuItem>
                        )}
                        {selectedAppointment.status !== 'DONE' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(selectedAppointment.id, 'DONE')}
                          >
                            <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                            Concluir
                          </DropdownMenuItem>
                        )}
                        {selectedAppointment.status !== 'CANCELLED' && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(selectedAppointment.id, 'CANCELLED')
                            }
                            className='text-destructive'
                          >
                            <XCircle className='mr-2 h-4 w-4' />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div>
                <p className='text-sm font-medium mb-2'>Serviços</p>
                <div className='space-y-2'>
                  {selectedAppointment.services?.map((s: any) => (
                    <div
                      key={s.id}
                      className='flex items-center justify-between p-2 border rounded'
                    >
                      <span className='text-sm'>{s.service?.name}</span>
                      <span className='text-sm text-muted-foreground'>
                        {s.service?.duration} min
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedAppointment.notes && (
                <div>
                  <p className='text-sm font-medium mb-2'>Observações</p>
                  <p className='text-sm text-muted-foreground'>{selectedAppointment.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
