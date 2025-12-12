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
  DropdownMenuCheckboxItem,
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
  Users,
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

// Cores padrão caso o colaborador não tenha cor definida
const DEFAULT_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F59E0B', // orange
  '#06B6D4', // cyan
  '#6366F1', // indigo
  '#14B8A6', // teal
];

// Gerar slots de 30 minutos
const generateTimeSlots = (): { hour: number; minute: number }[] => {
  const slots: { hour: number; minute: number }[] = [];
  for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
    slots.push({ hour, minute: 0 });
    slots.push({ hour, minute: 30 });
  }
  return slots;
};

const TIME_SLOTS: { hour: number; minute: number }[] = generateTimeSlots();

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
  const [filterStatus, setFilterStatus] = useState<string[]>([]);

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
      status: filterStatus.length > 0 ? (filterStatus[0] as any) : undefined,
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

  // Debug: verificar dados dos employees
  useEffect(() => {
    if (employees.length > 0) {
      console.log('=== EMPLOYEES DATA ===');
      employees.forEach((emp: any) => {
        console.log({
          id: emp.id,
          name: emp.name,
          userId: emp.userId,
          color: emp.color,
          userName: emp.user?.name,
        });
      });
    }
  }, [employees]);

  // Map de cores dos profissionais (usando a cor do banco de dados)
  const professionalColors = useMemo(() => {
    const colorMap: Record<string, string> = {};
    let colorIndex = 0;
    
    employees.forEach((emp: any) => {
      // Só mapeia se o employee tiver userId (ou seja, está vinculado a um User)
      if (emp.userId) {
        // Usa a cor do banco ou cor padrão baseado no índice único
        const color = emp.color || DEFAULT_COLORS[colorIndex % DEFAULT_COLORS.length];
        colorMap[emp.userId] = color;
        console.log(`Mapping userId ${emp.userId} (${emp.name || emp.user?.name}) to color: ${color}`);
        colorIndex++;
      } else {
        console.warn(`Employee ${emp.id} (${emp.name}) has no userId - skipping color mapping`);
      }
    });
    
    console.log('=== FINAL COLOR MAP ===', colorMap);
    return colorMap;
  }, [employees]);

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

    if (filterStatus.length > 0) {
      filtered = filtered.filter((appt) => filterStatus.includes(appt.status));
    }

    return filtered;
  }, [appointments, search, filterProfessionals, filterStatus]);

  const hasActiveFilters =
    search !== '' || filterProfessionals.length > 0 || filterStatus.length > 0;

  const handleClearFilters = () => {
    setSearch('');
    setFilterProfessionals([]);
    setFilterStatus([]);
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
      setIsDetailsModalOpen(false);
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

  const toggleStatusFilter = (status: string) => {
    setFilterStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
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

  // Converter cor hex para classes de background e texto
  const getColorClasses = (hexColor: string) => {
    return {
      background: hexColor,
      text: '#ffffff', // Sempre branco para contraste
    };
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
        <Button onClick={() => {
          setSelectedSlot(null);
          setSelectedAppointment(null);
          setIsAppointmentModalOpen(true);
        }}>
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
                      <DropdownMenuCheckboxItem
                        key={emp.userId}
                        checked={filterProfessionals.includes(emp.userId)}
                        onCheckedChange={() => toggleProfessionalFilter(emp.userId)}
                      >
                        <div className='flex items-center gap-2'>
                          <div
                            className='w-3 h-3 rounded-full'
                            style={{
                              backgroundColor: professionalColors[emp.userId],
                            }}
                          />
                          {emp.user?.name || emp.name}
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Filtro de Status */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='gap-2'>
                      <Filter className='h-4 w-4' />
                      Status
                      {filterStatus.length > 0 && (
                        <Badge variant='secondary' className='ml-1 px-1.5 py-0.5 text-xs'>
                          {filterStatus.length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start'>
                    <DropdownMenuLabel>Selecionar status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.includes('PENDING')}
                      onCheckedChange={() => toggleStatusFilter('PENDING')}
                    >
                      Pendente
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.includes('CONFIRMED')}
                      onCheckedChange={() => toggleStatusFilter('CONFIRMED')}
                    >
                      Confirmado
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.includes('IN_SERVICE')}
                      onCheckedChange={() => toggleStatusFilter('IN_SERVICE')}
                    >
                      Em Atendimento
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.includes('DONE')}
                      onCheckedChange={() => toggleStatusFilter('DONE')}
                    >
                      Concluído
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterStatus.includes('CANCELLED')}
                      onCheckedChange={() => toggleStatusFilter('CANCELLED')}
                    >
                      Cancelado
                    </DropdownMenuCheckboxItem>
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

              {/* Legenda de Cores dos Profissionais */}
              {visibleProfessionals.length > 0 && (
                <div className='flex items-center gap-4 flex-wrap p-3 bg-muted/30 rounded-lg'>
                  <span className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
                    <Users className='h-4 w-4' />
                    Legenda:
                  </span>
                  {visibleProfessionals.map((emp: any) => (
                    <div key={emp.userId} className='flex items-center gap-2'>
                      <div
                        className='w-3 h-3 rounded-full'
                        style={{
                          backgroundColor: professionalColors[emp.userId],
                        }}
                      />
                      <span className='text-sm'>{emp.user?.name || emp.name}</span>
                    </div>
                  ))}
                </div>
              )}
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
            <h3 className='text-lg font-semibold mb-2'>Nenhum profissional encontrado</h3>
            <p className='text-sm text-muted-foreground mb-4'>
              {filterProfessionals.length > 0
                ? 'Nenhum profissional selecionado. Ajuste os filtros para visualizar.'
                : 'Cadastre profissionais para começar a usar a agenda.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Day View - Timeline por profissional */}
          {viewMode === 'day' && (
            <Card>
              <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                  <div className='min-w-[800px]'>
                    {/* Header com nomes dos profissionais */}
                    <div
                      className='grid border-b sticky top-0 bg-background z-10'
                      style={{
                        gridTemplateColumns: `80px repeat(${visibleProfessionals.length}, 1fr)`,
                      }}
                    >
                      <div className='p-4 border-r bg-muted/50'>
                        <Clock className='h-4 w-4 text-muted-foreground' />
                      </div>
                      {visibleProfessionals.map((emp: any) => (
                        <div
                          key={emp.userId}
                          className='p-4 border-r text-center bg-muted/50'
                        >
                          <div className='font-medium'>{emp.user?.name || emp.name}</div>
                          <div
                            className='w-3 h-3 rounded-full mx-auto mt-2'
                            style={{
                              backgroundColor: professionalColors[emp.userId],
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Grade de horários */}
                    <div className='relative'>
                      {TIME_SLOTS.map((slot) => (
                        <div
                          key={`${slot.hour}-${slot.minute}`}
                          className={`grid border-b ${slot.minute === 0 ? 'border-b-2' : ''}`}
                          style={{
                            gridTemplateColumns: `80px repeat(${visibleProfessionals.length}, 1fr)`,
                            height: '60px',
                          }}
                        >
                          {/* Coluna de horários */}
                          <div
                            className={`p-2 border-r text-xs ${
                              slot.minute === 0
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground/60'
                            }`}
                          >
                            {slot.minute === 0
                              ? `${slot.hour.toString().padStart(2, '0')}:00`
                              : ''}
                          </div>

                          {/* Células de agendamento por profissional */}
                          {visibleProfessionals.map((emp: any) => {
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
                                {slotAppointments.map((appt) => {
                                  const colors = getColorClasses(
                                    professionalColors[emp.userId]
                                  );
                                  return (
                                    <div
                                      key={appt.id}
                                      className='absolute inset-x-1 rounded p-1 text-xs cursor-pointer hover:opacity-90 transition-opacity overflow-hidden shadow-sm'
                                      style={{
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                        ...getAppointmentStyle(appt),
                                      }}
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
                                      <div className='text-[10px] opacity-75 mt-0.5'>
                                        {formatTime(appt.startAt)}
                                      </div>
                                    </div>
                                  );
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

          {/* Week View - Timeline com profissionais por dia */}
          {viewMode === 'week' && (
            <Card>
              <CardContent className='p-0'>
                <div className='overflow-x-auto'>
                  <div className='min-w-[1200px]'>
                    {/* Header com dias da semana e profissionais */}
                    <div
                      className='grid border-b sticky top-0 bg-background z-10'
                      style={{
                        gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)`,
                      }}
                    >
                      <div className='p-4 border-r bg-muted/50'>
                        <Clock className='h-4 w-4 text-muted-foreground' />
                      </div>
                      {weekDays.map((day) => (
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
                          {/* Mini indicadores de profissionais */}
                          <div className='flex gap-1 justify-center mt-2'>
                            {visibleProfessionals.slice(0, 5).map((emp: any) => (
                              <div
                                key={emp.userId}
                                className='w-2 h-2 rounded-full'
                                style={{
                                  backgroundColor: professionalColors[emp.userId],
                                }}
                                title={emp.user?.name || emp.name}
                              />
                            ))}
                            {visibleProfessionals.length > 5 && (
                              <span className='text-[10px] text-muted-foreground'>
                                +{visibleProfessionals.length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Grade de horários */}
                    <div className='relative'>
                      {TIME_SLOTS.map((slot) => (
                        <div
                          key={`${slot.hour}-${slot.minute}`}
                          className={`grid border-b ${slot.minute === 0 ? 'border-b-2' : ''}`}
                          style={{
                            gridTemplateColumns: `80px repeat(${weekDays.length}, 1fr)`,
                            height: '60px',
                          }}
                        >
                          {/* Coluna de horários */}
                          <div
                            className={`p-2 border-r text-xs ${
                              slot.minute === 0
                                ? 'font-medium text-foreground'
                                : 'text-muted-foreground/60'
                            }`}
                          >
                            {slot.minute === 0
                              ? `${slot.hour.toString().padStart(2, '0')}:00`
                              : ''}
                          </div>

                          {/* Células de agendamento por dia */}
                          {weekDays.map((day) => {
                            const dateKey = format(day, 'yyyy-MM-dd');
                            const timeKey = `${slot.hour
                              .toString()
                              .padStart(2, '0')}:${slot.minute
                              .toString()
                              .padStart(2, '0')}`;

                            // Coletar todos os agendamentos deste horário de todos os profissionais
                            const allAppointments = visibleProfessionals.flatMap(
                              (emp: any) =>
                                appointmentsByProfessionalAndTime[emp.userId]?.[dateKey]?.[
                                  timeKey
                                ] || []
                            );

                            return (
                              <div
                                key={day.toString()}
                                className={`border-r relative group hover:bg-muted/30 cursor-pointer transition-colors ${
                                  isToday(day) ? 'bg-primary/5' : ''
                                }`}
                                onClick={() => {
                                  if (
                                    allAppointments.length === 0 &&
                                    visibleProfessionals.length > 0 &&
                                    visibleProfessionals[0].userId
                                  ) {
                                    handleSlotClick(day, slot, visibleProfessionals[0].userId);
                                  }
                                }}
                              >
                                {allAppointments.length === 0 && (
                                  <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100'>
                                    <Plus className='h-4 w-4 text-muted-foreground' />
                                  </div>
                                )}
                                {/* Renderizar agendamentos empilhados */}
                                {allAppointments.map((appt, idx) => {
                                  const colors = getColorClasses(
                                    professionalColors[appt.professionalId]
                                  );
                                  // Offset horizontal para múltiplos agendamentos
                                  const offset = idx * 4;
                                  return (
                                    <div
                                      key={appt.id}
                                      className='absolute rounded p-1 text-xs cursor-pointer hover:opacity-90 transition-opacity overflow-hidden shadow-sm'
                                      style={{
                                        backgroundColor: colors.background,
                                        color: colors.text,
                                        left: `${4 + offset}px`,
                                        right: `${4 + (allAppointments.length - 1 - idx) * 4}px`,
                                        ...getAppointmentStyle(appt),
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAppointmentClick(appt);
                                      }}
                                    >
                                      <div className='font-medium truncate'>
                                        {appt.client?.name}
                                      </div>
                                      <div className='text-[10px] opacity-75 truncate'>
                                        {appt.professional?.name}
                                      </div>
                                    </div>
                                  );
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
                            if (visibleProfessionals.length > 0 && visibleProfessionals[0].userId) {
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
                              const colors = getColorClasses(
                                professionalColors[appt.professionalId]
                              );
                              return (
                                <div
                                  key={appt.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAppointmentClick(appt);
                                  }}
                                  className='text-xs p-1 rounded truncate hover:opacity-90 transition-opacity'
                                  style={{
                                    backgroundColor: colors.background,
                                    color: colors.text,
                                  }}
                                  title={`${formatTime(appt.startAt)} - ${appt.client?.name} (${appt.professional?.name})`}
                                >
                                  {formatTime(appt.startAt)} - {appt.client?.name}
                                </div>
                              );
                            })}
                            {dayAppointments.length > 2 && (
                              <div className='text-xs text-muted-foreground px-1'>
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
        onSuccess={() => {
          refetch();
          setSelectedSlot(null);
        }}
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
                  <div className='flex items-center gap-2'>
                    <div
                      className='w-3 h-3 rounded-full'
                      style={{
                        backgroundColor:
                          professionalColors[selectedAppointment.professionalId],
                      }}
                    />
                    <p className='text-sm text-muted-foreground'>
                      {selectedAppointment.professional?.name}
                    </p>
                  </div>
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
