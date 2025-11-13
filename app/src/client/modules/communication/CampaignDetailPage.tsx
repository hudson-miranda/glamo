import { Link } from 'wasp/client/router';
import { useQuery, getCampaign } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  ArrowLeft,
  Calendar,
  Send,
  Target,
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  CheckCircle,
  Mail,
  MessageSquare,
  Phone,
  Clock,
  Edit,
  Users,
  BarChart3,
} from 'lucide-react';
import { formatDate } from '../../lib/formatters';

const CAMPAIGN_STATUS = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-500' },
  SCHEDULED: { label: 'Agendada', color: 'bg-blue-500' },
  SENDING: { label: 'Enviando', color: 'bg-yellow-500' },
  COMPLETED: { label: 'Concluída', color: 'bg-green-500' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-500' },
  FAILED: { label: 'Falhou', color: 'bg-red-700' },
  PAUSED: { label: 'Pausada', color: 'bg-orange-500' },
};

const CAMPAIGN_TYPES = {
  BIRTHDAY: { label: 'Aniversário', icon: '🎂' },
  REACTIVATION: { label: 'Reativação', icon: '🔄' },
  PROMOTIONAL: { label: 'Promocional', icon: '🎁' },
  ANNOUNCEMENT: { label: 'Anúncio', icon: '📢' },
  FEEDBACK_REQUEST: { label: 'Feedback', icon: '⭐' },
  APPOINTMENT_REMINDER: { label: 'Lembrete', icon: '⏰' },
  FOLLOW_UP: { label: 'Follow-up', icon: '📞' },
  CUSTOM: { label: 'Personalizada', icon: '✨' },
};

const CHANNEL_ICONS = {
  EMAIL: { icon: Mail, label: 'E-mail' },
  SMS: { icon: MessageSquare, label: 'SMS' },
  WHATSAPP: { icon: Phone, label: 'WhatsApp' },
  PUSH: { icon: Send, label: 'Push Notification' },
};

