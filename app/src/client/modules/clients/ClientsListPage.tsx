import { useState, useMemo } from 'react';
import { useQuery, listClients, createClient, updateClient } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { EmptyState } from '../../../components/ui/empty-state';
import { Card, CardContent } from '../../../components/ui/card';
import { Plus, Users, Download } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { ClientFilters } from './components/ClientFilters';
import { ClientStatsCards } from './components/ClientStatsCards';
import { ClientTableRow } from './components/ClientTableRow';
import { ClientFormModal } from './components/ClientFormModal';

type FilterState = {
  search: string;
  status?: string;
  clientType?: string;
  tags: string[];
};

export default function ClientsListPage() {
  const { activeSalonId } = useSalonContext();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: undefined,
    clientType: undefined,
    tags: [],
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data, isLoading, error } = useQuery(
    listClients,
    {
      salonId: activeSalonId || '',
      search: filters.search,
      status: filters.status,
      clientType: filters.clientType,
      tags: filters.tags,
      page,
      perPage,
    },
    {
      enabled: !!activeSalonId,
    }
  );

  // Calculate stats from data
  const stats = useMemo(() => {
    if (!data?.clients) {
      return { total: 0, active: 0, inactive: 0, vip: 0 };
    }

    return {
      total: data.total || 0,
      active: data.clients.filter((c: any) => c.status === 'ACTIVE').length,
      inactive: data.clients.filter((c: any) => c.status === 'INACTIVE').length,
      vip: data.clients.filter((c: any) => c.status === 'VIP' || c.clientType === 'VIP').length,
    };
  }, [data]);

  const handleExport = () => {
    // TODO: Implement export to CSV
    console.log('Export clients to CSV');
  };

  const handleOpenModal = (client?: any) => {
    setEditingClient(client || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const handleSubmitClient = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingClient) {
        // Update existing client
        await updateClient({
          clientId: editingClient.id,
          salonId: activeSalonId!,
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          birthDate: formData.birthDate || undefined,
          gender: formData.gender,
          status: formData.status,
          clientType: formData.clientType,
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          observations: formData.notes || undefined,
          // Tags will be handled separately if needed
        });
      } else {
        // Create new client
        await createClient({
          salonId: activeSalonId!,
          name: formData.name,
          email: formData.email || undefined,
          phone: formData.phone,
          birthDate: formData.birthDate || undefined,
          gender: formData.gender,
          status: formData.status || 'ACTIVE',
          clientType: formData.clientType || 'REGULAR',
          address: formData.address || undefined,
          city: formData.city || undefined,
          state: formData.state || undefined,
          zipCode: formData.zipCode || undefined,
          observations: formData.notes || undefined,
        });
      }
      // Refresh the client list
      // The useQuery hook will automatically refetch
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasClients = data && data.clients && data.clients.length > 0;
  const hasFilters = filters.search || filters.status || filters.clientType || filters.tags.length > 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Clients</h1>
          <p className='text-muted-foreground'>
            Manage and track your salon clients
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={handleExport}>
            <Download className='mr-2 h-4 w-4' />
            Export
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className='mr-2 h-4 w-4' />
            New Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ClientStatsCards stats={stats} isLoading={isLoading} />

      {/* Filters */}
      <ClientFilters
        filters={filters}
        onFiltersChange={setFilters}
        showAdvanced={showAdvancedFilters}
        onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {/* Clients Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <div className='flex flex-col items-center gap-2'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                <p className='text-sm text-muted-foreground'>Loading clients...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-destructive'>
                Error loading clients: {error.message}
              </p>
            </div>
          ) : !hasClients ? (
            <EmptyState
              icon={Users}
              title='No clients found'
              description={
                hasFilters
                  ? 'Try adjusting your search filters'
                  : 'Get started by creating your first client'
              }
              action={
                !hasFilters && (
                  <Button onClick={() => handleOpenModal()}>
                    <Plus className='mr-2 h-4 w-4' />
                    New Client
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className='text-right'>Visits</TableHead>
                      <TableHead className='text-right'>Total Spent</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead className='text-right'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.clients.map((client: any) => (
                      <ClientTableRow
                        key={client.id}
                        client={client}
                        onEdit={(client) => handleOpenModal(client)}
                        onDelete={(client) => console.log('Delete client:', client)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='flex items-center justify-between border-t px-6 py-4'>
                <div className='text-sm text-muted-foreground'>
                  Showing {(page - 1) * perPage + 1} to{' '}
                  {Math.min(page * perPage, data.total)} of {data.total} clients
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
                  <div className='flex items-center gap-1 px-2'>
                    <span className='text-sm'>
                      Page {page} of {Math.ceil(data.total / perPage)}
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(page + 1)}
                    disabled={page * perPage >= data.total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Client Form Modal */}
      <ClientFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitClient}
        client={editingClient}
        isLoading={isSubmitting}
      />
    </div>
  );
}
