import { useState } from 'react';
import { useQuery, listAppointments } from 'wasp/client/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Video, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Users, 
  CheckCircle2,
  AlertCircle,
  Play,
  History,
  Plus,
  Filter,
  ChevronRight
} from 'lucide-react';
import { useSalonContext } from '../../contexts/SalonContext';
import { formatDate, formatDateTime } from '../../lib/formatters';

interface ConsultationMetrics {
  total: number;
  completed: number;
  upcoming: number;
  cancelled: number;
  avgDuration: number;
  completionRate: number;
}

export default function TelemedicineDashboard() {
  const { activeSalonId } = useSalonContext();
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  // Get all video consultation appointments
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case 'today':
        return {
          startDate: new Date(now.setHours(0, 0, 0, 0)).toISOString(),
          endDate: new Date(now.setHours(23, 59, 59, 999)).toISOString(),
        };
      case 'week':
        return {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString(),
        };
      case 'month':
        return {
          startDate: startOfMonth.toISOString(),
          endDate: endOfMonth.toISOString(),
        };
      default:
        return {};
    }
  };

  const { data: appointmentsData, isLoading } = useQuery(
    listAppointments,
    {
      salonId: activeSalonId || '',
      ...getDateRange(),
    },
    { enabled: !!activeSalonId }
  );

  // Filter video consultation appointments (notes contain "telemedicina" or "consulta online")
  const videoConsultations = appointmentsData?.appointments?.filter((apt: any) =>
    apt.notes?.toLowerCase().includes('telemedicina') ||
    apt.notes?.toLowerCase().includes('consulta online') ||
    apt.notes?.toLowerCase().includes('video') ||
    apt.bookingSource === 'CLIENT_ONLINE'
  ) || [];

  // Calculate metrics
  const metrics: ConsultationMetrics = {
    total: videoConsultations.length,
    completed: videoConsultations.filter((apt: any) => apt.status === 'DONE').length,
    upcoming: videoConsultations.filter((apt: any) => 
      apt.status === 'CONFIRMED' && new Date(apt.startAt) > new Date()
    ).length,
    cancelled: videoConsultations.filter((apt: any) => apt.status === 'CANCELLED').length,
    avgDuration: videoConsultations.length > 0 
      ? videoConsultations.reduce((acc: number, apt: any) => {
          const duration = new Date(apt.endAt).getTime() - new Date(apt.startAt).getTime();
          return acc + duration;
        }, 0) / videoConsultations.length / 60000 // Convert to minutes
      : 0,
    completionRate: videoConsultations.length > 0
      ? (videoConsultations.filter((apt: any) => apt.status === 'DONE').length / videoConsultations.length) * 100
      : 0,
  };

  // Get today's consultations
  const todayConsultations = videoConsultations.filter((apt: any) => {
    const aptDate = new Date(apt.startAt);
    const today = new Date();
    return aptDate.toDateString() === today.toDateString();
  }).sort((a: any, b: any) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  // Get upcoming consultations (next 7 days)
  const upcomingConsultations = videoConsultations.filter((apt: any) => {
    const aptDate = new Date(apt.startAt);
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return aptDate > now && aptDate <= next7Days && apt.status !== 'CANCELLED';
  }).sort((a: any, b: any) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  // Get recent completed consultations
  const recentCompleted = videoConsultations.filter((apt: any) => 
    apt.status === 'DONE'
  ).sort((a: any, b: any) => 
    new Date(b.endAt).getTime() - new Date(a.endAt).getTime()
  ).slice(0, 5);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; label: string }> = {
      PENDING: { variant: 'secondary', label: 'Pendente' },
      CONFIRMED: { variant: 'default', label: 'Confirmado' },
      IN_SERVICE: { variant: 'default', label: 'Em Andamento' },
      DONE: { variant: 'default', label: 'Concluído' },
      CANCELLED: { variant: 'destructive', label: 'Cancelado' },
    };
    const config = configs[status] || configs.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const canStartConsultation = (apt: any) => {
    const now = new Date();
    const startAt = new Date(apt.startAt);
    const timeDiff = startAt.getTime() - now.getTime();
    const minutesDiff = timeDiff / 60000;
    // Can start 10 minutes before scheduled time
    return minutesDiff <= 10 && minutesDiff >= -60 && apt.status === 'CONFIRMED';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Telemedicina</h1>
          <p className="text-muted-foreground">
            Consultas virtuais e atendimento online
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.href = '/telemedicine/history'}>
            <History className="mr-2 h-4 w-4" />
            Histórico
          </Button>
          <Button onClick={() => window.location.href = '/telemedicine/schedule'}>
            <Plus className="mr-2 h-4 w-4" />
            Agendar Consulta
          </Button>
        </div>
      </div>

      {/* Time Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium mr-4">Período:</span>
            <div className="flex gap-2">
              {['today', 'week', 'month', 'all'].map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range as any)}
                >
                  {range === 'today' ? 'Hoje' : range === 'week' ? 'Semana' : range === 'month' ? 'Mês' : 'Todos'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.total}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === 'today' ? 'Hoje' : timeRange === 'week' ? 'Esta semana' : timeRange === 'month' ? 'Este mês' : 'Total'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Confirmadas e agendadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.completed} de {metrics.total} concluídas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.avgDuration)} min</div>
            <p className="text-xs text-muted-foreground">
              Por consulta
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Consultations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Consultas de Hoje
            </CardTitle>
            <CardDescription>
              {todayConsultations.length} consulta{todayConsultations.length !== 1 ? 's' : ''} agendada{todayConsultations.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todayConsultations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma consulta agendada para hoje</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayConsultations.map((apt: any) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{apt.client?.name || 'Cliente'}</p>
                        {getStatusBadge(apt.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(apt.startAt).split(' ')[1]}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Dr. {apt.professional?.name || 'Profissional'}
                        </span>
                      </div>
                    </div>
                    {canStartConsultation(apt) ? (
                      <Button
                        size="sm"
                        onClick={() => window.location.href = `/telemedicine/consultation/${apt.id}`}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Iniciar
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.location.href = `/telemedicine/consultation/${apt.id}`}
                      >
                        Ver Detalhes
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Consultations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Próximas Consultas
            </CardTitle>
            <CardDescription>
              Próximos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingConsultations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma consulta agendada nos próximos 7 dias</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingConsultations.slice(0, 5).map((apt: any) => (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{apt.client?.name || 'Cliente'}</p>
                        {getStatusBadge(apt.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(apt.startAt)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(apt.startAt).split(' ')[1]}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.href = `/telemedicine/consultation/${apt.id}`}
                    >
                      Ver
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Completed Consultations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Consultas Concluídas Recentes
          </CardTitle>
          <CardDescription>
            Últimas 5 consultas finalizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentCompleted.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma consulta concluída ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentCompleted.map((apt: any) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{apt.client?.name || 'Cliente'}</p>
                      <Badge variant="default" className="bg-green-500">Concluída</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(apt.startAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {Math.round((new Date(apt.endAt).getTime() - new Date(apt.startAt).getTime()) / 60000)} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Dr. {apt.professional?.name || 'Profissional'}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `/telemedicine/history?id=${apt.id}`}
                  >
                    Ver Registro
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => window.location.href = '/telemedicine/schedule'}
            >
              <Plus className="h-6 w-6" />
              <span>Agendar Nova Consulta</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => window.location.href = '/telemedicine/history'}
            >
              <History className="h-6 w-6" />
              <span>Ver Histórico Completo</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => window.location.href = '/appointments'}
            >
              <Calendar className="h-6 w-6" />
              <span>Gerenciar Agendamentos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
