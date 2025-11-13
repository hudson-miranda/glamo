import { useState } from 'react';
import { Link } from 'wasp/client/router';
import { useQuery, listCommunicationLogs } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { formatDate, formatDateTime } from '../../lib/formatters';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
  Search,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  Bell,
  Calendar,
  Send,
  CheckCircle2,
  Eye,
  MousePointerClick,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
} from 'lucide-react';

// Type definitions
const COMMUNICATION_TYPES = {
  APPOINTMENT_REMINDER: { label: 'Lembrete de Agendamento', icon: Calendar, color: 'bg-blue-500' },
  APPOINTMENT_CONFIRMATION: { label: 'Confirmação', icon: CheckCircle2, color: 'bg-green-500' },
  APPOINTMENT_CANCELLED: { label: 'Cancelamento', icon: XCircle, color: 'bg-red-500' },
  BIRTHDAY_GREETING: { label: 'Aniversário', icon: Calendar, color: 'bg-pink-500' },
  PROMOTIONAL_CAMPAIGN: { label: 'Promocional', icon: BarChart3, color: 'bg-purple-500' },
  REACTIVATION_CAMPAIGN: { label: 'Reativação', icon: TrendingUp, color: 'bg-orange-500' },
  FEEDBACK_REQUEST: { label: 'Pesquisa', icon: MessageSquare, color: 'bg-indigo-500' },
  LOYALTY_REWARD_NOTIFICATION: { label: 'Recompensa', icon: BarChart3, color: 'bg-yellow-500' },
  CUSTOM_MESSAGE: { label: 'Mensagem Manual', icon: Send, color: 'bg-gray-500' },
  FOLLOW_UP: { label: 'Follow-up', icon: Users, color: 'bg-teal-500' },
  THANK_YOU: { label: 'Agradecimento', icon: CheckCircle2, color: 'bg-green-600' },
};

const CHANNEL_ICONS = {
  EMAIL: { icon: Mail, label: 'E-mail', color: 'text-blue-600' },
  SMS: { icon: MessageSquare, label: 'SMS', color: 'text-green-600' },
  WHATSAPP: { icon: Phone, label: 'WhatsApp', color: 'text-green-500' },
  PUSH_NOTIFICATION: { icon: Bell, label: 'Push', color: 'text-purple-600' },
  IN_APP: { icon: Bell, label: 'In-App', color: 'text-gray-600' },
};

const STATUS_CONFIG = {
  PENDING: { label: 'Pendente', icon: Clock, color: 'bg-gray-500' },
  QUEUED: { label: 'Na Fila', icon: Clock, color: 'bg-blue-500' },
  SENT: { label: 'Enviado', icon: Send, color: 'bg-indigo-500' },
  DELIVERED: { label: 'Entregue', icon: CheckCircle2, color: 'bg-green-500' },
  READ: { label: 'Lido', icon: Eye, color: 'bg-teal-500' },
  CLICKED: { label: 'Clicado', icon: MousePointerClick, color: 'bg-purple-500' },
  FAILED: { label: 'Falhou', icon: XCircle, color: 'bg-red-500' },
  BOUNCED: { label: 'Rejeitado', icon: AlertCircle, color: 'bg-orange-500' },
  UNSUBSCRIBED: { label: 'Descadastrado', icon: XCircle, color: 'bg-gray-600' },
};

