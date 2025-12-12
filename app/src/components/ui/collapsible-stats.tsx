import { useState, ReactNode } from 'react';
import { Card, CardContent } from './card';
import { Button } from './button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';

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
  defaultExpanded?: boolean;
  title?: string;
};

export function CollapsibleStats({ 
  cards, 
  isLoading = false,
  defaultExpanded = false,
  title = 'Estatísticas'
}: CollapsibleStatsProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [currentSlide, setCurrentSlide] = useState(0);

  if (isLoading) {
    return (
      <div className='space-y-4'>
        {/* Mobile: Carrossel compacto */}
        <div className='lg:hidden'>
          <Card>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex-1'>
                  <div className='h-4 w-24 animate-pulse rounded bg-muted mb-2' />
                  <div className='h-8 w-16 animate-pulse rounded bg-muted' />
                </div>
                <div className='h-12 w-12 animate-pulse rounded-lg bg-muted' />
              </div>
            </CardContent>
          </Card>
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
      {/* Mobile: Versão otimizada */}
      <div className='lg:hidden'>
        <div className='space-y-3'>
          {/* Botão toggle */}
          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsExpanded(!isExpanded)}
            className='w-full justify-between h-auto py-3'
          >
            <span className='flex items-center gap-2 font-medium'>
              <span className='text-muted-foreground text-xs'>📊</span>
              {title}
            </span>
            {isExpanded ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </Button>

          {/* Visualização expandida: Grid 2x2 compacto */}
          <div
            className={cn(
              'grid gap-3 transition-all duration-300 ease-in-out overflow-hidden',
              isExpanded
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0'
            )}
          >
            <div className='overflow-hidden'>
              <div className='grid grid-cols-2 gap-3'>
                {cards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <Card key={index} className='border-2'>
                      <CardContent className='p-4'>
                        <div className='space-y-2'>
                          <div className={`rounded-lg p-2 w-fit ${card.bgColor}`}>
                            <Icon className={`h-4 w-4 ${card.color}`} />
                          </div>
                          <div>
                            <p className='text-xs font-medium text-muted-foreground line-clamp-1'>
                              {card.title}
                            </p>
                            <p className='text-xl font-bold mt-1'>{card.value}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Visualização recolhida: Cards em carrossel horizontal */}
          {!isExpanded && (
            <div className='relative'>
              <div className='overflow-x-auto no-scrollbar'>
                <div className='flex gap-3 pb-2'>
                  {cards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <Card 
                        key={index} 
                        className='flex-shrink-0 w-[160px] border-2 cursor-pointer hover:shadow-md transition-shadow'
                        onClick={() => setIsExpanded(true)}
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
              
              {/* Indicador de scroll */}
              <div className='flex justify-center gap-1 mt-2'>
                {cards.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      'h-1 rounded-full transition-all',
                      index === currentSlide
                        ? 'w-4 bg-primary'
                        : 'w-1 bg-muted-foreground/30'
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Resumo compacto quando recolhido */}
          {!isExpanded && cards.length > 0 && (
            <div className='flex items-center justify-center gap-4 py-2 px-4 bg-muted/30 rounded-lg'>
              {cards.slice(0, 3).map((card, index) => (
                <div key={index} className='text-center'>
                  <p className='text-xs text-muted-foreground truncate max-w-[80px]'>
                    {card.title}
                  </p>
                  <p className='text-sm font-bold'>{card.value}</p>
                </div>
              ))}
              {cards.length > 3 && (
                <div className='text-center'>
                  <p className='text-xs text-muted-foreground'>Mais</p>
                  <p className='text-sm font-bold'>+{cards.length - 3}</p>
                </div>
              )}
            </div>
          )}
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
