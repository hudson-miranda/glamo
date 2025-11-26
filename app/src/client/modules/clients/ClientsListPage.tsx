import { useState, useMemo } from 'react';
import { useQuery, listClients, createClient, updateClient } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { EmptyState } from '../../../components/ui/empty-state';
import { Card, CardContent } from '../../../components/ui/card';
import { Plus, Users, Download, Search, Filter, ArrowUpDown, Settings2, X } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { ClientStatsCards } from './components/ClientStatsCards';
import { ClientTableRow } from './components/ClientTableRow';
import { ClientFormModal } from './components/ClientFormModal';

// Definição de colunas disponíveis
const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'Nome', enabled: true },
  { id: 'email', label: 'E-mail', enabled: true },
  { id: 'phone', label: 'Telefone', enabled: true },
  { id: 'status', label: 'Status', enabled: true },
  { id: 'clientType', label: 'Tipo', enabled: false },
  { id: 'gender', label: 'Gênero', enabled: false },
  { id: 'birthDate', label: 'Aniversário', enabled: false },
  { id: 'visits', label: 'Visitas', enabled: true },
  { id: 'totalSpent', label: 'Total Gasto', enabled: true },
  { id: 'lastVisit', label: 'Última Visita', enabled: true },
];

export default function ClientsListPage() {
  const { activeSalonId } = useSalonContext();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClientType, setFilterClientType] = useState<string>('all');
  const [filterGender, setFilterGender] = useState<string>('all');
  
  // Ordenação
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.enabled).map(col => col.id)
  );

  const { data, isLoading, error } = useQuery(
    listClients,
    {
      salonId: activeSalonId || '',
      search,
      page,
      perPage,
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterClientType('all');
    setFilterGender('all');
    setSearch('');
  };

  const hasActiveFilters = filterStatus !== 'all' || filterClientType !== 'all' || filterGender !== 'all' || search !== '';

  // Filtrar e ordenar clientes
  const filteredAndSortedClients = data?.clients
    ? data.clients
        .filter((client: any) => {
          // Filtro por status
          if (filterStatus !== 'all' && client.status !== filterStatus) {
            return false;
          }
          // Filtro por tipo de cliente
          if (filterClientType !== 'all' && client.clientType !== filterClientType) {
            return false;
          }
          // Filtro por gênero
          if (filterGender !== 'all' && client.gender !== filterGender) {
            return false;
          }
          return true;
        })
        .sort((a: any, b: any) => {
          let aValue, bValue;
          switch (sortBy) {
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            case 'email':
              aValue = (a.email || '').toLowerCase();
              bValue = (b.email || '').toLowerCase();
              break;
            case 'visits':
              aValue = a._count?.appointments || 0;
              bValue = b._count?.appointments || 0;
              break;
            case 'totalSpent':
              aValue = a.totalSpent || 0;
              bValue = b.totalSpent || 0;
              break;
            case 'lastVisit':
              aValue = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
              bValue = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
              break;
            default:
              return 0;
          }
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        })
    : [];

  // Calculate stats from filtered data
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

  const hasClients = filteredAndSortedClients.length > 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Clientes</h1>
          <p className='text-muted-foreground'>
            Gerencie e acompanhe os clientes do seu salão
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' onClick={handleExport}>
            <Download className='mr-2 h-4 w-4' />
            Exportar
          </Button>
          <Button onClick={() => handleOpenModal()}>
            <Plus className='mr-2 h-4 w-4' />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <ClientStatsCards stats={stats} isLoading={isLoading} />

      {/* Search, Filters and Actions */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4'>
            {/* Busca */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar por nome, e-mail ou telefone...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10'
              />
            </div>

            {/* Barra de Ações */}
            <div className='flex items-center gap-2 flex-wrap'>
              {/* Filtros */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='gap-2'>
                    <Filter className='h-4 w-4' />
                    Filtros
                    {hasActiveFilters && (
                      <Badge variant='secondary' className='ml-1 px-1.5 py-0.5 text-xs'>
                        {[filterStatus !== 'all', filterClientType !== 'all', filterGender !== 'all'].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-56'>
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className='p-2 space-y-2'>
                    <div>
                      <Label className='text-xs text-muted-foreground mb-1.5 block'>Status</Label>
                      <select
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value='all'>Todos</option>
                        <option value='ACTIVE'>Ativos</option>
                        <option value='INACTIVE'>Inativos</option>
                        <option value='VIP'>VIP</option>
                      </select>
                    </div>

                    <div>
                      <Label className='text-xs text-muted-foreground mb-1.5 block'>Tipo de Cliente</Label>
                      <select
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={filterClientType}
                        onChange={(e) => setFilterClientType(e.target.value)}
                      >
                        <option value='all'>Todos</option>
                        <option value='REGULAR'>Regular</option>
                        <option value='VIP'>VIP</option>
                        <option value='SPORADIC'>Esporádico</option>
                      </select>
                    </div>

                    <div>
                      <Label className='text-xs text-muted-foreground mb-1.5 block'>Gênero</Label>
                      <select
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={filterGender}
                        onChange={(e) => setFilterGender(e.target.value)}
                      >
                        <option value='all'>Todos</option>
                        <option value='MALE'>Masculino</option>
                        <option value='FEMALE'>Feminino</option>
                        <option value='OTHER'>Outro</option>
                      </select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Ordenação */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='gap-2'>
                    <ArrowUpDown className='h-4 w-4' />
                    Ordenar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start'>
                  <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>
                    Nome (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('desc'); }}>
                    Nome (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('visits'); setSortOrder('desc'); }}>
                    Mais Visitas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('visits'); setSortOrder('asc'); }}>
                    Menos Visitas
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('totalSpent'); setSortOrder('desc'); }}>
                    Maior Gasto
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('totalSpent'); setSortOrder('asc'); }}>
                    Menor Gasto
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('lastVisit'); setSortOrder('desc'); }}>
                    Última Visita (Recente)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('lastVisit'); setSortOrder('asc'); }}>
                    Última Visita (Antiga)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Customizar Colunas */}
              <Button 
                variant='outline' 
                size='sm' 
                className='gap-2'
                onClick={() => setIsColumnsModalOpen(true)}
              >
                <Settings2 className='h-4 w-4' />
                Colunas
              </Button>

              {/* Limpar Filtros */}
              {hasActiveFilters && (
                <Button 
                  variant='ghost' 
                  size='sm' 
                  className='gap-2'
                  onClick={handleClearFilters}
                >
                  <X className='h-4 w-4' />
                  Limpar filtros
                </Button>
              )}

              <div className='ml-auto text-sm text-muted-foreground'>
                {filteredAndSortedClients.length} {filteredAndSortedClients.length === 1 ? 'cliente' : 'clientes'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <div className='flex flex-col items-center gap-2'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                <p className='text-sm text-muted-foreground'>Carregando clientes...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-destructive'>
                Erro ao carregar clientes: {error.message}
              </p>
            </div>
          ) : !hasClients ? (
            <EmptyState
              icon={Users}
              title='Nenhum cliente encontrado'
              description={
                hasActiveFilters
                  ? 'Tente ajustar seus filtros de busca'
                  : 'Comece criando seu primeiro cliente'
              }
              action={
                !hasActiveFilters && (
                  <Button onClick={() => handleOpenModal()}>
                    <Plus className='mr-2 h-4 w-4' />
                    Novo Cliente
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
                      {visibleColumns.includes('name') && <TableHead>Cliente</TableHead>}
                      {visibleColumns.includes('email') && <TableHead>E-mail</TableHead>}
                      {visibleColumns.includes('phone') && <TableHead>Telefone</TableHead>}
                      {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                      {visibleColumns.includes('clientType') && <TableHead>Tipo</TableHead>}
                      {visibleColumns.includes('gender') && <TableHead>Gênero</TableHead>}
                      {visibleColumns.includes('birthDate') && <TableHead>Aniversário</TableHead>}
                      {visibleColumns.includes('visits') && <TableHead className='text-right'>Visitas</TableHead>}
                      {visibleColumns.includes('totalSpent') && <TableHead className='text-right'>Total Gasto</TableHead>}
                      {visibleColumns.includes('lastVisit') && <TableHead>Última Visita</TableHead>}
                      <TableHead className='text-right'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedClients.map((client: any) => (
                      <ClientTableRow
                        key={client.id}
                        client={client}
                        visibleColumns={visibleColumns}
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
                  Mostrando {(page - 1) * perPage + 1} a{' '}
                  {Math.min(page * perPage, data.total)} de {data.total} clientes
                </div>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <div className='flex items-center gap-1 px-2'>
                    <span className='text-sm'>
                      Página {page} de {Math.ceil(data.total / perPage)}
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setPage(page + 1)}
                    disabled={page * perPage >= data.total}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Columns Customization Modal */}
      <Dialog open={isColumnsModalOpen} onOpenChange={setIsColumnsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personalizar Colunas</DialogTitle>
            <DialogDescription>
              Selecione quais colunas você deseja visualizar na tabela
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {AVAILABLE_COLUMNS.map((column) => (
              <div key={column.id} className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onChange={() => handleToggleColumn(column.id)}
                  className='h-4 w-4 rounded border-gray-300'
                />
                <Label htmlFor={column.id} className='text-sm font-normal cursor-pointer'>
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setIsColumnsModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
