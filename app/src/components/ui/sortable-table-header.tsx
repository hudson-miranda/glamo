import { TableHead } from './table';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SortableTableHeaderProps {
  children: React.ReactNode;
  sortKey: string;
  currentSort: string;
  currentOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SortableTableHeader({
  children,
  sortKey,
  currentSort,
  currentOrder,
  onSort,
  align = 'left',
  className,
}: SortableTableHeaderProps) {
  const isActive = currentSort === sortKey;
  
  return (
    <TableHead 
      className={cn(
        'cursor-pointer select-none transition-colors hover:bg-muted/50',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
      onClick={() => onSort(sortKey)}
    >
      <div className={cn(
        'flex items-center gap-2',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end'
      )}>
        <span className='font-semibold'>{children}</span>
        <div className='flex-shrink-0'>
          {!isActive && <ArrowUpDown className='h-4 w-4 text-muted-foreground/40' />}
          {isActive && currentOrder === 'asc' && (
            <ArrowUp className='h-4 w-4 text-primary' />
          )}
          {isActive && currentOrder === 'desc' && (
            <ArrowDown className='h-4 w-4 text-primary' />
          )}
        </div>
      </div>
    </TableHead>
  );
}
