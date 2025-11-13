import { useState } from 'react';
import { useQuery, listCampaigns, deleteCampaign } from 'wasp/client/operations';
import { Link } from 'wasp/client/router';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Plus,
  Search,
  Calendar,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Pause,
  Eye,
  Edit,
  Trash2,
  Target,
  TrendingUp,
  Mail,
  MessageSquare,
  Phone,
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { formatDate } from '../../lib/formatters';

const CAMPAIGN_TYPES = [
  { value: 'BIRTHDAY', label: 'Aniversário', icon: '🎂' },
  { value: 'REACTIVATION', label: 'Reativação', icon: '🔄' },
  { value: 'PROMOTIONAL', label: 'Promocional', icon: '🎁' },
  { value: 'ANNOUNCEMENT', label: 'Anúncio', icon: '📢' },
  { value: 'FEEDBACK_REQUEST', label: 'Feedback', icon: '⭐' },
  { value: 'APPOINTMENT_REMINDER', label: 'Lembrete', icon: '⏰' },
  { value: 'FOLLOW_UP', label: 'Follow-up', icon: '📞' },
  { value: 'CUSTOM', label: 'Personalizada', icon: '✨' },
];

const CAMPAIGN_STATUS = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500', icon: Edit },
  SCHEDULED: { label: 'Agendada', color: 'bg-blue-500', icon: Clock },
  SENDING: { label: 'Enviando', color: 'bg-yellow-500', icon: Send },
  COMPLETED: { label: 'Concluída', color: 'bg-green-500', icon: CheckCircle },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-500', icon: XCircle },
  FAILED: { label: 'Falhou', color: 'bg-red-700', icon: XCircle },
  PAUSED: { label: 'Pausada', color: 'bg-orange-500', icon: Pause },
};

const CHANNEL_ICONS = {
  EMAIL: Mail,
  SMS: MessageSquare,
  WHATSAPP: Phone,
  PUSH: Send,
};

