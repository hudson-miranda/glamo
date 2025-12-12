import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ResponsivePageWrapperProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Wrapper component for pages that ensures proper mobile responsiveness
 * Handles spacing, layout, and typography scaling across devices
 */
export function ResponsivePageWrapper({
  children,
  className,
  title,
  description,
  actions,
}: ResponsivePageWrapperProps) {
  return (
    <div className={cn('w-full max-w-full overflow-x-hidden', className)}>
      {/* Page Header */}
      {(title || actions) && (
        <div className='mb-4 sm:mb-6'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4'>
            {/* Title and Description */}
            {title && (
              <div className='flex-1 min-w-0'>
                <h1 className='text-xl font-bold tracking-tight sm:text-2xl md:text-3xl truncate'>
                  {title}
                </h1>
                {description && (
                  <p className='mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2'>
                    {description}
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            {actions && (
              <div className='flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3'>
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className='space-y-4 sm:space-y-6'>
        {children}
      </div>
    </div>
  );
}

/**
 * Responsive grid wrapper that adapts columns based on screen size
 */
export function ResponsiveGrid({
  children,
  className,
  cols = {
    sm: 1,
    md: 2,
    lg: 3,
    xl: 4,
  },
}: {
  children: ReactNode;
  className?: string;
  cols?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}) {
  const gridClasses = cn(
    'grid gap-3 sm:gap-4 md:gap-6',
    `grid-cols-${cols.sm || 1}`,
    `md:grid-cols-${cols.md || 2}`,
    `lg:grid-cols-${cols.lg || 3}`,
    `xl:grid-cols-${cols.xl || 4}`,
    className
  );

  return <div className={gridClasses}>{children}</div>;
}

/**
 * Responsive flex wrapper that stacks on mobile
 */
export function ResponsiveFlex({
  children,
  className,
  gap = 'md',
}: {
  children: ReactNode;
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-3 sm:gap-4',
    lg: 'gap-4 sm:gap-6',
  };

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center',
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * Responsive section with proper padding and spacing
 */
export function ResponsiveSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('space-y-4 sm:space-y-6', className)}>
      {children}
    </section>
  );
}
