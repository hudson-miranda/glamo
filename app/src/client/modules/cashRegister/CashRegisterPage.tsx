import { useState } from 'react';
import { DashboardLayout } from '../../layouts/DashboardLayout';
import { useQuery, listCashSessions } from 'wasp/client/operations';
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
import { Plus, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { useAuth } from 'wasp/client/auth';

export default function CashRegisterPage() {
  return (
    <DashboardLayout>
      <CashRegisterContent />
    </DashboardLayout>
  );
}

function CashRegisterContent() {
  const { data: user } = useAuth();
  const { activeSalonId } = useSalonContext();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(listCashSessions, {
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

  // Check if user has an open session
  const hasOpenSession = data?.sessions?.some(
    (session: any) => !session.closedAt && session.userId === user?.id
  );

  return (
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Cash Register</h1>
            <p className='text-muted-foreground'>
              Manage cash register sessions and movements
            </p>
          </div>
          <Button disabled={hasOpenSession}>
            <Plus className='mr-2 h-4 w-4' />
            {hasOpenSession ? 'Session Already Open' : 'Open Session'}
          </Button>
        </div>

        {/* Active Session Card */}
        {hasOpenSession && (
          <Card className='border-primary'>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <span>Active Session</span>
                <Badge variant='success'>Open</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='grid gap-4 md:grid-cols-3'>
                <div>
                  <p className='text-sm text-muted-foreground'>Opening Balance</p>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(
                      data?.sessions?.find(
                        (s: any) => !s.closedAt && s.userId === user?.id
                      )?.openingBalance || 0
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Current Balance</p>
                  <p className='text-2xl font-bold'>
                    {formatCurrency(
                      data?.sessions?.find(
                        (s: any) => !s.closedAt && s.userId === user?.id
                      )?.expectedBalance || 0
                    )}
                  </p>
                </div>
                <div className='flex items-end'>
                  <Button variant='destructive' className='w-full'>
                    Close Session
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-muted-foreground'>Loading sessions...</p>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-destructive'>
                  Error loading sessions: {error.message}
                </p>
              </div>
            ) : !data?.sessions || data.sessions.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title='No sessions found'
                description='Open your first cash register session to get started'
                action={
                  <Button>
                    <Plus className='mr-2 h-4 w-4' />
                    Open Session
                  </Button>
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Opened At</TableHead>
                      <TableHead>Closed At</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Opening</TableHead>
                      <TableHead>Expected</TableHead>
                      <TableHead>Actual</TableHead>
                      <TableHead>Difference</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.sessions.map((session: any) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {formatDate(session.openedAt)}
                        </TableCell>
                        <TableCell>
                          {session.closedAt
                            ? formatDate(session.closedAt)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {session.user?.email || '-'}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(session.openingBalance)}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(session.expectedBalance)}
                        </TableCell>
                        <TableCell>
                          {session.actualBalance !== null
                            ? formatCurrency(session.actualBalance)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {session.difference !== null
                            ? formatCurrency(session.difference)
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {!session.closedAt ? (
                            <Badge variant='success'>Open</Badge>
                          ) : session.reconciled ? (
                            <Badge variant='success'>
                              <CheckCircle className='mr-1 h-3 w-3' />
                              Reconciled
                            </Badge>
                          ) : (
                            <Badge variant='warning'>
                              <XCircle className='mr-1 h-3 w-3' />
                              Not Reconciled
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className='flex items-center justify-between border-t px-6 py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {data.sessions.length} of {data.total} sessions
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
  );
}
