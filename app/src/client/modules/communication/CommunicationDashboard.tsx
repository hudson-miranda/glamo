import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import {
  MessageSquare,
  Send,
  FileText,
  Target,
  TrendingUp,
  Users,
  Mail,
  Phone,
  Calendar,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

interface QuickActionCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

const quickActions: QuickActionCard[] = [
  {
    title: 'Envio em Massa',
    description: 'Envie mensagens para múltiplos clientes simultaneamente',
    icon: <Send className="h-6 w-6" />,
    href: '/communication/bulk',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Modelos de Mensagem',
    description: 'Crie e gerencie templates de mensagens reutilizáveis',
    icon: <FileText className="h-6 w-6" />,
    href: '/communication/templates',
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Campanhas',
    description: 'Configure e acompanhe campanhas de marketing',
    icon: <Target className="h-6 w-6" />,
    href: '/campaigns',
    color: 'from-orange-500 to-red-500',
  },
  {
    title: 'Histórico',
    description: 'Visualize o histórico completo de comunicações',
    icon: <Calendar className="h-6 w-6" />,
    href: '/communication/log',
    color: 'from-green-500 to-emerald-500',
  },
];

const statsCards = [
  {
    title: 'Mensagens Enviadas',
    value: '2.847',
    change: '+12.5%',
    trend: 'up' as const,
    icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
    period: 'este mês',
  },
  {
    title: 'Taxa de Abertura',
    value: '68.4%',
    change: '+4.2%',
    trend: 'up' as const,
    icon: <Mail className="h-5 w-5 text-green-600" />,
    period: 'média mensal',
  },
  {
    title: 'Clientes Alcançados',
    value: '1.234',
    change: '+8.1%',
    trend: 'up' as const,
    icon: <Users className="h-5 w-5 text-purple-600" />,
    period: 'últimos 30 dias',
  },
  {
    title: 'Campanhas Ativas',
    value: '5',
    change: '2 novas',
    trend: 'neutral' as const,
    icon: <Target className="h-5 w-5 text-orange-600" />,
    period: 'em andamento',
  },
];

export default function CommunicationDashboard() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          Central de Comunicação
        </h1>
        <p className="text-muted-foreground">
          Gerencie toda a comunicação com seus clientes em um único lugar
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stat.trend === 'up' && (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                )}
                <span className={stat.trend === 'up' ? 'text-green-600' : ''}>
                  {stat.change}
                </span>
                <span className="mx-1">•</span>
                {stat.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} to={action.href}>
              <Card className="hover:shadow-lg transition-all duration-200 h-full group">
                <CardContent className="pt-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-sm text-primary font-medium group-hover:gap-2 transition-all">
                    Acessar
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity & Channels */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Communication Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Canais de Comunicação
            </CardTitle>
            <CardDescription>
              Performance por canal nos últimos 30 dias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <p className="text-sm text-muted-foreground">1.543 mensagens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">72%</p>
                  <p className="text-xs text-muted-foreground">taxa abertura</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">E-mail</p>
                    <p className="text-sm text-muted-foreground">892 mensagens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">58%</p>
                  <p className="text-xs text-muted-foreground">taxa abertura</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">SMS</p>
                    <p className="text-sm text-muted-foreground">412 mensagens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">85%</p>
                  <p className="text-xs text-muted-foreground">taxa abertura</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Campanhas Recentes
            </CardTitle>
            <CardDescription>
              Últimas campanhas criadas e seu status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                <div className="flex-1">
                  <p className="font-medium">Promoção Dia das Mães</p>
                  <p className="text-sm text-muted-foreground">Criada há 2 dias</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-400">
                  Ativa
                </span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                <div className="flex-1">
                  <p className="font-medium">Lembrete de Retorno</p>
                  <p className="text-sm text-muted-foreground">Criada há 5 dias</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400">
                  Agendada
                </span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                <div className="flex-1">
                  <p className="font-medium">Aniversariantes do Mês</p>
                  <p className="text-sm text-muted-foreground">Criada há 1 semana</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                  Concluída
                </span>
              </div>
            </div>

            <Link to="/campaigns">
              <Button variant="outline" className="w-full mt-4">
                Ver Todas as Campanhas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
