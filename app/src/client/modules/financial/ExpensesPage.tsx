
import { useState } from 'react';
import { useQuery, listExpenses } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Card, CardContent } from '../../../components/ui/card';
import { Plus, AlertCircle } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';

export default function ExpensesPage() {
  const { activeSalonId } = useSalonContext();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(listExpenses, {
    salonId: activeSalonId || '',
    page,
    perPage: 20,
  }, {
    enabled: !!activeSalonId,
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Expenses</h1>
          <p className='text-muted-foreground'>
            Track your business expenses
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Expense
        </Button>
      </div>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-muted-foreground'>Loading expenses...</p>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-destructive'>
                Error loading expenses: {error.message}
              </p>
            </div>
          ) : !data?.expenses || data.expenses.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-12'>
              <AlertCircle className='h-12 w-12 text-muted-foreground mb-4' />
              <p className='text-lg font-medium'>No expenses found</p>
              <p className='text-sm text-muted-foreground'>
                Get started by recording your first expense
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.expenses.map((expense: any) => (
                    <TableRow key={expense.id}>
                      <TableCell className='font-medium'>
                        {expense.description}
                      </TableCell>
                      <TableCell>
                        {expense.category?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell>
                        {formatDate(expense.expenseDate)}
                      </TableCell>
                      <TableCell>
                        {expense.paymentMethod || '-'}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button variant='ghost' size='sm'>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className='flex items-center justify-between border-t px-6 py-4'>
                <div className='text-sm text-muted-foreground'>
                  Showing {data.expenses.length} of {data.total} expenses
                </div>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(page + 1)}
                    disabled={!data.total || page * data.perPage >= data.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
