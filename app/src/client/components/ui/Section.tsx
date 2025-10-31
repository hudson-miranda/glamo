
import React from 'react';
import { cn } from '../../cn';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  container?: boolean;
  background?: 'transparent' | 'dark' | 'darker';
  glowEffect?: boolean;
}

/**
 * Section wrapper component for landing page sections
 * 
 * @example
 * ```tsx
 * <Section background="darker" glowEffect>
 *   <h2>Section Title</h2>
 *   <p>Section content</p>
 * </Section>
 * ```
 */
export const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, children, container = true, background = 'transparent', glowEffect = false, ...props }, ref) => {
    const backgrounds = {
      transparent: 'bg-transparent',
      dark: 'bg-zinc-950',
      darker: 'bg-black',
    };
    
    return (
      <section
        ref={ref}
        className={cn(
          'relative py-20 lg:py-28',
          backgrounds[background],
          className
        )}
        {...props}
      >
        {glowEffect && (
          <div className="absolute inset-0 bg-gradient-radial-neon opacity-30 pointer-events-none" />
        )}
        {container ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {children}
          </div>
        ) : (
          <div className="relative z-10">{children}</div>
        )}
      </section>
    );
  }
);

Section.displayName = 'Section';
