import { CollapsibleStats } from '../../../../components/ui/collapsible-stats';
import { Package, CheckCircle, XCircle, TrendingDown, Star } from 'lucide-react';

type ProductStats = {
  total: number;
  active: number;
  inactive: number;
  lowStock: number;
  favorites: number;
};

type ProductStatsCardsProps = {
  stats: ProductStats;
  isLoading?: boolean;
};

export function ProductStatsCards({ stats, isLoading = false }: ProductStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Produtos',
      value: stats.total,
      icon: Package,
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
      title: 'Estoque Baixo',
      value: stats.lowStock,
      icon: TrendingDown,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
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
      title="Estatísticas de Produtos"
    />
  );
}
