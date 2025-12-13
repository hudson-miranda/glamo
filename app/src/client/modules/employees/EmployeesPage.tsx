import { useState, useMemo, useEffect } from 'react';
import { useQuery, listEmployees, deleteEmployee } from 'wasp/client/operations';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';
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
import { Plus, Users, Search, Filter, ArrowUpDown, Settings2, X, Eye, Edit, Trash2 } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { useToast } from '../../../components/ui/use-toast';
import { EmployeeStatsCards } from './components/EmployeeStatsCards';
import { EmployeeFormModal } from './components/EmployeeFormModal';
import { Pagination } from '../../../components/ui/pagination';

// Definição de colunas disponíveis
const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'Nome', enabled: true },
  { id: 'email', label: 'E-mail', enabled: true },
  { id: 'phone', label: 'Telefone', enabled: true },
  { id: 'position', label: 'Cargo', enabled: true },
  { id: 'status', label: 'Status', enabled: true },
  { id: 'onlineBooking', label: 'Agendamento Online', enabled: false },
];

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterOnlineBooking, setFilterOnlineBooking] = useState<string>('all');
  
  // Ordenação
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Paginação
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  
  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.enabled).map(col => col.id)
  );

  const { data, isLoading, error } = useQuery(
    listEmployees,
    undefined,
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
    setFilterPosition('all');
    setFilterOnlineBooking('all');
    setSearch('');
  };

  const hasActiveFilters = filterStatus !== 'all' || filterPosition !== 'all' || filterOnlineBooking !== 'all' || search !== '';

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [search, filterStatus, filterPosition, filterOnlineBooking, sortBy, sortOrder]);

  // Obter posições únicas para filtro
  const uniquePositions = Array.from(
    new Set(
      data?.employees
        ?.map((e: any) => e.position)
        .filter(Boolean)
    )
  );

  // Filtrar e ordenar colaboradores
  const allFilteredEmployees = data?.employees
    ? data.employees
        .filter((employee: any) => {
          // Filtro por status
          if (filterStatus === 'active' && !employee.isActive) return false;
          if (filterStatus === 'inactive' && employee.isActive) return false;
          
          // Filtro por cargo
          if (filterPosition !== 'all' && employee.position !== filterPosition) {
            return false;
          }
          
          // Filtro por agendamento online
          if (filterOnlineBooking === 'yes' && !employee.acceptsOnlineBooking) return false;
          if (filterOnlineBooking === 'no' && employee.acceptsOnlineBooking) return false;
          
          // Filtro de busca
          if (search) {
            const searchLower = search.toLowerCase();
            return (
              employee.name?.toLowerCase().includes(searchLower) ||
              employee.email?.toLowerCase().includes(searchLower) ||
              employee.phone?.includes(search)
            );
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
            case 'position':
              aValue = (a.position || '').toLowerCase();
              bValue = (b.position || '').toLowerCase();
              break;
            default:
              return 0;
          }
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        })
    : [];

  // Aplicar paginação
  const totalPages = Math.ceil(allFilteredEmployees.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const filteredAndSortedEmployees = allFilteredEmployees.slice(startIndex, endIndex);

  // Calculate stats from filtered data
  const stats = useMemo(() => {
    if (!data?.employees) {
      return { total: 0, active: 0, inactive: 0, withSystemAccess: 0 };
    }

    return {
      total: data.employees.length,
      active: data.employees.filter((e: any) => e.isActive).length,
      inactive: data.employees.filter((e: any) => !e.isActive).length,
      withSystemAccess: data.employees.filter((e: any) => e.acceptsOnlineBooking).length,
    };
  }, [data]);

  const handleViewEmployee = (employee: any) => {
    setViewingEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleDeleteEmployee = (employee: any) => {
    if (!activeSalonId) {
      toast({
        title: 'Erro',
        description: 'Nenhum salão ativo',
        variant: 'destructive',
      });
      return;
    }

    setEmployeeToDelete(employee);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete || !activeSalonId) return;

    try {
      await deleteEmployee({
        id: employeeToDelete.id,
      });

      toast({
        title: 'Colaborador excluído',
        description: 'Colaborador removido com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir colaborador',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    }
  };

  const hasEmployees = filteredAndSortedEmployees.length > 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Colaboradores</h1>
          <p className='text-muted-foreground'>
            Gerencie a equipe do seu salão
          </p>
        </div>
        <Button onClick={() => {
          setEditingEmployee(null);
          setIsModalOpen(true);
        }}>
          <Plus className='mr-2 h-4 w-4' />
          Novo Colaborador
        </Button>
      </div>

      {/* Stats Cards */}
      <EmployeeStatsCards stats={stats} isLoading={isLoading} />

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
                        {[filterStatus !== 'all', filterPosition !== 'all', filterOnlineBooking !== 'all'].filter(Boolean).length}
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
                        <option value='active'>Ativos</option>
                        <option value='inactive'>Inativos</option>
                      </select>
                    </div>

                    {uniquePositions.length > 0 && (
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>Cargo</Label>
                        <select
                          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                          value={filterPosition}
                          onChange={(e) => setFilterPosition(e.target.value)}
                        >
                          <option value='all'>Todos</option>
                          {uniquePositions.map((position: any) => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <Label className='text-xs text-muted-foreground mb-1.5 block'>Agendamento Online</Label>
                      <select
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={filterOnlineBooking}
                        onChange={(e) => setFilterOnlineBooking(e.target.value)}
                      >
                        <option value='all'>Todos</option>
                        <option value='yes'>Habilitado</option>
                        <option value='no'>Desabilitado</option>
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
                  <DropdownMenuItem onClick={() => { setSortBy('position'); setSortOrder('asc'); }}>
                    Cargo (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('email'); setSortOrder('asc'); }}>
                    E-mail (A-Z)
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
                {filteredAndSortedEmployees.length} {filteredAndSortedEmployees.length === 1 ? 'colaborador' : 'colaboradores'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <div className='flex flex-col items-center gap-2'>
                <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                <p className='text-sm text-muted-foreground'>Carregando colaboradores...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-destructive'>
                Erro ao carregar colaboradores: {error.message}
              </p>
            </div>
          ) : !hasEmployees ? (
            <EmptyState
              icon={Users}
              title='Nenhum colaborador encontrado'
              description={
                hasActiveFilters
                  ? 'Tente ajustar seus filtros de busca'
                  : 'Comece criando seu primeiro colaborador'
              }
              action={
                !hasActiveFilters && (
                  <Button onClick={() => {
                    setEditingEmployee(null);
                    setIsModalOpen(true);
                  }}>
                    <Plus className='mr-2 h-4 w-4' />
                    Novo Colaborador
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
                      {visibleColumns.includes('name') && <TableHead>Colaborador</TableHead>}
                      {visibleColumns.includes('email') && <TableHead>E-mail</TableHead>}
                      {visibleColumns.includes('phone') && <TableHead>Telefone</TableHead>}
                      {visibleColumns.includes('position') && <TableHead>Cargo</TableHead>}
                      {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                      {visibleColumns.includes('onlineBooking') && <TableHead>Agendamento Online</TableHead>}
                      <TableHead className='text-right'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedEmployees.map((employee: any) => (
                      <TableRow key={employee.id} className='h-16'>
                        {visibleColumns.includes('name') && (
                          <TableCell className='py-3 sm:py-2'>
                            <div className='font-medium max-w-[200px] truncate'>{employee.name}</div>
                          </TableCell>
                        )}
                        {visibleColumns.includes('email') && (
                          <TableCell className='py-3 sm:py-2'>
                            <div className='max-w-[200px] truncate'>{employee.email || '-'}</div>
                          </TableCell>
                        )}
                        {visibleColumns.includes('phone') && (
                          <TableCell className='py-3 sm:py-2'>{employee.phone || '-'}</TableCell>
                        )}
                        {visibleColumns.includes('position') && (
                          <TableCell className='py-3 sm:py-2'>
                            <div className='max-w-[150px] truncate'>{employee.position || '-'}</div>
                          </TableCell>
                        )}
                        {visibleColumns.includes('status') && (
                          <TableCell>
                            <Badge variant={employee.isActive ? 'default' : 'secondary'}>
                              {employee.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.includes('onlineBooking') && (
                          <TableCell>
                            <Badge variant={employee.acceptsOnlineBooking ? 'default' : 'outline'}>
                              {employee.acceptsOnlineBooking ? 'Sim' : 'Não'}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className='text-right py-3 sm:py-2'>
                          <div className='flex items-center justify-end gap-3 sm:gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewEmployee(employee)}
                              title='Visualizar'
                              className='h-10 w-10 p-0 sm:h-9 sm:w-9'
                            >
                              <Eye className='h-5 w-5 sm:h-4 sm:w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setEditingEmployee(employee);
                                setIsModalOpen(true);
                              }}
                              title='Editar'
                              className='h-10 w-10 p-0 sm:h-9 sm:w-9'
                            >
                              <Edit className='h-5 w-5 sm:h-4 sm:w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteEmployee(employee)}
                              title='Excluir'
                              className='h-10 w-10 p-0 sm:h-9 sm:w-9'
                            >
                              <Trash2 className='h-5 w-5 sm:h-4 sm:w-4 text-destructive' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={allFilteredEmployees.length}
                itemsPerPage={perPage}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={setPage}
                onItemsPerPageChange={setPerPage}
                itemLabel="colaborador"
                itemLabelPlural="colaboradores"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* View Employee Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Detalhes do Colaborador</DialogTitle>
            <DialogDescription>
              Informações completas do colaborador
            </DialogDescription>
          </DialogHeader>
          {viewingEmployee && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium'>Nome</Label>
                  <p className='text-sm text-muted-foreground'>{viewingEmployee.name}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>E-mail</Label>
                  <p className='text-sm text-muted-foreground'>{viewingEmployee.email || '-'}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Telefone</Label>
                  <p className='text-sm text-muted-foreground'>{viewingEmployee.phone || '-'}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Cargo</Label>
                  <p className='text-sm text-muted-foreground'>{viewingEmployee.position || '-'}</p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Status</Label>
                  <Badge variant={viewingEmployee.isActive ? 'default' : 'secondary'}>
                    {viewingEmployee.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Agendamento Online</Label>
                  <Badge variant={viewingEmployee.acceptsOnlineBooking ? 'default' : 'outline'}>
                    {viewingEmployee.acceptsOnlineBooking ? 'Habilitado' : 'Desabilitado'}
                  </Badge>
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
              Tem certeza que deseja excluir o colaborador <strong>{employeeToDelete?.name}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEmployee}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Employee Form Modal */}
      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSuccess={() => {
          // Recarrega os dados após salvar
        }}
        employee={editingEmployee}
        salonId={activeSalonId || ''}
      />
    </div>
  );
}
