import { useState } from 'react';
import { useQuery, getDashboardAnalytics } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  Users,
  Clock,
  Target,
  CreditCard,
  ShoppingBag,
  Loader2,
  Cake,
  TrendingDownIcon,
} from 'lucide-react';
import { DateRangeFilter } from './components/DateRangeFilter';
import {
  LineChart,
  BarChart,
  DonutChart,
  FunnelChart,
  HeatmapChart,
  SparklineChart,
} from '../../../components/charts';

export default function DashboardPage() {
  const { activeSalonId } = useSalonContext();
  const [currentPage, setCurrentPage] = useState(1);
  const employeesPerPage = 3;

  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  });

  const { data: analytics, isLoading } = useQuery(
    getDashboardAnalytics,
    {
      salonId: activeSalonId || '',
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const handleApplyFilter = (startDate: Date, endDate: Date) => {
    setDateRange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  const handleClearFilter = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    setDateRange({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    );
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;

  const GrowthBadge = ({ value }: { value: number }) => (
    <div className="flex items-center gap-1">
      {value >= 0 ? (
        <TrendingUp className="h-3 w-3 text-green-600" />
      ) : (
        <TrendingDown className="h-3 w-3 text-red-600" />
      )}
      <span className={`text-xs font-medium ${value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {formatPercent(value)}
      </span>
    </div>
  );

  const totalPages = Math.ceil(analytics.employeeStats.length / employeesPerPage);
  const paginatedEmployees = analytics.employeeStats.slice(
    (currentPage - 1) * employeesPerPage,
    currentPage * employeesPerPage
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do seu negócio</p>
        </div>
        <DateRangeFilter
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
          defaultStartDate={dateRange.startDate ? new Date(dateRange.startDate) : undefined}
          defaultEndDate={dateRange.endDate ? new Date(dateRange.endDate) : undefined}
        />
      </div>

      {/* Top KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Hoje: {formatCurrency(analytics.totalSalesCurrentDay)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <GrowthBadge value={analytics.salesGrowth} />
              <span className="text-xs text-muted-foreground">vs Período Anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAppointments}</div>
            <div className="mt-2 -mb-2">
              <SparklineChart
                data={analytics.dailyData.map((d) => d.appointments)}
                height={40}
                color="#10b981"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <GrowthBadge value={analytics.appointmentsGrowth} />
              <span className="text-xs text-muted-foreground">Taxa de crescimento</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comandas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
            <div className="mt-2 -mb-2">
              <SparklineChart
                data={analytics.dailyData.map((d) => d.sales)}
                height={40}
                color="#f59e0b"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              <GrowthBadge value={analytics.sessionsGrowth} />
              <span className="text-xs text-muted-foreground">Taxa de conversão</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Novos Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.newClients}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Período anterior: {analytics.newClientsPreviousPeriod}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <GrowthBadge
                value={
                  ((analytics.newClients - analytics.newClientsPreviousPeriod) /
                    (analytics.newClientsPreviousPeriod || 1)) *
                  100
                }
              />
              <span className="text-xs text-muted-foreground">vs Período Anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales and Appointments Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Comandas e Agendamentos</CardTitle>
          <p className="text-sm text-muted-foreground">Visão diária do período</p>
        </CardHeader>
        <CardContent>
          <LineChart
            data={[
              {
                name: 'Receita (R$)',
                data: analytics.dailyData.map((d) => d.revenue),
              },
              {
                name: 'Agendamentos',
                data: analytics.dailyData.map((d) => d.appointments),
              },
            ]}
            categories={analytics.dailyData.map((d) =>
              new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            )}
            height={350}
            colors={['#6366f1', '#10b981']}
          />
        </CardContent>
      </Card>

      {/* Average Ticket */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Médio</CardTitle>
          <p className="text-sm text-muted-foreground">Comparação entre períodos</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{formatCurrency(analytics.averageTicket)}</p>
                <p className="text-sm text-muted-foreground">Ticket médio do período</p>
              </div>
              <div className="flex items-center gap-2">
                <GrowthBadge value={analytics.averageTicketGrowth} />
                <span className="text-sm text-muted-foreground">vs Período Anterior</span>
              </div>
            </div>
            <BarChart
              data={[
                {
                  name: 'Período Anterior',
                  data: [analytics.averageTicketPreviousPeriod],
                },
                {
                  name: 'Período Atual',
                  data: [analytics.averageTicket],
                },
              ]}
              categories={['Ticket Médio']}
              height={200}
              colors={['#9ca3af', '#6366f1']}
              showDataLabels={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Employee Stats and Top Clients */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Employee Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Atendimentos por Colaborador</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total: {analytics.employeeStats.reduce((sum, e) => sum + e.appointmentCount, 0)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="-mx-2">
                <SparklineChart
                  data={analytics.dailyData.map((d) => d.appointments)}
                  height={60}
                  color="#8b5cf6"
                  type="area"
                />
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">🏆 Top 3 Colaboradores</h4>
                {analytics.employeeStats.slice(0, 3).map((emp, index) => (
                  <div
                    key={emp.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={emp.profilePhoto || undefined} />
                      <AvatarFallback>
                        {emp.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {emp.appointmentCount} atendimentos
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(emp.totalRevenue)}</p>
                      <p className="text-xs text-muted-foreground">
                        Média: {formatCurrency(emp.averageTicket)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {analytics.employeeStats.length > 3 && (
                <div className="space-y-3 pt-3 border-t">
                  <h4 className="text-sm font-semibold">Todos os Colaboradores</h4>
                  <div className="space-y-2">
                    {paginatedEmployees.map((emp) => (
                      <div
                        key={emp.id}
                        className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={emp.profilePhoto || undefined} />
                            <AvatarFallback className="text-xs">
                              {emp.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{emp.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-muted-foreground">{emp.appointmentCount}</span>
                          <span className="font-medium">{formatCurrency(emp.totalRevenue)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top 3 Clientes</CardTitle>
            <p className="text-sm text-muted-foreground">Clientes que mais gastaram</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topClients.map((client, index) => (
                <div
                  key={client.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    {index + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {client.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{client.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{client.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(client.totalSpent)}</p>
                    <p className="text-xs text-muted-foreground">{client.visitCount} visitas</p>
                  </div>
                </div>
              ))}

              {analytics.upcomingBirthdays.length > 0 && (
                <div className="pt-4 border-t space-y-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Cake className="h-4 w-4" />
                    Próximos Aniversariantes
                  </h4>
                  {analytics.upcomingBirthdays.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {client.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{client.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {client.birthDate &&
                          new Date(client.birthDate).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                          })}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950">
                  <div>
                    <p className="text-sm font-medium">Taxa de Retenção</p>
                    <p className="text-xs text-muted-foreground">Clientes que retornaram</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.retentionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales by Category and Funnel */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vendas por Categoria</CardTitle>
            <p className="text-sm text-muted-foreground">Distribuição de receita</p>
          </CardHeader>
          <CardContent>
            {analytics.salesByCategory.length > 0 ? (
              <DonutChart
                data={analytics.salesByCategory.map((c) => c.revenue)}
                labels={analytics.salesByCategory.map((c) => c.category)}
                height={300}
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhuma venda no período
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funil de Agendamentos</CardTitle>
            <p className="text-sm text-muted-foreground">Taxa de conversão</p>
          </CardHeader>
          <CardContent>
            <FunnelChart
              data={[
                {
                  label: 'Todos',
                  value: analytics.appointmentsByStatus.all,
                  percentage: 100,
                },
                {
                  label: 'Confirmados',
                  value: analytics.appointmentsByStatus.confirmed,
                  percentage:
                    (analytics.appointmentsByStatus.confirmed /
                      (analytics.appointmentsByStatus.all || 1)) *
                    100,
                },
                {
                  label: 'Faturados',
                  value: analytics.appointmentsByStatus.billed,
                  percentage:
                    (analytics.appointmentsByStatus.billed /
                      (analytics.appointmentsByStatus.all || 1)) *
                    100,
                },
              ]}
              height={300}
            />
          </CardContent>
        </Card>
      </div>

      {/* Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos vs Serviços</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Serviços</span>
                <span className="text-sm font-medium">{formatCurrency(analytics.servicesRevenue)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Produtos</span>
                <span className="text-sm font-medium">{formatCurrency(analytics.productsRevenue)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-xs text-muted-foreground">Pacotes</span>
                <span className="text-sm font-medium">{formatCurrency(analytics.packagesRevenue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {analytics.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Agendamentos → Vendas</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600"
                style={{ width: `${analytics.conversionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
            <TrendingDownIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {analytics.cancellationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.appointmentsByStatus.cancelled} cancelados
            </p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600"
                style={{ width: `${analytics.cancellationRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Math.round(analytics.averageServiceTime)} min</div>
            <p className="text-xs text-muted-foreground mt-1">Por atendimento</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      {analytics.paymentMethods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Formas de Pagamento</CardTitle>
            <p className="text-sm text-muted-foreground">Distribuição de pagamentos</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analytics.paymentMethods.map((pm, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10">
                      <CreditCard className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{pm.method}</p>
                      <p className="text-xs text-muted-foreground">{pm.count} transações</p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatCurrency(pm.total)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Peak Hours */}
      {analytics.peakHours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Horários de Pico</CardTitle>
            <p className="text-sm text-muted-foreground">Horários mais movimentados</p>
          </CardHeader>
          <CardContent>
            <BarChart
              data={[
                {
                  name: 'Agendamentos',
                  data: analytics.peakHours.map((h) => h.count),
                },
              ]}
              categories={analytics.peakHours.map((h) => `${h.hour}:00`)}
              height={250}
              colors={['#8b5cf6']}
              showDataLabels={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Occupancy */}
      {analytics.occupancyData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ocupação da Agenda por Colaborador</CardTitle>
            <p className="text-sm text-muted-foreground">% ocupação vs disponibilidade</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analytics.occupancyData.map((occ) => (
                <div key={occ.employeeId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">{occ.employeeName}</p>
                    <p className="text-sm font-bold text-primary">
                      {occ.occupancyPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${Math.min(100, occ.occupancyPercentage)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.round(occ.totalMinutesBooked / 60)}h ocupadas</span>
                    <span>{Math.round(occ.totalMinutesAvailable / 60)}h disponíveis</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Calor de Agendamentos</CardTitle>
          <p className="text-sm text-muted-foreground">Horários mais concorridos por dia</p>
        </CardHeader>
        <CardContent>
          <HeatmapChart data={analytics.heatmapData} height={400} />
        </CardContent>
      </Card>
    </div>
  );
}
