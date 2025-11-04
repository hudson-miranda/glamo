import { useState } from 'react';
import { useQuery, listClients } from 'wasp/client/operations';
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
import { Plus, Search, Users } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Link } from 'wasp/client/router';

export default function ClientsListPage() {
  const { activeSalonId } = useSalonContext();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery(listClients, {
    salonId: activeSalonId || '',
    search,
    page,
    perPage: 20,
  }, {
    enabled: !!activeSalonId,
  });

  return (
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Clients</h1>
            <p className='text-muted-foreground'>
              Manage your salon clients
            </p>
          </div>
          <Button>
            <Plus className='mr-2 h-4 w-4' />
            New Client
          </Button>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className='text-base'>Search Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search by name, email, phone, CPF or CNPJ...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10'
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-muted-foreground'>Loading clients...</p>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-destructive'>
                  Error loading clients: {error.message}
                </p>
              </div>
            ) : !data?.clients || data.clients.length === 0 ? (
              <EmptyState
                icon={Users}
                title='No clients found'
                description={
                  search
                    ? 'Try adjusting your search filters'
                    : 'Get started by creating your first client'
                }
                action={
                  !search && (
                    <Button>
                      <Plus className='mr-2 h-4 w-4' />
                      New Client
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>CPF/CNPJ</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.clients.map((client: any) => (
                      <TableRow key={client.id}>
                        <TableCell className='font-medium'>
                          {client.name}
                        </TableCell>
                        <TableCell>{client.email || '-'}</TableCell>
                        <TableCell>{client.phone || '-'}</TableCell>
                        <TableCell>{client.cpf || client.cnpj || '-'}</TableCell>
                        <TableCell>
                          <Badge variant='success'>Active</Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Link to={`/clients/${client.id}` as any}>
                            <Button variant='ghost' size='sm'>
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className='flex items-center justify-between border-t px-6 py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Showing {data.clients.length} of {data.total} clients
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
