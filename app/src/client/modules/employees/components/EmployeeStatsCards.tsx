import { Card, CardContent } from '../../../../components/ui/card';
import { Users, UserCheck, UserX, Globe } from 'lucide-react';

type EmployeeStats = {
  total: number;
  active: number;
  inactive: number;
  withSystemAccess: number;
};

type EmployeeStatsCardsProps = {
  stats: EmployeeStats;
  isLoading?: boolean;
};

export function EmployeeStatsCards({ stats, isLoading = false }: EmployeeStatsCardsProps) {
  const cards = [
    {
      title: 'Total de Colaboradores',
      value: stats.total,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Ativos',
      value: stats.active,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inativos',
      value: stats.inactive,
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Agendamento Online',
      value: stats.withSystemAccess,
      icon: Globe,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  if (isLoading) {
    return (
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
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
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
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
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
