import { Button } from './button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  itemLabel?: string; // Ex: "cliente", "produto"
  itemLabelPlural?: string; // Ex: "clientes", "produtos"
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIndex,
  endIndex,
  onPageChange,
  onItemsPerPageChange,
  itemLabel = 'item',
  itemLabelPlural = 'itens',
}: PaginationProps) {
  const actualEndIndex = Math.min(endIndex, totalItems);
  const itemLabelText = totalItems === 1 ? itemLabel : itemLabelPlural;

  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-4 border-t px-4 sm:px-6 py-4'>
      {/* Info e Items per page */}
      <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto'>
        {/* Mobile: info mais compacta */}
        <div className='text-sm text-muted-foreground'>
          <span className='hidden sm:inline'>
            Mostrando {startIndex + 1}-{actualEndIndex} de {totalItems} {itemLabelText}
          </span>
          <span className='sm:hidden'>
            {startIndex + 1}-{actualEndIndex} de {totalItems}
          </span>
        </div>
        
        {/* Items per page */}
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground hidden sm:inline'>Por página:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              onItemsPerPageChange(Number(value));
              onPageChange(1);
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='10'>10</SelectItem>
              <SelectItem value='25'>25</SelectItem>
              <SelectItem value='50'>50</SelectItem>
              <SelectItem value='100'>100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Navigation */}
      <div className='flex items-center gap-2'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='h-8 w-8 p-0 sm:w-auto sm:px-3'
        >
          <ChevronLeft className='h-4 w-4' />
          <span className='hidden sm:inline ml-1'>Anterior</span>
        </Button>
        
        <div className='flex items-center gap-1 px-2'>
          <span className='text-sm whitespace-nowrap'>
            <span className='hidden sm:inline'>Página </span>
            {currentPage} de {totalPages || 1}
          </span>
        </div>
        
        <Button
          variant='outline'
          size='sm'
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className='h-8 w-8 p-0 sm:w-auto sm:px-3'
        >
          <span className='hidden sm:inline mr-1'>Próxima</span>
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>
    </div>
  );
}
