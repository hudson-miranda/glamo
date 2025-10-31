
import React from 'react';
import { cn } from '../../cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary-glow' | 'secondary' | 'ghost' | 'outline' | 'neon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  isLoading?: boolean;
}

/**
 * Button component with neon design system variants
 * 
 * @example
 * ```tsx
 * <Button variant="primary-glow" size="lg">Get Started</Button>
 * <Button variant="outline">Learn More</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary-glow', size = 'md', children, isLoading, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-neon-500 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      'primary-glow': 'bg-neon-500 text-black hover:bg-neon-400 shadow-glow-md hover:shadow-glow-lg active:scale-95',
      'secondary': 'bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600',
      'ghost': 'bg-transparent text-foreground hover:bg-zinc-800/50 hover:text-neon-500',
      'outline': 'bg-transparent text-neon-500 border-2 border-neon-500 hover:bg-neon-500/10 hover:shadow-glow-sm',
      'neon': 'bg-transparent text-neon-500 border border-neon-500/30 hover:border-neon-500 shadow-glow-sm hover:shadow-glow-md backdrop-blur-sm',
    };
    
    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl',
    };
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-label="Loading"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
