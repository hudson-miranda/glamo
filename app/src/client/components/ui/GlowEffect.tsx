
import React from 'react';
import { cn } from '../../cn';

export interface GlowEffectProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  color?: 'neon' | 'blue' | 'purple';
  animated?: boolean;
}

/**
 * Decorative glow effect component for backgrounds
 * 
 * @example
 * ```tsx
 * <div className="relative">
 *   <GlowEffect position="top-right" size="lg" animated />
 *   <h1>Your content here</h1>
 * </div>
 * ```
 */
export const GlowEffect: React.FC<GlowEffectProps> = ({
  className,
  size = 'md',
  position = 'center',
  color = 'neon',
  animated = false,
  ...props
}) => {
  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-64 h-64',
    lg: 'w-96 h-96',
    xl: 'w-[32rem] h-[32rem]',
  };
  
  const positions = {
    center: 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    'top-left': 'top-0 left-0 -translate-x-1/2 -translate-y-1/2',
    'top-right': 'top-0 right-0 translate-x-1/2 -translate-y-1/2',
    'bottom-left': 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2',
    'bottom-right': 'bottom-0 right-0 translate-x-1/2 translate-y-1/2',
  };
  
  const colors = {
    neon: 'bg-neon-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };
  
  return (
    <div
      className={cn(
        'absolute rounded-full blur-3xl opacity-20 pointer-events-none',
        sizes[size],
        positions[position],
        colors[color],
        animated && 'animate-pulse-glow',
        className
      )}
      {...props}
    />
  );
};

GlowEffect.displayName = 'GlowEffect';
