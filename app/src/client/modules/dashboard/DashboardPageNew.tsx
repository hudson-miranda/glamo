import { useState, useMemo } from 'react';
import { useQuery, getDashboardAnalytics } from 'wasp/client/operations';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  Users,
  Clock,
  Award,
  Target,
  CreditCard,
  BarChart3,
  Loader2,
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
import type { DashboardAnalyticsResult } from '../../../dashboard/operations';

export default function DashboardPage() {
  const { activeSalonId } = useSalonContext();

  // Date range state - default last 14 days
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 14);
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    };
  });

  // Fetch dashboard analytics
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

  return (
    <div className="space-y-6 p-6">
      {/* Header with Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral do seu negócio e métricas importantes
          </p>
        </div>
        <DateRangeFilter
          onApply={handleApplyFilter}
          onClear={handleClearFilter}
          defaultStartDate={
            dateRange.startDate ? new Date(dateRange.startDate) : undefined
          }
          defaultEndDate={dateRange.endDate ? new Date(dateRange.endDate) : undefined}
        />
      </div>

      {/* Top KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalSales.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Hoje:{' '}
              {analytics.totalSalesCurrentDay.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {analytics.salesGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  analytics.salesGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {analytics.salesGrowth >= 0 ? '+' : ''}
                {analytics.salesGrowth.toFixed(1)}% vs Período Anterior
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Card with Sparkline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAppointments}</div>
            <div className="mt-2">
              <SparklineChart
                data={analytics.dailyData.map((d) => d.appointments)}
                height={40}
                color="#10b981"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              {analytics.appointmentsGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  analytics.appointmentsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {analytics.appointmentsGrowth >= 0 ? '+' : ''}
                {analytics.appointmentsGrowth.toFixed(1)}% Taxa de crescimento
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Sessions (Comandas) Card with Sparkline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comandas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSessions}</div>
            <div className="mt-2">
              <SparklineChart
                data={analytics.dailyData.map((d) => d.sales)}
                height={40}
                color="#f59e0b"
              />
            </div>
            <div className="flex items-center gap-2 mt-2">
              {analytics.sessionsGrowth >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  analytics.sessionsGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {analytics.sessionsGrowth >= 0 ? '+' : ''}
                {analytics.sessionsGrowth.toFixed(1)}% Taxa de conversão
              </span>
            </div>
          </CardContent>
        </Card>

        {/* New Clients Card */}
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
              {((analytics.newClients - analytics.newClientsPreviousPeriod) /
                (analytics.newClientsPreviousPeriod || 1)) *
                100 >=
              0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  ((analytics.newClients - analytics.newClientsPreviousPeriod) /
                    (analytics.newClientsPreviousPeriod || 1)) *
                    100 >=
                  0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {((analytics.newClients - analytics.newClientsPreviousPeriod) /
                  (analytics.newClientsPreviousPeriod || 1)) *
                  100 >=
                0
                  ? '+'
                  : ''}
                {(
                  ((analytics.newClients - analytics.newClientsPreviousPeriod) /
                    (analytics.newClientsPreviousPeriod || 1)) *
                  100
                ).toFixed(1)}
                % vs Período Anterior
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales and Appointments Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Vendas e Agendamentos Diários</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={[
              {
                name: 'Vendas (R$)',
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

      {/* Average Ticket Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Médio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {analytics.averageTicket.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </p>
                <p className="text-sm text-muted-foreground">Ticket médio do período</p>
              </div>
              <div className="flex items-center gap-2">
                {analytics.averageTicketGrowth >= 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )}
                <span
                  className={`text-lg font-semibold ${
                    analytics.averageTicketGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {analytics.averageTicketGrowth >= 0 ? '+' : ''}
                  {analytics.averageTicketGrowth.toFixed(1)}%
                </span>
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
              height={250}
              colors={['#9ca3af', '#6366f1']}
            />
          </div>
        </CardContent>
      </Card>

      {/* Continue with more sections... This file is getting large, 
          so I'll create the remaining sections in the next part */}
    </div>
  );
}
