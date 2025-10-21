import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useQuery, listSales } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, DollarSign } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning'> = {
  OPEN: 'warning',
  CLOSED: 'success',
  CANCELLED: 'secondary',
};

export default function SalesListPage() {
  const { activeSalonId } = useSalonContext();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(listSales, {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <DashboardLayout>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Sales</h1>
            <p className='text-muted-foreground'>
              Manage sales transactions and payments
            </p>
          </div>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Sale
          </Button>
        </div>

        {/* Sales Table */}
        <Card>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-muted-foreground'>Loading sales...</p>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-destructive'>
                  Error loading sales: {error.message}
                </p>
              </div>
            ) : !data?.sales || data.sales.length === 0 ? (
              <EmptyState
                icon={DollarSign}
                title='No sales found'
                description='Get started by creating your first sale'
                action={
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    New Sale
                  </Button>
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Employee</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Final Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.sales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell className='font-mono text-sm'>
                          #{sale.id.substring(0, 8)}
                        </TableCell>
                        <TableCell>
                          {formatDate(sale.createdAt)}
                        </TableCell>
                        <TableCell>
                          {sale.client?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {sale.employee?.email || '-'}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(sale.totalAmount)}
                        </TableCell>
                        <TableCell>
                          {sale.discountAmount > 0
                            ? formatCurrency(sale.discountAmount)
                            : '-'}
                        </TableCell>
                        <TableCell className='font-semibold'>
                          {formatCurrency(sale.finalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[sale.status] || 'default'}>
                            {sale.status}
                          </Badge>
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

                {/* Pagination */}
                <div className='flex items-center justify-between border-t px-6 py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {data.sales.length} of {data.total} sales
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
                      disabled={
                        !data.total || page * data.perPage >= data.total
                      }
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
    </DashboardLayout>
  );
}
