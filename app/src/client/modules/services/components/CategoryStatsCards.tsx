import { CollapsibleStats } from '../../../../components/ui/collapsible-stats';
import { Tag, CheckCircle, XCircle, Layers } from 'lucide-react';

type CategoryStats = {
  total: number;
  active: number;
  inactive: number;
  withServices: number;
  withProducts: number;
};

type CategoryStatsCardsProps = {
  stats: CategoryStats;
  isLoading?: boolean;
};

export function CategoryStatsCards({ stats, isLoading = false }: CategoryStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Categorias',
      value: stats.total,
      icon: Tag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Ativas',
      value: stats.active,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inativas',
      value: stats.inactive,
      icon: XCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Com Serviços',
      value: stats.withServices,
      icon: Layers,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Com Produtos',
      value: stats.withProducts,
      icon: Layers,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <CollapsibleStats 
      cards={cards} 
      isLoading={isLoading}
    />
  );
}