export default function CommunicationLogPage() {
  const { activeSalonId } = useSalonContext();

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Fetch communications
  const { data, isLoading, error } = useQuery(listCommunicationLogs, {
    salonId: activeSalonId,
    type: typeFilter || undefined,
    channel: channelFilter || undefined,
    status: statusFilter || undefined,
    page,
    pageSize,
  });

  // Calculate metrics
  const totalCommunications = data?.total || 0;
  const totalSent = data?.communications?.filter((c: any) => 
    ['SENT', 'DELIVERED', 'READ', 'CLICKED'].includes(c.status)
  ).length || 0;
  const totalDelivered = data?.communications?.filter((c: any) => 
    ['DELIVERED', 'READ', 'CLICKED'].includes(c.status)
  ).length || 0;
  const totalRead = data?.communications?.filter((c: any) => 
    ['READ', 'CLICKED'].includes(c.status)
  ).length || 0;
  const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
  const openRate = totalDelivered > 0 ? Math.round((totalRead / totalDelivered) * 100) : 0;

  // Filter communications by search term (client side)
  const filteredCommunications = data?.communications?.filter((comm: any) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      comm.client?.name?.toLowerCase().includes(search) ||
      comm.message?.toLowerCase().includes(search) ||
      comm.subject?.toLowerCase().includes(search)
    );
  }) || [];

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  if (error) {
    return (
      <div className='container mx-auto py-6 px-4'>
        <Card className='border-red-200 bg-red-50'>
          <CardContent className='pt-6'>
            <div className='flex items-center gap-2 text-red-600'>
              <XCircle className='h-5 w-5' />
              <p>Erro ao carregar comunicações: {error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 px-4 max-w-7xl'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-3xl font-bold tracking-tight'>Histórico de Comunicações</h1>
        <p className='text-muted-foreground'>
          Visualize todas as comunicações enviadas aos clientes
        </p>
      </div>

      {/* Metrics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total de Comunicações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{totalCommunications}</p>
              <Send className='h-5 w-5 text-muted-foreground' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Enviadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{totalSent}</p>
              <CheckCircle2 className='h-5 w-5 text-blue-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Taxa de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{deliveryRate}%</p>
              <TrendingUp className='h-5 w-5 text-green-500' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Taxa de Abertura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center justify-between'>
              <p className='text-2xl font-bold'>{openRate}%</p>
              <Eye className='h-5 w-5 text-purple-500' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className='mb-6'>
        <CardContent className='pt-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'>
            {/* Search */}
            <div className='lg:col-span-2'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='text'
                  placeholder='Buscar por cliente, mensagem...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='pl-10'
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className='w-full border rounded-md px-3 py-2 text-sm'
              >
                <option value=''>Todos os Tipos</option>
                {Object.entries(COMMUNICATION_TYPES).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Channel Filter */}
            <div>
              <select
                value={channelFilter}
                onChange={(e) => {
                  setChannelFilter(e.target.value);
                  setPage(1);
                }}
                className='w-full border rounded-md px-3 py-2 text-sm'
              >
                <option value=''>Todos os Canais</option>
                {Object.entries(CHANNEL_ICONS).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className='w-full border rounded-md px-3 py-2 text-sm'
              >
                <option value=''>Todos os Status</option>
                {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                  <option key={value} value={value}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>
              {filteredCommunications.length} Comunicaç{filteredCommunications.length === 1 ? 'ão' : 'ões'}
            </CardTitle>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <span>Exibir:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className='border rounded px-2 py-1'
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='text-center py-12'>
              <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
              <p className='mt-2 text-muted-foreground'>Carregando comunicações...</p>
            </div>
          ) : filteredCommunications.length === 0 ? (
            <div className='text-center py-12'>
              <Send className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold mb-2'>Nenhuma comunicação encontrada</h3>
              <p className='text-muted-foreground mb-4'>
                {searchTerm || typeFilter || channelFilter || statusFilter
                  ? 'Tente ajustar os filtros de busca'
                  : 'Suas comunicações aparecerão aqui'}
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredCommunications.map((comm: any) => {
                const typeConfig = COMMUNICATION_TYPES[comm.type as keyof typeof COMMUNICATION_TYPES] || {
                  label: comm.type,
                  icon: Send,
                  color: 'bg-gray-500',
                };
                const TypeIcon = typeConfig.icon;
                const channelConfig = CHANNEL_ICONS[comm.channel as keyof typeof CHANNEL_ICONS] || {
                  icon: Send,
                  label: comm.channel,
                  color: 'text-gray-500',
                };
                const ChannelIcon = channelConfig.icon;
                const statusConfig = STATUS_CONFIG[comm.status as keyof typeof STATUS_CONFIG] || {
                  label: comm.status,
                  icon: Clock,
                  color: 'bg-gray-500',
                };

                return (
                  <div
                    key={comm.id}
                    className='flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors'
                  >
                    {/* Icon */}
                    <div className={`p-2 rounded-full ${typeConfig.color} bg-opacity-10 shrink-0`}>
                      <TypeIcon className={`h-5 w-5 ${typeConfig.color.replace('bg-', 'text-')}`} />
                    </div>

                    {/* Content */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-2 mb-1'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <h4 className='font-semibold'>{comm.client?.name || 'Cliente Desconhecido'}</h4>
                          <Badge variant='outline' className='text-xs'>
                            {typeConfig.label}
                          </Badge>
                          <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                            <ChannelIcon className={`h-3 w-3 ${channelConfig.color}`} />
                            <span>{channelConfig.label}</span>
                          </div>
                        </div>
                        <Badge className={`${statusConfig.color} text-white shrink-0`}>
                          {statusConfig.label}
                        </Badge>
                      </div>

                      {comm.subject && (
                        <p className='font-medium text-sm mb-1'>{comm.subject}</p>
                      )}

                      <p className='text-sm text-muted-foreground line-clamp-2 mb-2'>
                        {comm.message}
                      </p>

                      <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                        <div className='flex items-center gap-1'>
                          <Calendar className='h-3 w-3' />
                          <span>{formatDateTime(comm.createdAt)}</span>
                        </div>

                        {comm.sentAt && (
                          <div className='flex items-center gap-1'>
                            <Send className='h-3 w-3' />
                            <span>Enviado: {formatDateTime(comm.sentAt)}</span>
                          </div>
                        )}

                        {comm.deliveredAt && (
                          <div className='flex items-center gap-1'>
                            <CheckCircle2 className='h-3 w-3 text-green-600' />
                            <span>Entregue: {formatDateTime(comm.deliveredAt)}</span>
                          </div>
                        )}

                        {comm.readAt && (
                          <div className='flex items-center gap-1'>
                            <Eye className='h-3 w-3 text-purple-600' />
                            <span>Lido: {formatDateTime(comm.readAt)}</span>
                          </div>
                        )}

                        {comm.campaign && (
                          <div className='flex items-center gap-1'>
                            <BarChart3 className='h-3 w-3' />
                            <span>Campanha: {comm.campaign.name}</span>
                          </div>
                        )}

                        {comm.user && (
                          <div className='flex items-center gap-1'>
                            <Users className='h-3 w-3' />
                            <span>Por: {comm.user.name}</span>
                          </div>
                        )}
                      </div>

                      {comm.failureReason && (
                        <div className='mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700'>
                          <span className='font-semibold'>Erro:</span> {comm.failureReason}
                        </div>
                      )}

                      {comm.cost && (
                        <div className='mt-1 text-xs text-muted-foreground'>
                          Custo: R$ {comm.cost.toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='mt-6 flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Página {page} de {totalPages} ({totalCommunications} comunicações no total)
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className='h-4 w-4 mr-1' />
              Anterior
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
              <ChevronRight className='h-4 w-4 ml-1' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
