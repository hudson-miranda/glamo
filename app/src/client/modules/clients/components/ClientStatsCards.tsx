
import { CollapsibleStats } from '../../../../components/ui/collapsible-stats';
import { Users, UserCheck, UserX, TrendingUp } from 'lucide-react';

type ClientStats = {
  total: number;
  active: number;
  inactive: number;
  vip: number;
};

type ClientStatsCardsProps = {
  stats: ClientStats;
  isLoading?: boolean;
};

export function ClientStatsCards({ stats, isLoading = false }: ClientStatsCardsProps) {
  const cards = [
    {
      title: 'Total Clients',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'VIP',
      value: stats.vip,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <CollapsibleStats 
      cards={cards} 
      isLoading={isLoading}
      title="Estatísticas de Clientes"
    />
  );
}