export default function CampaignDetailPage() {
  const id = window.location.pathname.split('/').pop() || '';

  const { data: campaign, isLoading } = useQuery(getCampaign, { id }, { enabled: !!id }) as { data: any; isLoading: boolean };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Carregando campanha...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className='container mx-auto py-12 px-4 text-center'>
        <p className='text-xl text-muted-foreground mb-4'>Campanha não encontrada</p>
        <Link to='/campaigns'>
          <Button variant='outline'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar para Campanhas
          </Button>
        </Link>
      </div>
    );
  }

  const statusConfig = CAMPAIGN_STATUS[campaign.status as keyof typeof CAMPAIGN_STATUS];
  const typeConfig = CAMPAIGN_TYPES[campaign.type as keyof typeof CAMPAIGN_TYPES];
  const channelConfig = CHANNEL_ICONS[campaign.channel as keyof typeof CHANNEL_ICONS];
  const ChannelIcon = channelConfig?.icon || Mail;

  const deliveryRate =
    campaign.sentCount > 0 ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1) : '0';
  const openRate =
    campaign.deliveredCount > 0 ? ((campaign.openCount / campaign.deliveredCount) * 100).toFixed(1) : '0';
  const clickRate = campaign.openCount > 0 ? ((campaign.clickCount / campaign.openCount) * 100).toFixed(1) : '0';
  const conversionRate =
    campaign.deliveredCount > 0 ? ((campaign.conversionCount / campaign.deliveredCount) * 100).toFixed(1) : '0';

  return (
    <div className='container mx-auto py-6 px-4 space-y-6'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Link to='/campaigns' className='hover:text-primary'>
          Campanhas
        </Link>
        <span>/</span>
        <span className='text-foreground'>{campaign.name}</span>
      </div>

      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='flex items-start gap-4'>
          <Link to='/campaigns'>
            <Button variant='ghost' size='icon'>
              <ArrowLeft className='h-5 w-5' />
            </Button>
          </Link>
          <div>
            <div className='flex items-center gap-3 mb-2'>
              <span className='text-3xl'>{typeConfig?.icon || '✨'}</span>
              <h1 className='text-3xl font-bold tracking-tight'>{campaign.name}</h1>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge className={`${statusConfig?.color} text-white`}>{statusConfig?.label}</Badge>
              <Badge variant='outline'>{typeConfig?.label}</Badge>
              <Badge variant='outline' className='flex items-center gap-1'>
                <ChannelIcon className='h-3 w-3' />
                {channelConfig?.label}
              </Badge>
            </div>
          </div>
        </div>

        {campaign.status === 'DRAFT' && (
          <Button variant='outline'>
            <Edit className='mr-2 h-4 w-4' />
            Edit Campaign
          </Button>
        )}
      </div>

      {/* Description */}
      {campaign.description && (
        <Card>
          <CardContent className='pt-6'>
            <p className='text-muted-foreground'>{campaign.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      {campaign.status === 'COMPLETED' && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Taxa de Entrega</p>
                  <p className='text-3xl font-bold text-green-600'>{deliveryRate}%</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {campaign.deliveredCount} de {campaign.sentCount}
                  </p>
                </div>
                <CheckCircle className='h-10 w-10 text-green-500 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Taxa de Abertura</p>
                  <p className='text-3xl font-bold text-blue-600'>{openRate}%</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {campaign.openCount} aberturas
                  </p>
                </div>
                <Eye className='h-10 w-10 text-blue-500 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Taxa de Cliques</p>
                  <p className='text-3xl font-bold text-purple-600'>{clickRate}%</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {campaign.clickCount} cliques
                  </p>
                </div>
                <MousePointerClick className='h-10 w-10 text-purple-500 opacity-50' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Taxa de Conversão</p>
                  <p className='text-3xl font-bold text-orange-600'>{conversionRate}%</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {campaign.conversionCount} conversões
                  </p>
                </div>
                <TrendingUp className='h-10 w-10 text-orange-500 opacity-50' />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Campaign Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Targeting Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Target className='h-5 w-5' />
                Informações de Segmentação
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>Público Alvo</p>
                  <p className='font-semibold text-lg'>{campaign.targetCount} clientes</p>
                </div>

                {campaign.segment && (
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Segmento</p>
                    <Badge variant='outline' className='text-sm'>
                      {campaign.segment.name}
                    </Badge>
                  </div>
                )}

                {campaign.sentCount > 0 && (
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Enviados</p>
                    <p className='font-semibold text-lg'>{campaign.sentCount}</p>
                  </div>
                )}

                {campaign.deliveredCount > 0 && (
                  <div>
                    <p className='text-sm text-muted-foreground mb-1'>Entregues</p>
                    <p className='font-semibold text-lg text-green-600'>{campaign.deliveredCount}</p>
                  </div>
                )}
              </div>

              {campaign.segment?.clientCount && (
                <div className='pt-4 border-t'>
                  <p className='text-sm text-muted-foreground mb-2'>Critérios do Segmento:</p>
                  <div className='bg-muted p-3 rounded-md'>
                    <p className='text-sm'>
                      {campaign.segment.clientCount} clientes no segmento &quot;{campaign.segment.name}&quot;
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <MessageSquare className='h-5 w-5' />
                Conteúdo da Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {campaign.subject && (
                <div>
                  <p className='text-sm text-muted-foreground mb-2'>Assunto:</p>
                  <p className='font-semibold'>{campaign.subject}</p>
                </div>
              )}

              <div>
                <p className='text-sm text-muted-foreground mb-2'>Mensagem:</p>
                <div className='bg-muted p-4 rounded-md whitespace-pre-wrap'>
                  {campaign.messageTemplate}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Communications */}
          {campaign.communications && campaign.communications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BarChart3 className='h-5 w-5' />
                  Comunicações Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {campaign.communications.slice(0, 5).map((comm: any) => (
                    <div key={comm.id} className='flex items-center justify-between p-3 bg-muted rounded-md'>
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>
                          {comm.client?.name || 'Cliente'}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {formatDate(comm.sentAt || comm.createdAt)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          comm.status === 'DELIVERED'
                            ? 'default'
                            : comm.status === 'FAILED'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {comm.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          {/* Schedule Info */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-lg'>
                <Clock className='h-5 w-5' />
                Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {campaign.scheduledAt && (
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>Agendada para</p>
                  <p className='font-semibold flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    {formatDate(campaign.scheduledAt)}
                  </p>
                </div>
              )}

              {campaign.sentAt && (
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>Enviada em</p>
                  <p className='font-semibold'>{formatDate(campaign.sentAt)}</p>
                </div>
              )}

              {campaign.completedAt && (
                <div>
                  <p className='text-sm text-muted-foreground mb-1'>Concluída em</p>
                  <p className='font-semibold'>{formatDate(campaign.completedAt)}</p>
                </div>
              )}

              <div className='pt-3 border-t'>
                <p className='text-sm text-muted-foreground mb-1'>Criada em</p>
                <p className='text-sm'>{formatDate(campaign.createdAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Creator Info */}
          {campaign.creator && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-lg'>
                  <Users className='h-5 w-5' />
                  Criador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center'>
                    <span className='text-primary font-semibold'>
                      {campaign.creator.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className='font-medium'>{campaign.creator.name}</p>
                    <p className='text-xs text-muted-foreground'>{campaign.creator.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Budget Info */}
          {(campaign.estimatedCost || campaign.actualCost) && (
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Orçamento</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {campaign.estimatedCost && (
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Estimado</span>
                    <span className='font-semibold'>
                      R$ {campaign.estimatedCost.toFixed(2)}
                    </span>
                  </div>
                )}

                {campaign.actualCost && (
                  <div className='flex justify-between'>
                    <span className='text-sm text-muted-foreground'>Real</span>
                    <span className='font-semibold text-green-600'>
                      R$ {campaign.actualCost.toFixed(2)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
