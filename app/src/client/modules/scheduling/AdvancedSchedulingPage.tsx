import { useState } from 'react';
import { useQuery } from 'wasp/client/operations';
import { 
  listTimeBlocks, 
  getAvailableSlots, 
  listWaitingList 
} from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Plus,
  Settings,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { CalendarView } from './components/CalendarView';
import { EmptyState } from '../../../components/ui/empty-state';
import { Badge } from '../../../components/ui/badge';

export default function AdvancedSchedulingPage() {
  const { activeSalonId } = useSalonContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');

  // Fetch time blocks
  const { 
    data: timeBlocks, 
    isLoading: blocksLoading 
  } = useQuery(
    listTimeBlocks,
    {
      salonId: activeSalonId || '',
      startDate: new Date(selectedDate.setDate(1)),
      endDate: new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0),
    },
    {
      enabled: !!activeSalonId,
    }
  );

  // Fetch waiting list
  const { 
    data: waitingList, 
    isLoading: waitingLoading 
  } = useQuery(
    listWaitingList,
    {
      salonId: activeSalonId || '',
      status: 'WAITING',
    },
    {
      enabled: !!activeSalonId,
    }
  );

  // Calculate stats
  const stats = {
    blockedSlots: (timeBlocks || []).filter((b: any) => b.type === 'blocked').length,
    customHours: (timeBlocks || []).filter((b: any) => b.type === 'custom_hours').length,
    waitingClients: (waitingList || []).length,
    activeBlocks: (timeBlocks || []).filter((b: any) => !b.isRecurring).length,
  };

  const isLoading = blocksLoading || waitingLoading;

  if (!activeSalonId) {
    return (
      <div className="container mx-auto p-6">
        <EmptyState
          icon={AlertCircle}
          title="Nenhum salão selecionado"
          description="Por favor, selecione um salão para gerenciar o agendamento avançado."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamento Avançado</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie disponibilidade, bloqueios e lista de espera
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Bloqueio
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Slots Bloqueados</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.blockedSlots}</div>
            <p className="text-xs text-muted-foreground">
              Períodos indisponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horários Custom</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customHours}</div>
            <p className="text-xs text-muted-foreground">
              Horários especiais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lista de Espera</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.waitingClients}</div>
            <p className="text-xs text-muted-foreground">
              Clientes aguardando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloqueios Ativos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBlocks}</div>
            <p className="text-xs text-muted-foreground">
              Bloqueios únicos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="blocks">
            <XCircle className="h-4 w-4 mr-2" />
            Bloqueios
          </TabsTrigger>
          <TabsTrigger value="waiting">
            <Users className="h-4 w-4 mr-2" />
            Lista de Espera
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-muted-foreground">Carregando calendário...</div>
                </div>
              ) : (
                <CalendarView 
                  salonId={activeSalonId}
                  onAppointmentClick={(id) => console.log('Appointment clicked:', id)}
                  onTimeSlotClick={(date, empId) => console.log('Timeslot:', date, empId)}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blocks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bloqueios e Horários Especiais</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Carregando bloqueios...</div>
                </div>
              ) : (timeBlocks || []).length > 0 ? (
                <div className="space-y-3">
                  {(timeBlocks || []).map((block: any) => (
                    <div
                      key={block.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-1 h-12 rounded-full ${
                          block.type === 'blocked' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <div className="font-medium">{block.reason || 'Bloqueio'}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(block.startTime).toLocaleDateString('pt-BR')} - {' '}
                            {new Date(block.startTime).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })} até {' '}
                            {new Date(block.endTime).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={block.type === 'blocked' ? 'destructive' : 'default'}>
                          {block.type === 'blocked' ? 'Bloqueado' : 'Horário Custom'}
                        </Badge>
                        {block.isRecurring && (
                          <Badge variant="outline">Recorrente</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Clock}
                  title="Nenhum bloqueio configurado"
                  description="Configure bloqueios para gerenciar a disponibilidade da equipe."
                  action={
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Bloqueio
                    </Button>
                  }
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="waiting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Espera</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Carregando lista de espera...</div>
                </div>
              ) : (waitingList || []).length > 0 ? (
                <div className="space-y-3">
                  {(waitingList || []).map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {item.client?.name || 'Cliente não especificado'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.service?.name || 'Serviço não especificado'} • {' '}
                            Prioridade: {item.priority}
                          </div>
                          {item.notes && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {item.status === 'pending' ? 'Pendente' : item.status}
                        </Badge>
                        <Button variant="outline" size="sm">
                          Notificar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="Lista de espera vazia"
                  description="Nenhum cliente aguardando horário disponível no momento."
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
