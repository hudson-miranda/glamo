
import React from 'react';
import { cn } from '../../cn';

export interface GradientTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'neon' | 'neon-diagonal' | 'primary' | 'primary-diagonal';
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p';
  animated?: boolean;
}

/**
 * Gradient text component with multiple variants
 * 
 * @example
 * ```tsx
 * <GradientText variant="neon" as="h1" className="text-5xl font-bold">
 *   Amazing Title
 * </GradientText>
 * ```
 */
export const GradientText: React.FC<GradientTextProps> = ({
  className,
  children,
  variant = 'neon',
  as: Component = 'span',
  animated = false,
  ...props
}) => {
  const variants = {
    'neon': 'text-gradient-neon',
    'neon-diagonal': 'text-gradient-neon-diagonal',
    'primary': 'text-gradient-primary',
    'primary-diagonal': 'text-gradient-primary-diagonal',
  };
  
  return (
    <Component
      className={cn(
        variants[variant],
        animated && 'animate-glow-pulse',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

GradientText.displayName = 'GradientText';
