import { Card, CardContent } from '../../../../components/ui/Card';
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

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-24" />
                  <div className="h-8 bg-muted animate-pulse rounded w-16" />
                </div>
                <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-x-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold">{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-6 w-6 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
