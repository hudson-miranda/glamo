
import { useState } from 'react';
import { useQuery, listAccountsReceivable, receiveAccount, createAccountReceivable } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, Search, Check, AlertCircle } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { toast } from 'react-hot-toast';

export default function AccountsReceivablePage() {
  const { activeSalonId } = useSalonContext();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED' | ''>('');

  const { data, isLoading, error, refetch } = useQuery(listAccountsReceivable, {
    salonId: activeSalonId || '',
    status: statusFilter || undefined,
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

  const handleReceive = async (accountId: string) => {
    try {
      await receiveAccount({
        accountId,
        salonId: activeSalonId || '',
      });
      toast.success('Account received successfully');
      refetch();
    } catch (error: any) {
      toast.error(error.message || 'Failed to receive account');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      PENDING: { variant: 'secondary', label: 'Pending' },
      PAID: { variant: 'success', label: 'Paid' },
      OVERDUE: { variant: 'destructive', label: 'Overdue' },
      PARTIALLY_PAID: { variant: 'warning', label: 'Partially Paid' },
      CANCELLED: { variant: 'outline', label: 'Cancelled' },
    };

    const config = variants[status] || variants.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Accounts Receivable</h1>
          <p className='text-muted-foreground'>
            Manage money to be received
          </p>
        </div>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          New Account
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='text-base'>Filters</CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex items-center space-x-2'>
            <Button
              variant={statusFilter === '' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('')}
            >
              All
            </Button>
            <Button
              variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('PENDING')}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === 'OVERDUE' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('OVERDUE')}
            >
              Overdue
            </Button>
            <Button
              variant={statusFilter === 'PAID' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setStatusFilter('PAID')}
            >
              Paid
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-muted-foreground'>Loading accounts...</p>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-destructive'>
                Error loading accounts: {error.message}
              </p>
            </div>
          ) : !data?.accounts || data.accounts.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-12'>
              <AlertCircle className='h-12 w-12 text-muted-foreground mb-4' />
              <p className='text-lg font-medium'>No accounts found</p>
              <p className='text-sm text-muted-foreground'>
                {statusFilter ? 'Try adjusting your filters' : 'Get started by creating a new account'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className='text-right'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.accounts.map((account: any) => (
                    <TableRow key={account.id}>
                      <TableCell className='font-medium'>
                        {account.description}
                      </TableCell>
                      <TableCell>
                        {account.client?.name || '-'}
                      </TableCell>
                      <TableCell>
                        {formatCurrency(account.amount)}
                      </TableCell>
                      <TableCell>
                        {formatDate(account.dueDate)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(account.status)}
                      </TableCell>
                      <TableCell className='text-right'>
                        {account.status === 'PENDING' || account.status === 'OVERDUE' ? (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleReceive(account.id)}
                          >
                            <Check className='mr-2 h-4 w-4' />
                            Receive
                          </Button>
                        ) : (
                          <Button variant='ghost' size='sm'>
                            View
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className='flex items-center justify-between border-t px-6 py-4'>
                <div className='text-sm text-muted-foreground'>
                  Showing {data.accounts.length} of {data.total} accounts
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
