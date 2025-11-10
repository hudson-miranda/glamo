
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'wasp/client/operations';
import { getCampaign } from 'wasp/client/operations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Send, Calendar, Users, Mail } from 'lucide-react';

export default function CampaignDetailPage() {
  const { id } = useParams();
  const { data: campaign, isLoading, error } = useQuery(getCampaign, { id: id! });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Rascunho';
      case 'SCHEDULED':
        return 'Agendado';
      case 'SENDING':
        return 'Enviando';
      case 'COMPLETED':
        return 'Concluído';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-600">
          <p>Erro ao carregar campanha</p>
        </div>
      </div>
    );
  }

  const deliveryRate =
    campaign.sentCount > 0
      ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1)
      : '0';

  const openRate =
    campaign.deliveredCount > 0
      ? ((campaign.openCount / campaign.deliveredCount) * 100).toFixed(1)
      : '0';

  return (
    <div className="container py-8">
      <Link to="/campaigns">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </Link>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
          <p className="text-gray-600 mt-1">{campaign.description}</p>
        </div>
        <Badge>{getStatusLabel(campaign.status)}</Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Destinatários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.targetCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.sentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryRate}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Details */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Campanha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Canal</p>
              <p className="text-base">{campaign.channel}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo</p>
              <p className="text-base">{campaign.type}</p>
            </div>
            {campaign.scheduledAt && (
              <div>
                <p className="text-sm font-medium text-gray-500">Agendada para</p>
                <p className="text-base">
                  {new Date(campaign.scheduledAt).toLocaleString('pt-BR')}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500">Criada em</p>
              <p className="text-base">{new Date(campaign.createdAt).toLocaleString('pt-BR')}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mensagem</CardTitle>
          </CardHeader>
          <CardContent>
            {campaign.subject && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500">Assunto</p>
                <p className="text-base">{campaign.subject}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-500 mb-2">Texto</p>
              <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
                {campaign.messageTemplate}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Communications */}
      {campaign.communications && campaign.communications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Recentes</CardTitle>
            <CardDescription>Últimas 10 mensagens enviadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {campaign.communications.map((comm: any) => (
                <div key={comm.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{comm.client?.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(comm.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <Badge variant={comm.status === 'DELIVERED' ? 'secondary' : 'default'}>
                    {comm.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
