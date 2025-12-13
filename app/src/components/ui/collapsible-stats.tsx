import { Card, CardContent } from './card';

type StatCard = {
  title: string;
  value: number | string;
  icon: any;
  color: string;
  bgColor: string;
};

type CollapsibleStatsProps = {
  cards: StatCard[];
  isLoading?: boolean;
};

export function CollapsibleStats({ 
  cards, 
  isLoading = false
}: CollapsibleStatsProps) {
  if (isLoading) {
    return (
      <div className='space-y-4'>
        {/* Mobile: Carrossel compacto */}
        <div className='lg:hidden'>
          <div className='overflow-x-auto no-scrollbar'>
            <div className='flex gap-3 pb-2'>
              {cards.map((_, index) => (
                <Card key={index} className='flex-shrink-0 w-[160px]'>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex-1'>
                        <div className='h-3 w-16 animate-pulse rounded bg-muted mb-2' />
                        <div className='h-7 w-12 animate-pulse rounded bg-muted' />
                      </div>
                      <div className='h-10 w-10 animate-pulse rounded-lg bg-muted' />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop: Grid tradicional */}
        <div className='hidden lg:grid gap-4 lg:grid-cols-4'>
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
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Mobile: Carrossel horizontal scrollável */}
      <div className='lg:hidden'>
        <div className='overflow-x-auto no-scrollbar'>
          <div className='flex gap-3 pb-2'>
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card 
                  key={index} 
                  className='flex-shrink-0 w-[160px]'
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex-1 min-w-0'>
                        <p className='text-xs font-medium text-muted-foreground line-clamp-1 mb-1'>
                          {card.title}
                        </p>
                        <p className='text-2xl font-bold'>{card.value}</p>
                      </div>
                      <div className={`rounded-lg p-2 flex-shrink-0 ${card.bgColor}`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Desktop: Grid tradicional */}
      <div className='hidden lg:grid gap-4 lg:grid-cols-4'>
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardContent className='pt-6'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      {card.title}
                    </p>
                    <p className='text-2xl font-bold mt-1'>{card.value}</p>
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
    </div>
  );
}
