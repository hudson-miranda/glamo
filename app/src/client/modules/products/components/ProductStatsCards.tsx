import { Card, CardContent } from '../../../../components/ui/card';
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

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        {cards.map((_, index) => (
          <Card key={index}>
            <CardContent className='pt-6'>
              <div className='h-12 w-12 animate-pulse rounded-lg bg-muted' />
              <div className='mt-4 space-y-2'>
                <div className='h-4 w-20 animate-pulse rounded bg-muted' />
                <div className='h-6 w-16 animate-pulse rounded bg-muted' />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-5'>
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>
                    {card.title}
                  </p>
                  <p className='text-2xl font-bold'>{card.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${card.bgColor}`}>
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
