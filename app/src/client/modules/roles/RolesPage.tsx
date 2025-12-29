import { useState, useMemo, useEffect } from 'react';
import { useQuery, getRoles, deleteRole } from 'wasp/client/operations';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
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
import { Card, CardContent } from '../../../components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Plus, Search, Edit, Trash2, Shield, ArrowUpDown, Settings2, X, Eye, Filter } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { Pagination } from '../../../components/ui/pagination';
import { RoleFormModal } from '../../components/RoleFormModal';
import { useToast } from '../../../components/ui/use-toast';
import { RoleStatsCards } from './components/RoleStatsCards';

// Definição de colunas disponíveis
const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'Nome', enabled: true },
  { id: 'description', label: 'Descrição', enabled: true },
  { id: 'type', label: 'Tipo', enabled: true },
  { id: 'permissions', label: 'Permissões Ativas', enabled: true },
];

export default function RolesPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [viewingRole, setViewingRole] = useState<any>(null);
  const [roleToDelete, setRoleToDelete] = useState<any>(null);
  
  // Filtros
  const [filterType, setFilterType] = useState<string>('all');
  
  // Ordenação
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.enabled).map(col => col.id)
  );

  const { data: roles, isLoading, error, refetch } = useQuery(
    getRoles,
    {
      salonId: activeSalonId || '',
    },
    {
      enabled: !!activeSalonId,
    }
  );

  // Detectar query parameter ?action=new e abrir modal
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('action') === 'new') {
      setIsModalOpen(true);
      setSelectedRole(null);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setSearch('');
  };

  const hasActiveFilters = filterType !== 'all' || search !== '';

  const handleOpenModal = (role: any = null) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRole(null);
    setIsModalOpen(false);
  };

  const handleSuccess = () => {
    refetch();
    handleCloseModal();
  };

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [search, filterType, sortBy, sortOrder]);

  const handleViewRole = (role: any) => {
    setViewingRole(role);
    setIsViewModalOpen(true);
  };

  const handleOpenDeleteDialog = (role: any) => {
    setRoleToDelete(role);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setRoleToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    try {
      await deleteRole({ id: roleToDelete.id });

      toast({
        title: 'Cargo excluído',
        description: 'O cargo foi excluído com sucesso',
      });

      await refetch();
      handleCloseDeleteDialog();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o cargo',
      });
    }
  };

  // Contadores de permissões
  const countActivePermissions = (role: any): number => {
    if (role.isOwner) return -1; // -1 indica "todas"
    
    let count = 0;
    const permissionKeys = Object.keys(role).filter(key => 
      key.endsWith('Access') || 
      key.endsWith('Create') || 
      key.endsWith('Edit') || 
      key.endsWith('Delete') ||
      key.endsWith('ViewAll') ||
      key.endsWith('All')
    );
    
    permissionKeys.forEach(key => {
      if (role[key] === true) count++;
    });
    
    return count;
  };

  const allFilteredRoles = useMemo(() => {
    if (!roles) return [];

    let filtered = [...roles];

    // Filtro de busca
    if (search) {
      filtered = filtered.filter(
        (role) =>
          role.name.toLowerCase().includes(search.toLowerCase()) ||
          (role.description && role.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filtro por tipo
    if (filterType === 'admin') {
      filtered = filtered.filter(role => role.isOwner);
    } else if (filterType === 'standard') {
      filtered = filtered.filter(role => !role.isOwner);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof typeof a];
      let bValue = b[sortBy as keyof typeof b];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      // Verificar valores null/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [roles, search, filterType, sortBy, sortOrder]);

  // Cálculos de paginação
  const totalPages = Math.ceil((allFilteredRoles?.length || 0) / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const filteredAndSortedRoles = allFilteredRoles.slice(startIndex, endIndex);

  // Calculate stats from data
  const stats = useMemo(() => {
    if (!roles) {
      return { total: 0, admin: 0, standard: 0, employeesWithRoles: 0 };
    }

    return {
      total: roles.length,
      admin: roles.filter((r: any) => r.isOwner).length,
      standard: roles.filter((r: any) => !r.isOwner).length,
      employeesWithRoles: roles.reduce((sum: number, r: any) => sum + (r._count?.employees || 0), 0),
    };
  }, [roles]);

  const hasRoles = filteredAndSortedRoles.length > 0;

  if (error) {
    return (
      <div className="p-8">
        <EmptyState
          icon={Shield}
          title="Erro ao carregar cargos"
          description="Não foi possível carregar os cargos"
        />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Cargos e Permissões</h1>
          <p className='text-muted-foreground'>
            Gerencie os cargos e suas permissões de acesso
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className='mr-2 h-4 w-4' />
          Novo Cargo
        </Button>
      </div>

      {/* Stats Cards */}
      <RoleStatsCards stats={stats} isLoading={isLoading} />

      {/* Search, Filters and Actions */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4'>
            {/* Busca */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar por nome ou descrição...'
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
                        {[filterType !== 'all'].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-56'>
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className='p-2 space-y-2'>
                    <div>
                      <Label className='text-xs text-muted-foreground mb-1.5 block'>Tipo</Label>
                      <select
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                      >
                        <option value='all'>Todos os Tipos</option>
                        <option value='admin'>Administrador</option>
                        <option value='standard'>Padrão</option>
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
                {filteredAndSortedRoles.length} {filteredAndSortedRoles.length === 1 ? 'cargo' : 'cargos'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Roles Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <div className='flex flex-col items-center gap-2'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                <p className='text-sm text-muted-foreground'>Carregando cargos...</p>
              </div>
            </div>
          ) : !hasRoles ? (
            <div className='p-8'>
              <EmptyState
                icon={Shield}
                title={search || hasActiveFilters ? 'Nenhum cargo encontrado' : 'Nenhum cargo cadastrado'}
                description={
                  search || hasActiveFilters
                    ? 'Tente ajustar sua busca ou filtros'
                    : 'Comece criando o primeiro cargo do seu salão'
                }
                action={
                  !(search || hasActiveFilters) && (
                    <Button onClick={() => handleOpenModal()}>
                      <Plus className='mr-2 h-4 w-4' />
                      Criar Primeiro Cargo
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.includes('name') && <TableHead>Nome</TableHead>}
                      {visibleColumns.includes('description') && <TableHead>Descrição</TableHead>}
                      {visibleColumns.includes('type') && <TableHead className='text-center'>Tipo</TableHead>}
                      {visibleColumns.includes('permissions') && <TableHead className='text-center'>Permissões Ativas</TableHead>}
                      <TableHead className='text-right'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedRoles.map((role) => {
                      const permissionCount = countActivePermissions(role);
                      
                      return (
                        <TableRow key={role.id} className='h-16'>
                          {visibleColumns.includes('name') && (
                            <TableCell className='py-3 sm:py-2'>
                              <div className='flex items-center gap-2 font-medium max-w-[200px]'>
                                {role.isOwner && (
                                  <Shield className='h-4 w-4 text-primary flex-shrink-0' />
                                )}
                                <span className='truncate'>{role.name}</span>
                              </div>
                            </TableCell>
                          )}
                          {visibleColumns.includes('description') && (
                            <TableCell className='py-3 sm:py-2'>
                              <p className='text-sm text-muted-foreground max-w-md truncate'>
                                {role.description || '—'}
                              </p>
                            </TableCell>
                          )}
                          {visibleColumns.includes('type') && (
                            <TableCell className='text-center'>
                              {role.isOwner ? (
                                <Badge variant='default' className='bg-primary'>
                                  Administrador
                                </Badge>
                              ) : (
                                <Badge variant='secondary'>
                                  Padrão
                                </Badge>
                              )}
                            </TableCell>
                          )}
                          {visibleColumns.includes('permissions') && (
                            <TableCell className='text-center'>
                              {permissionCount === -1 ? (
                                <Badge variant='default'>Todas</Badge>
                              ) : (
                                <Badge variant='outline'>{permissionCount}</Badge>
                              )}
                            </TableCell>
                          )}
                          <TableCell className='text-right py-3 sm:py-2'>
                            <div className='flex items-center justify-end gap-3 sm:gap-1'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleViewRole(role)}
                                title='Visualizar'
                                className='h-10 w-10 p-0 sm:h-9 sm:w-9'
                              >
                                <Eye className='h-5 w-5 sm:h-4 sm:w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleOpenModal(role)}
                                title='Editar'
                                className='h-10 w-10 p-0 sm:h-9 sm:w-9'
                              >
                                <Edit className='h-5 w-5 sm:h-4 sm:w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleOpenDeleteDialog(role)}
                                title='Excluir'
                                className='h-10 w-10 p-0 sm:h-9 sm:w-9'
                              >
                                <Trash2 className='h-5 w-5 sm:h-4 sm:w-4 text-destructive' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={allFilteredRoles.length}
                itemsPerPage={perPage}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setPage}
                onItemsPerPageChange={setPerPage}
                itemLabel="cargo"
                itemLabelPlural="cargos"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* View Role Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Detalhes do Cargo</DialogTitle>
            <DialogDescription>
              Informações completas do cargo e suas permissões
            </DialogDescription>
          </DialogHeader>
          {viewingRole && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium'>Nome</Label>
                  <p className='text-sm text-muted-foreground'>{viewingRole.name}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Tipo</Label>
                  {viewingRole.isOwner ? (
                    <Badge variant='default' className='bg-primary'>Administrador</Badge>
                  ) : (
                    <Badge variant='secondary'>Padrão</Badge>
                  )}
                </div>
                <div className='col-span-2'>
                  <Label className='text-sm font-medium'>Descrição</Label>
                  <p className='text-sm text-muted-foreground'>{viewingRole.description || '—'}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Permissões Ativas</Label>
                  <p className='text-sm text-muted-foreground'>
                    {viewingRole.isOwner ? 'Todas as permissões' : `${countActivePermissions(viewingRole)} permissões`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Columns Dialog */}
      <Dialog open={isColumnsModalOpen} onOpenChange={setIsColumnsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Personalizar Colunas</DialogTitle>
            <DialogDescription>
              Selecione as colunas que deseja visualizar na tabela
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-2'>
            {AVAILABLE_COLUMNS.map((column) => (
              <div key={column.id} className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onChange={() => handleToggleColumn(column.id)}
                  className='rounded border-gray-300'
                />
                <Label htmlFor={column.id} className='cursor-pointer'>
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cargo <strong>{roleToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRole}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modals */}
      <RoleFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        salonId={activeSalonId || ''}
        role={selectedRole}
      />
    </div>
  );
}
