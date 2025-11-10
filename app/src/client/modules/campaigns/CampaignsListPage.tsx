
import { useState } from 'react';
import { Link } from 'wasp/client/router';
import { useQuery } from 'wasp/client/operations';
import { listCampaigns } from 'wasp/client/operations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Send, Calendar, BarChart } from 'lucide-react';

export default function CampaignsListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery(listCampaigns, { page, pageSize: 20 });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'secondary';
      case 'SCHEDULED':
        return 'default';
      case 'SENDING':
        return 'default';
      case 'COMPLETED':
        return 'secondary';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

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

  const getCampaignTypeLabel = (type: string) => {
    switch (type) {
      case 'BIRTHDAY':
        return 'Aniversário';
      case 'REACTIVATION':
        return 'Reativação';
      case 'PROMOTIONAL':
        return 'Promocional';
      case 'ANNOUNCEMENT':
        return 'Anúncio';
      case 'FEEDBACK_REQUEST':
        return 'Feedback';
      case 'APPOINTMENT_REMINDER':
        return 'Lembrete';
      case 'FOLLOW_UP':
        return 'Follow-up';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando campanhas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center text-red-600">
          <p>Erro ao carregar campanhas: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campanhas de Marketing</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas campanhas de comunicação com clientes
          </p>
        </div>
        <Link to="/campaigns/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nova Campanha
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.campaigns?.filter((c: any) => c.status === 'SCHEDULED').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data?.campaigns?.filter((c: any) => c.status === 'COMPLETED').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>Lista de todas as campanhas criadas</CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.campaigns || data.campaigns.length === 0 ? (
            <div className="text-center py-12">
              <Send className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">Nenhuma campanha encontrada</h3>
              <p className="mt-2 text-sm text-gray-600">
                Crie sua primeira campanha para começar a se comunicar com seus clientes.
              </p>
              <Link to="/campaigns/new">
                <Button className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Campanha
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Destinatários</TableHead>
                  <TableHead>Enviadas</TableHead>
                  <TableHead>Taxa de Entrega</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.campaigns.map((campaign: any) => {
                  const deliveryRate =
                    campaign.sentCount > 0
                      ? ((campaign.deliveredCount / campaign.sentCount) * 100).toFixed(1)
                      : '--';

                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        <Link
                          to={`/campaigns/${campaign.id}`}
                          className="hover:underline text-blue-600"
                        >
                          {campaign.name}
                        </Link>
                      </TableCell>
                      <TableCell>{getCampaignTypeLabel(campaign.type)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(campaign.status)}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{campaign.targetCount}</TableCell>
                      <TableCell>{campaign.sentCount}</TableCell>
                      <TableCell>{deliveryRate}%</TableCell>
                      <TableCell>
                        {new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Link to={`/campaigns/${campaign.id}`}>
                          <Button variant="ghost" size="sm">
                            Ver
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data && data.total > data.pageSize && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Anterior
          </Button>
          <span className="py-2 px-4">
            Página {page} de {Math.ceil(data.total / data.pageSize)}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(data.total / data.pageSize)}
          >
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
