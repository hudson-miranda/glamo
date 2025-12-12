import { CollapsibleStats } from '../../../../components/ui/collapsible-stats';
import { CalendarIcon, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

type AppointmentStats = {
  total: number;
  pending: number;
  confirmed: number;
  done: number;
  cancelled: number;
};

interface AppointmentStatsCardsProps {
  stats: AppointmentStats;
  isLoading?: boolean;
}

export function AppointmentStatsCards({ stats, isLoading }: AppointmentStatsCardsProps) {
  const cards = [
    {
      title: 'Total',
      value: stats.total,
      icon: CalendarIcon,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Pendentes',
      value: stats.pending,
      icon: AlertCircle,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Confirmados',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Concluídos',
      value: stats.done,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Cancelados',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <CollapsibleStats 
      cards={cards} 
      isLoading={isLoading}
      title="Estatísticas de Agendamentos"
    />
  );
}
