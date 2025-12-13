import { CollapsibleStats } from '../../../../components/ui/collapsible-stats';
import { Scissors, CheckCircle, XCircle, Star } from 'lucide-react';

type ServiceStats = {
  total: number;
  active: number;
  inactive: number;
  favorites: number;
};

type ServiceStatsCardsProps = {
  stats: ServiceStats;
  isLoading?: boolean;
};

export function ServiceStatsCards({ stats, isLoading = false }: ServiceStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Serviços',
      value: stats.total,
      icon: Scissors,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Ativos',
      value: stats.active,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inativos',
      value: stats.inactive,
      icon: XCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Favoritos',
      value: stats.favorites,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <CollapsibleStats 
      cards={cards} 
      isLoading={isLoading}
    />
  );
}
