import { useState } from 'react';
import { Link } from 'wasp/client/router';
import { useQuery, getClient } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  ArrowLeft, 
  Edit,
  Calendar,
  User
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { formatDate } from '../../lib/formatters';
import ClientOverviewTab from './components/ClientOverviewTab';
import ClientNotesTab from './components/ClientNotesTab';
import ClientDocumentsTab from './components/ClientDocumentsTab';
import ClientHistoryTab from './components/ClientHistoryTab';

export default function ClientDetailPage() {
  const id = typeof window !== 'undefined'
    ? window.location.pathname.split('/clients/')[1]?.split('/')[0]
    : undefined;
  const { activeSalonId } = useSalonContext();

  const { data: client, isLoading, error } = useQuery(
    getClient,
    {
      clientId: id!,
      salonId: activeSalonId || '',
    },
    {
      enabled: !!id && !!activeSalonId,
    }
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Carregando informações do cliente...</p>
        </div>
      </div>
    );
  }

  if (error || !client) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='text-center'>
          <p className='text-lg font-medium text-destructive mb-4'>
            {error ? 'Erro ao carregar cliente' : 'Cliente não encontrado'}
          </p>
          <Link to='/clients'>
            <Button variant='outline'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Voltar para Clientes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': 
      case 'VIP': 
        return 'default';
      case 'INACTIVE': 
        return 'secondary';
      case 'BLOCKED': 
        return 'destructive';
      default: 
        return 'outline';
    }
  };

  return (
    <div className='container mx-auto py-6 px-4 max-w-7xl space-y-6'>
      {/* Breadcrumb Navigation */}
      <nav className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Link to='/clients' className='hover:text-primary transition-colors'>
          Clientes
        </Link>
        <span>/</span>
        <span className='text-foreground font-medium'>{client.name}</span>
      </nav>

      {/* Client Header */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
            {/* Avatar */}
            <div className='flex-shrink-0'>
              {client.profilePhotoUrl ? (
                <img
                  src={client.profilePhotoUrl}
                  alt={client.name}
                  className='h-20 w-20 rounded-full object-cover ring-4 ring-background shadow-lg'
                />
              ) : (
                <div className='h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-bold ring-4 ring-background shadow-lg'>
                  {client.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Client Info */}
            <div className='flex-1 min-w-0'>
              <div className='flex flex-wrap items-center gap-3 mb-2'>
                <h1 className='text-3xl font-bold tracking-tight'>{client.name}</h1>
                <Badge variant={getStatusBadgeVariant(client.status)}>
                  {client.status}
                </Badge>
                {client.clientType && client.clientType !== 'REGULAR' && (
                  <Badge variant='outline'>{client.clientType}</Badge>
                )}
              </div>
              <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
                <span className='flex items-center gap-1'>
                  <User className='h-4 w-4' />
                  {client.email}
                </span>
                <span className='flex items-center gap-1'>
                  <Calendar className='h-4 w-4' />
                  Cliente desde {formatDate(client.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-2 flex-shrink-0'>
                <Button variant='outline'>
                  <Edit className='mr-2 h-4 w-4' />
                  Editar
                </Button>
                <Button>
                  <Calendar className='mr-2 h-4 w-4' />
                  Novo Agendamento
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='grid w-full grid-cols-4 lg:w-auto lg:inline-grid'>
          <TabsTrigger value='overview'>Visão Geral</TabsTrigger>
          <TabsTrigger value='notes'>Notas</TabsTrigger>
          <TabsTrigger value='documents'>Documentos</TabsTrigger>
          <TabsTrigger value='history'>Histórico</TabsTrigger>
        </TabsList>

        <div className='mt-6'>
          <TabsContent value='overview' className='mt-0'>
            <ClientOverviewTab client={client} />
          </TabsContent>

          <TabsContent value='notes' className='mt-0'>
            <ClientNotesTab clientId={id!} />
          </TabsContent>

          <TabsContent value='documents' className='mt-0'>
            <ClientDocumentsTab clientId={id!} />
          </TabsContent>

          <TabsContent value='history' className='mt-0'>
            <ClientHistoryTab clientId={id!} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
