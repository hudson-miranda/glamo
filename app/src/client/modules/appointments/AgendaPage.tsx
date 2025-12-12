import { useState, useMemo, useEffect } from 'react';
import { useQuery, listAppointments, listEmployees, listClients, createAppointment, updateAppointmentStatus } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import {
  Plus,
  Search,
  Calendar as CalendarIcon,
  Filter,
  X,
  ArrowUpDown,
  Settings2,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  PlayCircle,
  MoreVertical,
  Edit,
  Trash2,
} from 'lucide-react';
import { useToast } from '../../../components/ui/use-toast';
import AppointmentModal from './components/AppointmentModal';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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

export default function AgendaPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();

  // Estados de visualização
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Estados de filtros
  const [search, setSearch] = useState('');
  const [filterProfessional, setFilterProfessional] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  // Estados de modais
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Reset página quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [search, filterProfessional, filterClient, filterStatus, selectedDate]);

  // Queries
  const startDate = selectedDate
    ? format(selectedDate, 'yyyy-MM-dd')
    : format(startOfMonth(currentDate), 'yyyy-MM-dd');
  const endDate = selectedDate
    ? format(selectedDate, 'yyyy-MM-dd')
    : format(endOfMonth(currentDate), 'yyyy-MM-dd');

  const { data: appointmentsData, isLoading, error, refetch } = useQuery(
    listAppointments,
    {
      salonId: activeSalonId || '',
      status: filterStatus !== 'all' ? filterStatus as any : undefined,
      professionalId: filterProfessional !== 'all' ? filterProfessional : undefined,
      clientId: filterClient !== 'all' ? filterClient : undefined,
      startDate: startDate,
      endDate: endDate,
      page,
      perPage: viewMode === 'calendar' ? 1000 : perPage,
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

  // Filtros aplicados
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

    return filtered;
  }, [appointments, search]);

  const hasActiveFilters =
    search !== '' || filterProfessional !== 'all' || filterClient !== 'all' || filterStatus !== 'all' || selectedDate !== null;

  const handleClearFilters = () => {
    setSearch('');
    setFilterProfessional('all');
    setFilterClient('all');
    setFilterStatus('all');
    setSelectedDate(null);
  };

  // Navegação do calendário
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Calendário - gerar dias
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { locale: ptBR });
  const calendarEnd = endOfWeek(monthEnd, { locale: ptBR });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Agrupar agendamentos por dia
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
    return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const handleViewDetails = (appointment: any) => {
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
          <p className='text-muted-foreground'>
            Gerencie os agendamentos do seu salão
          </p>
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

      {/* Tabs for View Mode */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className='w-full'>
        <TabsList className='grid w-full max-w-md grid-cols-2'>
          <TabsTrigger value='calendar'>
            <CalendarIcon className='mr-2 h-4 w-4' />
            Calendário
          </TabsTrigger>
          <TabsTrigger value='list'>
            <Clock className='mr-2 h-4 w-4' />
            Lista
          </TabsTrigger>
        </TabsList>

        {/* Search, Filters and Actions */}
        <Card className='mt-4'>
          <CardContent className='pt-6'>
            <div className='flex flex-col gap-4'>
              {/* Busca */}
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar por cliente, profissional ou serviço...'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className='pl-10'
                />
              </div>

              {/* Barra de Ações */}
              <div className='flex items-center gap-2 flex-wrap'>
                {/* Filtros */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant='outline' size='sm' className='gap-2'>
                      <Filter className='h-4 w-4' />
                      Filtros
                      {hasActiveFilters && (
                        <Badge variant='secondary' className='ml-1 px-1.5 py-0.5 text-xs'>
                          {[
                            filterProfessional !== 'all',
                            filterClient !== 'all',
                            filterStatus !== 'all',
                            selectedDate !== null,
                          ].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-56'>
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <div className='p-2 space-y-2'>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>
                          Profissional
                        </Label>
                        <select
                          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                          value={filterProfessional}
                          onChange={(e) => setFilterProfessional(e.target.value)}
                        >
                          <option value='all'>Todos</option>
                          {employees.map((emp: any) => (
                            <option key={emp.id} value={emp.userId}>
                              {emp.user?.name || emp.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>
                          Status
                        </Label>
                        <select
                          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value='all'>Todos</option>
                          <option value='PENDING'>Pendente</option>
                          <option value='CONFIRMED'>Confirmado</option>
                          <option value='IN_SERVICE'>Em Atendimento</option>
                          <option value='DONE'>Concluído</option>
                          <option value='CANCELLED'>Cancelado</option>
                        </select>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Limpar Filtros */}
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

                {/* Botão Hoje (apenas no modo calendário) */}
                {viewMode === 'calendar' && (
                  <Button variant='outline' size='sm' onClick={handleToday}>
                    Hoje
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        <TabsContent value='calendar' className='mt-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
              <CardTitle className='text-xl font-bold'>
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Button variant='outline' size='icon' onClick={handlePrevMonth}>
                  <ChevronLeft className='h-4 w-4' />
                </Button>
                <Button variant='outline' size='icon' onClick={handleNextMonth}>
                  <ChevronRight className='h-4 w-4' />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='flex items-center justify-center p-12'>
                  <p className='text-sm text-muted-foreground'>Carregando agenda...</p>
                </div>
              ) : error ? (
                <div className='flex items-center justify-center p-12'>
                  <p className='text-sm text-destructive'>
                    Erro ao carregar agenda: {error.message}
                  </p>
                </div>
              ) : (
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
                    {calendarDays.map((day, idx) => {
                      const dateKey = format(day, 'yyyy-MM-dd');
                      const dayAppointments = appointmentsByDay[dateKey] || [];
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      const isTodayDate = isToday(day);

                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedDate(day)}
                          className={`min-h-[100px] p-2 rounded-lg border cursor-pointer transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : isTodayDate
                              ? 'border-primary/50 bg-primary/5'
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
                            {dayAppointments.slice(0, 2).map((appt: any) => (
                              <div
                                key={appt.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(appt);
                                }}
                                className='text-xs p-1 rounded bg-primary/10 text-primary truncate hover:bg-primary/20'
                              >
                                {formatTime(appt.startAt)} - {appt.client?.name}
                              </div>
                            ))}
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
              )}
            </CardContent>
          </Card>

          {/* Lista de agendamentos do dia selecionado */}
          {selectedDate && (
            <Card className='mt-4'>
              <CardHeader>
                <CardTitle className='text-lg'>
                  Agendamentos de {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsByDay[format(selectedDate, 'yyyy-MM-dd')]?.length > 0 ? (
                  <div className='space-y-2'>
                    {appointmentsByDay[format(selectedDate, 'yyyy-MM-dd')].map((appt: any) => {
                      const StatusIcon = statusIcons[appt.status];
                      return (
                        <div
                          key={appt.id}
                          className='flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer'
                          onClick={() => handleViewDetails(appt)}
                        >
                          <div className='flex items-center gap-4'>
                            <div className='flex items-center gap-2'>
                              <Clock className='h-4 w-4 text-muted-foreground' />
                              <span className='font-medium'>{formatTime(appt.startAt)}</span>
                            </div>
                            <div className='flex items-center gap-2'>
                              <User className='h-4 w-4 text-muted-foreground' />
                              <span>{appt.client?.name}</span>
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {appt.professional?.name}
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Badge variant={statusColors[appt.status]}>
                              <StatusIcon className='h-3 w-3 mr-1' />
                              {statusLabels[appt.status]}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className='text-center text-muted-foreground py-8'>
                    Nenhum agendamento para este dia
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value='list' className='mt-4'>
          <Card>
            <CardContent className='p-0'>
              {isLoading ? (
                <div className='flex items-center justify-center p-8'>
                  <p className='text-sm text-muted-foreground'>Carregando agendamentos...</p>
                </div>
              ) : error ? (
                <div className='flex items-center justify-center p-8'>
                  <p className='text-sm text-destructive'>
                    Erro ao carregar agendamentos: {error.message}
                  </p>
                </div>
              ) : filteredAppointments.length === 0 ? (
                <div className='flex flex-col items-center justify-center p-12 text-center'>
                  <CalendarIcon className='h-12 w-12 text-muted-foreground mb-4' />
                  <h3 className='text-lg font-semibold mb-2'>
                    {hasActiveFilters
                      ? 'Nenhum agendamento encontrado'
                      : 'Nenhum agendamento cadastrado'}
                  </h3>
                  <p className='text-sm text-muted-foreground mb-4'>
                    {hasActiveFilters
                      ? 'Tente ajustar os filtros de busca'
                      : 'Comece criando o primeiro agendamento'}
                  </p>
                  {!hasActiveFilters && (
                    <Button onClick={() => setIsAppointmentModalOpen(true)}>
                      <Plus className='mr-2 h-4 w-4' />
                      Novo Agendamento
                    </Button>
                  )}
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Horário</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Serviços</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className='text-right'>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAppointments.map((appointment: any) => {
                        const StatusIcon = statusIcons[appointment.status];
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>{formatDate(appointment.startAt)}</TableCell>
                            <TableCell className='font-medium'>
                              {formatTime(appointment.startAt)}
                            </TableCell>
                            <TableCell>
                              <div className='flex items-center gap-2'>
                                <User className='h-4 w-4 text-muted-foreground' />
                                {appointment.client?.name || '-'}
                              </div>
                            </TableCell>
                            <TableCell>{appointment.professional?.name || '-'}</TableCell>
                            <TableCell>
                              <div className='max-w-[200px] truncate'>
                                {appointment.services
                                  ?.map((s: any) => s.service?.name)
                                  .join(', ') || '-'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={statusColors[appointment.status]}>
                                <StatusIcon className='h-3 w-3 mr-1' />
                                {statusLabels[appointment.status]}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-right'>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant='ghost' size='icon'>
                                    <MoreVertical className='h-4 w-4' />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align='end'>
                                  <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleViewDetails(appointment)}
                                  >
                                    Ver Detalhes
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuLabel>Alterar Status</DropdownMenuLabel>
                                  {appointment.status !== 'CONFIRMED' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(appointment.id, 'CONFIRMED')
                                      }
                                    >
                                      <CheckCircle className='mr-2 h-4 w-4 text-blue-500' />
                                      Confirmar
                                    </DropdownMenuItem>
                                  )}
                                  {appointment.status !== 'IN_SERVICE' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(appointment.id, 'IN_SERVICE')
                                      }
                                    >
                                      <PlayCircle className='mr-2 h-4 w-4' />
                                      Iniciar Atendimento
                                    </DropdownMenuItem>
                                  )}
                                  {appointment.status !== 'DONE' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(appointment.id, 'DONE')
                                      }
                                    >
                                      <CheckCircle className='mr-2 h-4 w-4 text-green-500' />
                                      Concluir
                                    </DropdownMenuItem>
                                  )}
                                  {appointment.status !== 'CANCELLED' && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(appointment.id, 'CANCELLED')
                                      }
                                      className='text-destructive'
                                    >
                                      <XCircle className='mr-2 h-4 w-4' />
                                      Cancelar
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Pagination */}
              {!isLoading && !error && filteredAppointments.length > 0 && viewMode === 'list' && (
                <div className='flex items-center justify-between border-t px-6 py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Mostrando {filteredAppointments.length} de {appointmentsData?.total || 0}{' '}
                    agendamentos
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <div className='flex items-center gap-1 px-2'>
                      <span className='text-sm'>
                        Página {page} de{' '}
                        {Math.ceil((appointmentsData?.total || 0) / perPage) || 1}
                      </span>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage(page + 1)}
                      disabled={
                        !appointmentsData?.total ||
                        page >= Math.ceil(appointmentsData.total / perPage)
                      }
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AppointmentModal
        open={isAppointmentModalOpen}
        onOpenChange={setIsAppointmentModalOpen}
        onSuccess={() => refetch()}
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
                  <Label className='text-sm font-medium'>Cliente</Label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedAppointment.client?.name}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Profissional</Label>
                  <p className='text-sm text-muted-foreground'>
                    {selectedAppointment.professional?.name}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Data</Label>
                  <p className='text-sm text-muted-foreground'>
                    {formatDate(selectedAppointment.startAt)}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Horário</Label>
                  <p className='text-sm text-muted-foreground'>
                    {formatTime(selectedAppointment.startAt)} -{' '}
                    {formatTime(selectedAppointment.endAt)}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Status</Label>
                  <div className='mt-1'>
                    <Badge variant={statusColors[selectedAppointment.status]}>
                      {statusLabels[selectedAppointment.status]}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <Label className='text-sm font-medium'>Serviços</Label>
                <div className='mt-2 space-y-2'>
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
                  <Label className='text-sm font-medium'>Observações</Label>
                  <p className='text-sm text-muted-foreground mt-1'>
                    {selectedAppointment.notes}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