export default function CampaignsListPage() {
  const { activeSalonId } = useSalonContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const { data, isLoading, refetch } = useQuery(
    listCampaigns,
    {
      salonId: activeSalonId || '',
      type: filterType !== 'all' ? filterType : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      page: currentPage,
      pageSize,
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const handleDelete = async (campaignId: string) => {
    if (!confirm('Deseja realmente excluir esta campanha? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await deleteCampaign({ id: campaignId });
      refetch();
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir campanha. Verifique o status.');
    }
  };

  const filteredCampaigns = data?.campaigns?.filter((campaign: any) =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil((data?.total || 0) / pageSize);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Carregando campanhas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 px-4 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Campanhas de Marketing</h1>
          <p className='text-muted-foreground'>
            Gerencie campanhas de comunicação com seus clientes
          </p>
        </div>
        <Link to='/campaigns/new'>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            Nova Campanha
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Total de Campanhas</p>
                <p className='text-2xl font-bold'>{data?.total || 0}</p>
              </div>
              <Target className='h-8 w-8 text-blue-500 opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Ativas</p>
                <p className='text-2xl font-bold'>
                  {data?.campaigns?.filter((c: any) => c.status === 'SCHEDULED' || c.status === 'SENDING').length || 0}
                </p>
              </div>
              <Send className='h-8 w-8 text-green-500 opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Concluídas</p>
                <p className='text-2xl font-bold'>
                  {data?.campaigns?.filter((c: any) => c.status === 'COMPLETED').length || 0}
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-blue-500 opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Taxa de Entrega</p>
                <p className='text-2xl font-bold'>
                  {data?.campaigns && data.campaigns.length > 0
                    ? Math.round(
                        (data.campaigns.reduce((sum: number, c: any) => sum + (c.deliveredCount || 0), 0) /
                          Math.max(data.campaigns.reduce((sum: number, c: any) => sum + (c.sentCount || 0), 0), 1)) *
                          100
                      )
                    : 0}
                  %
                </p>
              </div>
              <TrendingUp className='h-8 w-8 text-green-500 opacity-50' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col lg:flex-row gap-4'>
            {/* Search */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <input
                type='text'
                placeholder='Buscar campanhas...'
                className='w-full pl-10 pr-4 py-2 border rounded-md'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Type Filter */}
            <select
              className='px-4 py-2 border rounded-md min-w-[200px]'
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value='all'>Todos os Tipos</option>
              {CAMPAIGN_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className='px-4 py-2 border rounded-md min-w-[200px]'
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value='all'>Todos os Status</option>
              {Object.entries(CAMPAIGN_STATUS).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      {filteredCampaigns.length > 0 ? (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredCampaigns.map((campaign: any) => {
              const statusConfig = CAMPAIGN_STATUS[campaign.status as keyof typeof CAMPAIGN_STATUS];
              const StatusIcon = statusConfig?.icon || Edit;
              const typeConfig = CAMPAIGN_TYPES.find((t) => t.value === campaign.type);
              const ChannelIcon = CHANNEL_ICONS[campaign.channel as keyof typeof CHANNEL_ICONS] || Mail;
              const deliveryRate =
                campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : '0';
              const openRate =
                campaign.deliveredCount > 0 ? ((campaign.openCount / campaign.deliveredCount) * 100).toFixed(1) : '0';

              return (
                <Card key={campaign.id} className='hover:shadow-lg transition-shadow'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <span className='text-2xl'>{typeConfig?.icon || '✨'}</span>
                          <Badge className={`${statusConfig?.color} text-white`}>
                            {statusConfig?.label}
                          </Badge>
                        </div>
                        <CardTitle className='text-lg truncate'>{campaign.name}</CardTitle>
                        {campaign.description && (
                          <p className='text-sm text-muted-foreground line-clamp-2 mt-1'>
                            {campaign.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-4'>
                    {/* Campaign Info */}
                    <div className='space-y-2 text-sm'>
                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground flex items-center gap-1'>
                          <ChannelIcon className='h-3 w-3' />
                          Canal
                        </span>
                        <span className='font-medium'>{campaign.channel}</span>
                      </div>

                      <div className='flex items-center justify-between'>
                        <span className='text-muted-foreground flex items-center gap-1'>
                          <Target className='h-3 w-3' />
                          Alvo
                        </span>
                        <span className='font-medium'>{campaign.targetCount} clientes</span>
                      </div>

                      {campaign.scheduledAt && (
                        <div className='flex items-center justify-between'>
                          <span className='text-muted-foreground flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            Agendada
                          </span>
                          <span className='font-medium text-xs'>{formatDate(campaign.scheduledAt)}</span>
                        </div>
                      )}

                      {campaign.segment && (
                        <div className='flex items-center justify-between'>
                          <span className='text-muted-foreground'>Segmento</span>
                          <Badge variant='outline' className='text-xs'>
                            {campaign.segment.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Metrics */}
                    {campaign.status === 'COMPLETED' && (
                      <div className='pt-3 border-t space-y-2'>
                        <div className='flex justify-between text-xs'>
                          <span className='text-muted-foreground'>Entregue</span>
                          <span className='font-semibold text-green-600'>{deliveryRate}%</span>
                        </div>
                        <div className='flex justify-between text-xs'>
                          <span className='text-muted-foreground'>Abertura</span>
                          <span className='font-semibold text-blue-600'>{openRate}%</span>
                        </div>
                        {campaign.clickCount > 0 && (
                          <div className='flex justify-between text-xs'>
                            <span className='text-muted-foreground'>Cliques</span>
                            <span className='font-semibold'>{campaign.clickCount}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className='flex gap-2 pt-3 border-t'>
                        <Button size='sm' variant='outline' className='flex-1'>
                          <Eye className='mr-1 h-3 w-3' />
                          Ver Detalhes
                        </Button>

                      {campaign.status === 'DRAFT' && (
                          <Button size='sm' variant='ghost'>
                            <Edit className='h-3 w-3' />
                          </Button>
                      )}

                      {['DRAFT', 'SCHEDULED', 'PAUSED'].includes(campaign.status) && (
                        <Button
                          size='sm'
                          variant='ghost'
                          onClick={() => handleDelete(campaign.id)}
                        >
                          <Trash2 className='h-3 w-3 text-destructive' />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center items-center gap-2 mt-8'>
              <Button
                variant='outline'
                size='sm'
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>

              <div className='flex items-center gap-1'>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? 'default' : 'outline'}
                      size='sm'
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant='outline'
                size='sm'
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className='py-16'>
            <div className='text-center text-muted-foreground'>
              <Send className='h-16 w-16 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium mb-2'>
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Nenhuma campanha encontrada'
                  : 'Nenhuma campanha criada'}
              </p>
              <p className='text-sm mb-4'>
                {searchTerm || filterType !== 'all' || filterStatus !== 'all'
                  ? 'Tente ajustar os filtros de busca'
                  : 'Crie sua primeira campanha para começar a engajar seus clientes'}
              </p>
              {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
                <Link to='/campaigns/new'>
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    Criar Primeira Campanha
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
