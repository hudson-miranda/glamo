
import React from 'react';
import { cn } from '../../cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'glass' | 'solid' | 'bordered' | 'glass-neon';
  hover?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

/**
 * Card component with glassmorphism and glow effects
 * 
 * @example
 * ```tsx
 * <Card variant="glass-neon" hover glow>
 *   <h3>Amazing Feature</h3>
 *   <p>Description goes here</p>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'glass', hover = false, glow = false, children, ...props }, ref) => {
    const baseStyles = 'rounded-xl p-6 transition-all duration-300';
    
    const variants = {
      'glass': 'glass-card',
      'solid': 'bg-zinc-900 border border-zinc-800',
      'bordered': 'bg-zinc-900/50 border border-zinc-700',
      'glass-neon': 'glass-neon',
    };
    
    const hoverStyles = hover ? 'hover:scale-[1.02] hover:-translate-y-1' : '';
    const glowStyles = glow ? 'hover:shadow-glow-md' : '';
    
    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          hoverStyles,
          glowStyles,
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
