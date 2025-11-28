import { useState, useMemo } from 'react';
import { useQuery, listClients, createClient, updateClient, deleteClient } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { EmptyState } from '../../../components/ui/empty-state';
import { Card, CardContent } from '../../../components/ui/card';
import { Plus, Users, Download, Search, Filter, ArrowUpDown, Settings2, X, Eye, Edit, Trash2 } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { useToast } from '../../../components/ui/use-toast';
import { ClientStatsCards } from './components/ClientStatsCards';
import { ClientFormModalNew } from './components/ClientFormModalNew';
import { formatDate, formatCurrency } from '../../lib/formatters';

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
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [clientToDelete, setClientToDelete] = useState<any>(null);
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
      
      toast({
        title: editingClient ? 'Cliente atualizado!' : 'Cliente cadastrado!',
        description: `${formData.name} foi ${editingClient ? 'atualizado' : 'cadastrado'} com sucesso.`,
      });
      
      handleCloseModal();
      // Refresh the client list
      // The useQuery hook will automatically refetch
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || `Erro ao ${editingClient ? 'atualizar' : 'cadastrar'} cliente`,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewClient = (client: any) => {
    setViewingClient(client);
    setIsViewModalOpen(true);
  };

  const handleDeleteClient = (client: any) => {
    if (!activeSalonId) {
      toast({
        title: 'Erro',
        description: 'Nenhum salão ativo',
        variant: 'destructive',
      });
      return;
    }

    setClientToDelete(client);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteClient = async () => {
    if (!clientToDelete || !activeSalonId) return;

    try {
      await deleteClient({
        clientId: clientToDelete.id,
        salonId: activeSalonId,
      });

      toast({
        title: 'Cliente excluído',
        description: 'Cliente removido com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir cliente',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'INACTIVE':
        return 'secondary';
      case 'VIP':
        return 'default';
      case 'BLOCKED':
        return 'destructive';
      case 'PROSPECT':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'INACTIVE':
        return 'Inativo';
      case 'VIP':
        return 'VIP';
      case 'BLOCKED':
        return 'Bloqueado';
      case 'PROSPECT':
        return 'Prospect';
      default:
        return status;
    }
  };

  const formatGender = (gender?: string) => {
    switch (gender) {
      case 'MALE':
        return 'Masculino';
      case 'FEMALE':
        return 'Feminino';
      case 'OTHER':
        return 'Outro';
      default:
        return '-';
    }
  };

  const formatClientType = (type: string) => {
    switch (type) {
      case 'REGULAR':
        return 'Regular';
      case 'VIP':
        return 'VIP';
      case 'SPORADIC':
        return 'Esporádico';
      default:
        return type;
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
                      <TableRow key={client.id}>
                        {visibleColumns.includes('name') && (
                          <TableCell>
                            <div>
                              <div className='font-medium'>{client.name}</div>
                              {client.notes && (
                                <div className='text-sm text-muted-foreground line-clamp-1'>
                                  {client.notes}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.includes('email') && (
                          <TableCell>{client.email || '-'}</TableCell>
                        )}
                        {visibleColumns.includes('phone') && (
                          <TableCell>{client.phone || '-'}</TableCell>
                        )}
                        {visibleColumns.includes('status') && (
                          <TableCell>
                            <Badge variant={getStatusVariant(client.status)}>
                              {getStatusLabel(client.status)}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.includes('clientType') && (
                          <TableCell>{formatClientType(client.clientType)}</TableCell>
                        )}
                        {visibleColumns.includes('gender') && (
                          <TableCell>{formatGender(client.gender)}</TableCell>
                        )}
                        {visibleColumns.includes('birthDate') && (
                          <TableCell>
                            {client.birthDate ? formatDate(new Date(client.birthDate)) : '-'}
                          </TableCell>
                        )}
                        {visibleColumns.includes('visits') && (
                          <TableCell className='text-right'>{client.visits || 0}</TableCell>
                        )}
                        {visibleColumns.includes('totalSpent') && (
                          <TableCell className='text-right'>
                            {formatCurrency(client.totalSpent || 0)}
                          </TableCell>
                        )}
                        {visibleColumns.includes('lastVisit') && (
                          <TableCell>
                            {client.lastVisit ? formatDate(new Date(client.lastVisit)) : '-'}
                          </TableCell>
                        )}
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewClient(client)}
                              title='Visualizar'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleOpenModal(client)}
                              title='Editar'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteClient(client)}
                              title='Excluir'
                            >
                              <Trash2 className='h-4 w-4 text-destructive' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className='flex items-center justify-between border-t px-6 py-4'>
                <div className='flex items-center gap-4'>
                  <div className='text-sm text-muted-foreground'>
                    Mostrando {filteredAndSortedClients.length} de {data.total} clientes
                  </div>
                  <select
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                    className='h-8 rounded-md border border-input bg-background px-3 pr-8 text-sm'
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
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
      <ClientFormModalNew
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitClient}
        client={editingClient}
        isLoading={isSubmitting}
        salonId={activeSalonId || ''}
        allClients={data?.clients || []}
      />

      {/* View Client Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Visualização completa de todas as informações do cliente
            </DialogDescription>
          </DialogHeader>
          {viewingClient && (
            <div className='space-y-6'>
              {/* Informações Básicas */}
              <div>
                <h3 className='text-lg font-semibold mb-3'>Informações Básicas</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Nome</p>
                    <p className='font-medium'>{viewingClient.name}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Status</p>
                    <Badge variant={getStatusVariant(viewingClient.status)}>
                      {getStatusLabel(viewingClient.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>E-mail</p>
                    <p className='font-medium'>{viewingClient.email || '-'}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Telefone</p>
                    <p className='font-medium'>{viewingClient.phone || '-'}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Tipo de Cliente</p>
                    <p className='font-medium'>{formatClientType(viewingClient.clientType)}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Gênero</p>
                    <p className='font-medium'>{formatGender(viewingClient.gender)}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Data de Nascimento</p>
                    <p className='font-medium'>
                      {viewingClient.birthDate
                        ? formatDate(new Date(viewingClient.birthDate))
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div>
                <h3 className='text-lg font-semibold mb-3'>Estatísticas</h3>
                <div className='grid grid-cols-3 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Visitas</p>
                    <p className='font-medium text-2xl'>{viewingClient.visits || 0}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Total Gasto</p>
                    <p className='font-medium text-2xl'>
                      {formatCurrency(viewingClient.totalSpent || 0)}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Última Visita</p>
                    <p className='font-medium'>
                      {viewingClient.lastVisit
                        ? formatDate(new Date(viewingClient.lastVisit))
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              {(viewingClient.address ||
                viewingClient.city ||
                viewingClient.state ||
                viewingClient.zipCode) && (
                <div>
                  <h3 className='text-lg font-semibold mb-3'>Endereço</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='col-span-2'>
                      <p className='text-sm text-muted-foreground'>Endereço</p>
                      <p className='font-medium'>{viewingClient.address || '-'}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Cidade</p>
                      <p className='font-medium'>{viewingClient.city || '-'}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Estado</p>
                      <p className='font-medium'>{viewingClient.state || '-'}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>CEP</p>
                      <p className='font-medium'>{viewingClient.zipCode || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              {viewingClient.notes && (
                <div>
                  <h3 className='text-lg font-semibold mb-3'>Observações</h3>
                  <p className='text-sm'>{viewingClient.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{clientToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteClient}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
