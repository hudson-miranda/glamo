import { useState } from 'react';
import { useQuery, listAppointments } from 'wasp/client/operations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { 
  Video, 
  Calendar, 
  Clock, 
  User,
  Search,
  Filter,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  MessageSquare,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useSalonContext } from '../../contexts/SalonContext';
import { formatDate, formatDateTime } from '../../lib/formatters';

interface ConsultationDetails {
  appointment: any;
  duration: number;
  notes: string;
  chatMessages: number;
  status: string;
}

export default function ConsultationHistoryPage() {
  const { activeSalonId } = useSalonContext();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [page, setPage] = useState(1);
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationDetails | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const pageSize = 10;

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return { startDate: weekAgo.toISOString(), endDate: now.toISOString() };
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { startDate: monthAgo.toISOString(), endDate: now.toISOString() };
      case 'quarter':
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        return { startDate: quarterAgo.toISOString(), endDate: now.toISOString() };
      case 'year':
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return { startDate: yearAgo.toISOString(), endDate: now.toISOString() };
      default:
        return {};
    }
  };

  const { data: appointmentsData, isLoading } = useQuery(
    listAppointments,
    {
      salonId: activeSalonId || '',
      status: statusFilter !== 'all' ? (statusFilter as any) : undefined,
      ...getDateRange(),
      page,
      perPage: pageSize,
    },
    { enabled: !!activeSalonId }
  );

  // Filter video consultations
  const consultations = appointmentsData?.appointments?.filter((apt: any) =>
    apt.notes?.toLowerCase().includes('telemedicina') ||
    apt.notes?.toLowerCase().includes('consulta online') ||
    apt.notes?.toLowerCase().includes('video') ||
    apt.bookingSource === 'CLIENT_ONLINE'
  ) || [];

  // Apply search filter
  const filteredConsultations = consultations.filter((apt: any) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      apt.client?.name?.toLowerCase().includes(searchLower) ||
      apt.professional?.name?.toLowerCase().includes(searchLower) ||
      apt.notes?.toLowerCase().includes(searchLower)
    );
  });

  // Calculate statistics
  const stats = {
    total: filteredConsultations.length,
    completed: filteredConsultations.filter((apt: any) => apt.status === 'DONE').length,
    cancelled: filteredConsultations.filter((apt: any) => apt.status === 'CANCELLED').length,
    avgDuration: filteredConsultations.length > 0
      ? filteredConsultations
          .filter((apt: any) => apt.status === 'DONE')
          .reduce((acc: number, apt: any) => {
            const duration = new Date(apt.endAt).getTime() - new Date(apt.startAt).getTime();
            return acc + duration;
          }, 0) /
        filteredConsultations.filter((apt: any) => apt.status === 'DONE').length /
        60000
      : 0,
    completionRate: filteredConsultations.length > 0
      ? (filteredConsultations.filter((apt: any) => apt.status === 'DONE').length / filteredConsultations.length) * 100
      : 0,
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { variant: any; label: string; icon: any }> = {
      PENDING: { variant: 'secondary', label: 'Pendente', icon: Clock },
      CONFIRMED: { variant: 'default', label: 'Confirmado', icon: CheckCircle2 },
      IN_SERVICE: { variant: 'default', label: 'Em Andamento', icon: Video },
      DONE: { variant: 'default', label: 'Concluído', icon: CheckCircle2 },
      CANCELLED: { variant: 'destructive', label: 'Cancelado', icon: XCircle },
    };
    const config = configs[status] || configs.PENDING;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const viewDetails = (apt: any) => {
    const duration = (new Date(apt.endAt).getTime() - new Date(apt.startAt).getTime()) / 60000;
    setSelectedConsultation({
      appointment: apt,
      duration: Math.round(duration),
      notes: apt.notes || '',
      chatMessages: 0, // Would come from chat history
      status: apt.status,
    });
    setShowDetailsDialog(true);
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Horário', 'Cliente', 'Profissional', 'Duração (min)', 'Status', 'Observações'];
    const rows = filteredConsultations.map((apt: any) => [
      formatDate(apt.startAt),
      formatDateTime(apt.startAt).split(' ')[1],
      apt.client?.name || '',
      apt.professional?.name || '',
      Math.round((new Date(apt.endAt).getTime() - new Date(apt.startAt).getTime()) / 60000),
      apt.status,
      apt.notes || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell: any) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `historico-telemedicina-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Consultas</h1>
          <p className="text-muted-foreground">
            Registro completo de todas as consultas virtuais realizadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={() => (window.location.href = '/telemedicine')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Consultas</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {dateRange === 'week'
                ? 'Última semana'
                : dateRange === 'month'
                ? 'Último mês'
                : dateRange === 'quarter'
                ? 'Último trimestre'
                : dateRange === 'year'
                ? 'Último ano'
                : 'Histórico completo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate.toFixed(1)}% de conclusão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.avgDuration)} min</div>
            <p className="text-xs text-muted-foreground">Por consulta concluída</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.cancelled / stats.total) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cliente ou profissional..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="DONE">Concluído</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={dateRange} onValueChange={(v) => setDateRange(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Última Semana</SelectItem>
                  <SelectItem value="month">Último Mês</SelectItem>
                  <SelectItem value="quarter">Último Trimestre</SelectItem>
                  <SelectItem value="year">Último Ano</SelectItem>
                  <SelectItem value="all">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ações</label>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                  setDateRange('month');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Consultations List */}
      <Card>
        <CardHeader>
          <CardTitle>Consultas Registradas</CardTitle>
          <CardDescription>
            {filteredConsultations.length} consulta{filteredConsultations.length !== 1 ? 's' : ''} encontrada
            {filteredConsultations.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredConsultations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Nenhuma consulta encontrada</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou período</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredConsultations.map((apt: any) => {
                const duration = Math.round(
                  (new Date(apt.endAt).getTime() - new Date(apt.startAt).getTime()) / 60000
                );

                return (
                  <div
                    key={apt.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1 grid gap-4 md:grid-cols-5">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{formatDate(apt.startAt)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(apt.startAt).split(' ')[1]}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Cliente</p>
                        <p className="font-medium">{apt.client?.name || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Profissional</p>
                        <p className="font-medium">Dr. {apt.professional?.name || 'N/A'}</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">Duração</p>
                        <p className="font-medium">{duration} min</p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Status</p>
                        {getStatusBadge(apt.status)}
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => viewDetails(apt)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Detalhes
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {filteredConsultations.length > 0 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {(page - 1) * pageSize + 1} -{' '}
                {Math.min(page * pageSize, filteredConsultations.length)} de {filteredConsultations.length}{' '}
                consultas
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page * pageSize >= filteredConsultations.length}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Consulta</DialogTitle>
            <DialogDescription>
              Informações completas sobre a consulta realizada
            </DialogDescription>
          </DialogHeader>

          {selectedConsultation && (
            <div className="space-y-6">
              {/* Status and Duration */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedConsultation.status)}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duração: {selectedConsultation.duration} min
                  </span>
                  {selectedConsultation.chatMessages > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {selectedConsultation.chatMessages} mensagens
                    </span>
                  )}
                </div>
              </div>

              {/* Appointment Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedConsultation.appointment.client?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedConsultation.appointment.client?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Profissional</label>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        Dr. {selectedConsultation.appointment.professional?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">Profissional</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data e Horário</label>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {formatDate(selectedConsultation.appointment.startAt)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(selectedConsultation.appointment.startAt).split(' ')[1]} -{' '}
                        {formatDateTime(selectedConsultation.appointment.endAt).split(' ')[1]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmação</label>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">
                        {selectedConsultation.appointment.confirmationCode || 'N/A'}
                      </p>
                      <p className="text-sm text-muted-foreground">Código de confirmação</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedConsultation.notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações da Consulta
                  </label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedConsultation.notes}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    (window.location.href = `/appointments?clientId=${selectedConsultation.appointment.clientId}`)
                  }
                >
                  Ver Histórico do Cliente
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.print()}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Imprimir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
