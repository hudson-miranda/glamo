import { useState } from 'react';
import { useQuery, listAppointments } from 'wasp/client/operations';
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
import { EmptyState } from '../../../components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, Search, Calendar as CalendarIcon } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';

const statusColors: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'info'> = {
  PENDING: 'warning',
  CONFIRMED: 'info',
  IN_SERVICE: 'default',
  DONE: 'success',
  CANCELLED: 'secondary',
};

export default function AppointmentsListPage() {
  const { activeSalonId } = useSalonContext();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"CANCELLED" | "PENDING" | "CONFIRMED" | "IN_SERVICE" | "DONE" | undefined>(undefined);

  const { data, isLoading, error } = useQuery(listAppointments, {
    salonId: activeSalonId || '',
    status: statusFilter,
    page,
    perPage: 20,
  }, {
    enabled: !!activeSalonId,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Appointments</h1>
            <p className='text-muted-foreground'>
              Manage salon appointments and schedules
            </p>
          </div>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Appointment
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Filters</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center space-x-4'>
              <Button
                variant={statusFilter === undefined ? 'default' : 'outline'}
                size='sm'
                onClick={() => setStatusFilter(undefined)}
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
                variant={statusFilter === 'CONFIRMED' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setStatusFilter('CONFIRMED')}
              >
                Confirmed
              </Button>
              <Button
                variant={statusFilter === 'IN_SERVICE' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setStatusFilter('IN_SERVICE')}
              >
                In Service
              </Button>
              <Button
                variant={statusFilter === 'DONE' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setStatusFilter('DONE')}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-muted-foreground'>Loading appointments...</p>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-destructive'>
                  Error loading appointments: {error.message}
                </p>
              </div>
            ) : !data?.appointments || data.appointments.length === 0 ? (
              <EmptyState
                icon={CalendarIcon}
                title='No appointments found'
                description={
                  statusFilter
                    ? 'No appointments with this status'
                    : 'Get started by creating your first appointment'
                }
                action={
                  !statusFilter && (
                    <Button>
                      <Plus className='mr-2 h-4 w-4' />
                      New Appointment
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Professional</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.appointments.map((appointment: any) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {formatDate(appointment.scheduledDate)}
                        </TableCell>
                        <TableCell>
                          {formatTime(appointment.scheduledDate)}
                        </TableCell>
                        <TableCell className='font-medium'>
                          {appointment.client?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {appointment.professional?.email || '-'}
                        </TableCell>
                        <TableCell>
                          <div className='max-w-[200px] truncate'>
                            {appointment.services
                              ?.map((s: any) => s.service?.name)
                              .join(', ') || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusColors[appointment.status] || 'default'}>
                            {appointment.status}
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
                    Showing {data.appointments.length} of {data.total} appointments
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
