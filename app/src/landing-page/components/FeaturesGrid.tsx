import { motion } from 'framer-motion';
import React from 'react';
import { Card, CardContent, CardDescription, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';
import { Feature } from './Features';

export interface GridFeature extends Omit<Feature, 'icon'> {
  icon?: React.ReactNode;
  emoji?: string;
  direction?: 'col' | 'row' | 'col-reverse' | 'row-reverse';
  align?: 'center' | 'left';
  size: 'small' | 'medium' | 'large';
  fullWidthIcon?: boolean;
}

interface FeaturesGridProps {
  features: GridFeature[];
  className?: string;
}

const FeaturesGrid = ({ features, className = '' }: FeaturesGridProps) => {
  return (
    <div className='flex flex-col gap-4 py-24 sm:py-32 max-w-7xl mx-auto' id='features'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className='mx-auto max-w-2xl text-center mb-12 px-6'
      >
        <h2 className='text-base font-semibold leading-7 text-[#F5C542]'>Funcionalidades</h2>
        <p className='mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl'>
          Tudo que você precisa em um só lugar
        </p>
        <p className='mt-6 text-lg leading-8 text-muted-foreground'>
          Sistema completo de gestão com todas as ferramentas que seu salão precisa para crescer
        </p>
      </motion.div>
      <div
        className={cn(
          'grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 mx-4 md:mx-6 lg:mx-8 auto-rows-[minmax(140px,auto)]',
          className
        )}
      >
        {features.map((feature, index) => (
          <FeaturesGridItem key={feature.name + feature.description} index={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

function FeaturesGridItem({
  name,
  description,
  icon,
  emoji,
  href,
  direction = 'col',
  align = 'center',
  size = 'medium',
  fullWidthIcon = true,
  index = 0,
}: GridFeature & { index?: number }) {
  const gridFeatureSizeToClasses: Record<GridFeature['size'], string> = {
    small: 'col-span-1',
    medium: 'col-span-2 md:col-span-2 lg:col-span-2',
    large: 'col-span-2 md:col-span-2 lg:col-span-2 row-span-2',
  };

  const directionToClass: Record<NonNullable<GridFeature['direction']>, string> = {
    col: 'flex-col',
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse',
  };

  const gridFeatureCard = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={gridFeatureSizeToClasses[size]}
    >
      <Card
        className={cn(
          'h-full min-h-[140px] transition-all duration-300 hover:shadow-lg hover:border-primary/50 cursor-pointer group',
          'border-2'
        )}
        variant='bento'
      >
        <CardContent className='p-4 h-full flex flex-col justify-center items-center relative overflow-hidden'>
          {fullWidthIcon && (icon || emoji) ? (
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className='w-full flex justify-center items-center mb-3'
            >
              {icon ? icon : emoji ? <span className='text-4xl'>{emoji}</span> : null}
            </motion.div>
          ) : (
            <div
              className={cn(
                'flex items-center gap-3',
                directionToClass[direction],
                align === 'center' ? 'justify-center items-center' : 'justify-start'
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className='flex h-10 w-10 items-center justify-center rounded-lg'
              >
                {icon ? icon : emoji ? <span className='text-2xl'>{emoji}</span> : null}
              </motion.div>
              <CardTitle className={cn(align === 'center' ? 'text-center' : 'text-left', 'group-hover:text-primary transition-colors')}>
                {name}
              </CardTitle>
            </div>
          )}
          {fullWidthIcon && (icon || emoji) && (
            <CardTitle className='text-center mb-2 group-hover:text-primary transition-colors'>{name}</CardTitle>
          )}
          <CardDescription
            className={cn(
              'text-xs leading-relaxed',
              fullWidthIcon || direction === 'col' || align === 'center' ? 'text-center' : 'text-left'
            )}
          >
            {description}
          </CardDescription>
          
          {/* Hover glow effect */}
          <div className='absolute inset-0 bg-gradient-to-r from-[#F5C542]/0 via-[#F5C542]/5 to-[#F5C542]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
        </CardContent>
      </Card>
    </motion.div>
  );

  if (href) {
    return (
      <a href={href} target='_blank' rel='noopener noreferrer' className='contents'>
        {gridFeatureCard}
      </a>
    );
  }

  return gridFeatureCard;
}

export default FeaturesGrid;
