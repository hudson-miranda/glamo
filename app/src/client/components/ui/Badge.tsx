
import React from 'react';
import { cn } from '../../cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'brand' | 'outline' | 'solid' | 'glow' | 'mostpopular';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

/**
 * Badge component with brand styling (Soft Purple)
 * 
 * @example
 * ```tsx
 * <Badge variant="glow" size="md" dot>New Feature</Badge>
 * <Badge variant="outline">Beta</Badge>
 * ```
 */
export const Badge: React.FC<BadgeProps> = ({
  className,
  children,
  variant = 'brand',
  size = 'md',
  dot = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300';
  
  const variants = {
    'brand': 'bg-brand-500/10 text-brand-500 border border-brand-500/30',
    'outline': 'bg-transparent text-brand-500 border border-brand-500',
    'solid': 'bg-brand-500 text-black',
    'glow': 'bg-brand-500/10 text-brand-500 border border-brand-500/30 shadow-glow-sm hover:shadow-glow-md',
    'mostpopular': 'bg-black text-brand-500 border border-brand-500/30 shadow-glow-sm hover:shadow-glow-md',
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };
  
  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
