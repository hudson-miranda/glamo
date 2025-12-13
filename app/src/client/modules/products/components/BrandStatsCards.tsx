import { CollapsibleStats } from '../../../../components/ui/collapsible-stats';
import { Tag, Package, AlertCircle } from 'lucide-react';

type BrandStats = {
  total: number;
  withProducts: number;
  withoutProducts: number;
};

interface BrandStatsCardsProps {
  stats: BrandStats;
  isLoading?: boolean;
}

export function BrandStatsCards({ stats, isLoading }: BrandStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Marcas',
      value: stats.total,
      icon: Tag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Com Produtos',
      value: stats.withProducts,
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Sem Produtos',
      value: stats.withoutProducts,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  return (
    <CollapsibleStats 
      cards={cards} 
      isLoading={isLoading}
    />
  );
}
