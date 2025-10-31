
import React from 'react';
import { cn } from '../../cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'neon' | 'outline' | 'solid' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
}

/**
 * Badge component with neon styling
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
  variant = 'neon',
  size = 'md',
  dot = false,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-300';
  
  const variants = {
    'neon': 'bg-neon-500/10 text-neon-500 border border-neon-500/30',
    'outline': 'bg-transparent text-neon-500 border border-neon-500',
    'solid': 'bg-neon-500 text-black',
    'glow': 'bg-neon-500/10 text-neon-500 border border-neon-500/30 shadow-glow-sm hover:shadow-glow-md',
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
        <span className="w-1.5 h-1.5 rounded-full bg-neon-500 animate-pulse" />
      )}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';
