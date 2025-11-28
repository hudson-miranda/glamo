import { useState, useMemo } from 'react';
import { useQuery, listEmployees, deleteEmployee } from 'wasp/client/operations';
import { useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, Search, Users, Edit, Trash2, Mail, Phone, Calendar, Eye, Filter, ArrowUpDown, Settings2, X } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { useToast } from '../../../components/ui/use-toast';
import { formatDate } from '../../lib/formatters';

// Definição de colunas disponíveis
const AVAILABLE_COLUMNS = [
  { id: 'color', label: 'Cor', enabled: true },
  { id: 'name', label: 'Nome', enabled: true },
  { id: 'position', label: 'Cargo', enabled: true },
  { id: 'contact', label: 'Contato', enabled: true },
  { id: 'cpf', label: 'CPF', enabled: false },
  { id: 'birthDate', label: 'Data de Nascimento', enabled: false },
  { id: 'hireDate', label: 'Data de Contratação', enabled: false },
  { id: 'services', label: 'Serviços', enabled: true },
  { id: 'status', label: 'Status', enabled: true },
];

export default function EmployeesListPage() {
  const navigate = useNavigate();
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  
  // Modais
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<any>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<any>(null);
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterSystemAccess, setFilterSystemAccess] = useState<string>('all');
  
  // Ordenação
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.enabled).map(col => col.id)
  );

  const { data, isLoading, error, refetch } = useQuery(listEmployees, {
    salonId: activeSalonId || '',
    search: '',
    isActive: undefined, // Buscar todos para filtrar localmente
  }, {
    enabled: !!activeSalonId,
  });

  // Filtragem e ordenação local
  const filteredAndSortedEmployees = useMemo(() => {
    if (!data?.employees) return [];

    let filtered = [...data.employees];

    // Busca por texto
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower) ||
        emp.phone?.includes(search) ||
        emp.cpf?.includes(search) ||
        emp.position?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de status
    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(emp => emp.isActive === isActive);
    }

    // Filtro de cargo
    if (filterPosition !== 'all') {
      filtered = filtered.filter(emp => emp.position?.toLowerCase() === filterPosition.toLowerCase());
    }

    // Filtro de acesso ao sistema
    if (filterSystemAccess !== 'all') {
      const hasAccess = filterSystemAccess === 'yes';
      filtered = filtered.filter(emp => hasAccess ? !!emp.user : !emp.user);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'position':
          aValue = a.position || '';
          bValue = b.position || '';
          break;
        case 'services':
          aValue = a._count.serviceAssignments;
          bValue = b._count.serviceAssignments;
          break;
        case 'hireDate':
          aValue = a.hireDate ? new Date(a.hireDate).getTime() : 0;
          bValue = b.hireDate ? new Date(b.hireDate).getTime() : 0;
          break;
        case 'birthDate':
          aValue = a.birthDate ? new Date(a.birthDate).getTime() : 0;
          bValue = b.birthDate ? new Date(b.birthDate).getTime() : 0;
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (typeof aValue === 'string') {
        return sortOrder === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [data?.employees, search, filterStatus, filterPosition, filterSystemAccess, sortBy, sortOrder]);

  // Obter lista de cargos únicos para o filtro
  const uniquePositions = useMemo(() => {
    if (!data?.employees) return [];
    const positions = data.employees
      .map(emp => emp.position)
      .filter((pos): pos is string => !!pos);
    return Array.from(new Set(positions));
  }, [data?.employees]);

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
    setFilterSystemAccess('all');
    setSearch('');
  };

  const hasActiveFilters = filterStatus !== 'all' || filterPosition !== 'all' || filterSystemAccess !== 'all' || search !== '';

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
        employeeId: employeeToDelete.id,
        salonId: activeSalonId,
      });

      toast({
        title: 'Colaborador excluído',
        description: 'Colaborador removido com sucesso',
      });

      await refetch();
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

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const formatCPF = (cpf: string | null) => {
    if (!cpf) return '-';
    const cleaned = cpf.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }
    return cpf;
  };

  const hasEmployees = filteredAndSortedEmployees.length > 0;

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Colaboradores
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Gerencie os colaboradores do seu salão
          </p>
        </div>
        <Button 
          onClick={() => navigate('/employees/new' as any)}
          className='bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 text-white shadow-lg shadow-brand-500/30'
        >
          <Plus className='mr-2 h-4 w-4' />
          Cadastrar Colaborador
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className='bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800'>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4'>
            {/* Search Bar */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400' />
              <Input
                placeholder='Buscar por nome, email, telefone, CPF ou cargo...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
              />
            </div>

            {/* Filter Controls */}
            <div className='flex flex-wrap items-center gap-2'>
              {/* Filtros Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='sm' className='gap-2'>
                    <Filter className='h-4 w-4' />
                    Filtros
                    {hasActiveFilters && (
                      <Badge variant='secondary' className='ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center'>
                        {[filterStatus !== 'all', filterPosition !== 'all', filterSystemAccess !== 'all'].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-56'>
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className='px-2 py-1.5'>
                    <p className='text-xs font-medium text-muted-foreground mb-2'>Status</p>
                    <div className='space-y-1'>
                      <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                        <div className='flex items-center justify-between w-full'>
                          <span>Todos</span>
                          {filterStatus === 'all' && <span className='text-brand-600'>✓</span>}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                        <div className='flex items-center justify-between w-full'>
                          <span>Ativo</span>
                          {filterStatus === 'active' && <span className='text-brand-600'>✓</span>}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                        <div className='flex items-center justify-between w-full'>
                          <span>Inativo</span>
                          {filterStatus === 'inactive' && <span className='text-brand-600'>✓</span>}
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <div className='px-2 py-1.5'>
                    <p className='text-xs font-medium text-muted-foreground mb-2'>Cargo</p>
                    <div className='space-y-1'>
                      <DropdownMenuItem onClick={() => setFilterPosition('all')}>
                        <div className='flex items-center justify-between w-full'>
                          <span>Todos</span>
                          {filterPosition === 'all' && <span className='text-brand-600'>✓</span>}
                        </div>
                      </DropdownMenuItem>
                      {uniquePositions.map(position => (
                        <DropdownMenuItem key={position} onClick={() => setFilterPosition(position)}>
                          <div className='flex items-center justify-between w-full'>
                            <span>{position}</span>
                            {filterPosition === position && <span className='text-brand-600'>✓</span>}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <div className='px-2 py-1.5'>
                    <p className='text-xs font-medium text-muted-foreground mb-2'>Acesso ao Sistema</p>
                    <div className='space-y-1'>
                      <DropdownMenuItem onClick={() => setFilterSystemAccess('all')}>
                        <div className='flex items-center justify-between w-full'>
                          <span>Todos</span>
                          {filterSystemAccess === 'all' && <span className='text-brand-600'>✓</span>}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterSystemAccess('yes')}>
                        <div className='flex items-center justify-between w-full'>
                          <span>Com acesso</span>
                          {filterSystemAccess === 'yes' && <span className='text-brand-600'>✓</span>}
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilterSystemAccess('no')}>
                        <div className='flex items-center justify-between w-full'>
                          <span>Sem acesso</span>
                          {filterSystemAccess === 'no' && <span className='text-brand-600'>✓</span>}
                        </div>
                      </DropdownMenuItem>
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
                  <DropdownMenuItem onClick={() => { setSortBy('position'); setSortOrder('desc'); }}>
                    Cargo (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('services'); setSortOrder('desc'); }}>
                    Mais Serviços
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('services'); setSortOrder('asc'); }}>
                    Menos Serviços
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('hireDate'); setSortOrder('desc'); }}>
                    Contratação (Recente)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('hireDate'); setSortOrder('asc'); }}>
                    Contratação (Antiga)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Colunas */}
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsColumnsModalOpen(true)}
                className='gap-2'
              >
                <Settings2 className='h-4 w-4' />
                Colunas
              </Button>

              {/* Limpar filtros */}
              {hasActiveFilters && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleClearFilters}
                  className='gap-2 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-4 w-4' />
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className='bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800'>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <div className='flex items-center gap-3'>
                <div className='w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin' />
                <p className='text-sm text-gray-600 dark:text-gray-400'>Carregando colaboradores...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-red-600 dark:text-red-400'>
                Erro ao carregar colaboradores: {error.message}
              </p>
            </div>
          ) : !hasEmployees ? (
            <EmptyState
              icon={Users}
              title='Nenhum colaborador encontrado'
              description={
                hasActiveFilters
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece cadastrando seu primeiro colaborador'
              }
              action={
                !hasActiveFilters && (
                  <Button 
                    onClick={() => navigate('/employees/new' as any)}
                    className='bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 text-white'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Cadastrar Colaborador
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='border-gray-200 dark:border-gray-800'>
                      {visibleColumns.includes('color') && <TableHead className='text-gray-700 dark:text-gray-300'>Cor</TableHead>}
                      {visibleColumns.includes('name') && <TableHead className='text-gray-700 dark:text-gray-300'>Nome</TableHead>}
                      {visibleColumns.includes('position') && <TableHead className='text-gray-700 dark:text-gray-300'>Cargo</TableHead>}
                      {visibleColumns.includes('contact') && <TableHead className='text-gray-700 dark:text-gray-300'>Contato</TableHead>}
                      {visibleColumns.includes('cpf') && <TableHead className='text-gray-700 dark:text-gray-300'>CPF</TableHead>}
                      {visibleColumns.includes('birthDate') && <TableHead className='text-gray-700 dark:text-gray-300'>Aniversário</TableHead>}
                      {visibleColumns.includes('hireDate') && <TableHead className='text-gray-700 dark:text-gray-300'>Contratação</TableHead>}
                      {visibleColumns.includes('services') && <TableHead className='text-gray-700 dark:text-gray-300'>Serviços</TableHead>}
                      {visibleColumns.includes('status') && <TableHead className='text-gray-700 dark:text-gray-300'>Status</TableHead>}
                      <TableHead className='text-right text-gray-700 dark:text-gray-300'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedEmployees.map((employee) => (
                      <TableRow key={employee.id} className='border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'>
                        {visibleColumns.includes('color') && (
                          <TableCell>
                            <div
                              className='w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm'
                              style={{ backgroundColor: employee.color || '#999' }}
                              title={employee.color || 'Sem cor'}
                            />
                          </TableCell>
                        )}
                        {visibleColumns.includes('name') && (
                          <TableCell>
                            <div className='flex flex-col'>
                              <span className='font-medium text-gray-900 dark:text-white'>
                                {employee.name}
                              </span>
                              {employee.user && (
                                <span className='text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 mt-1'>
                                  <Mail className='h-3 w-3' />
                                  Tem acesso ao sistema
                                </span>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.includes('position') && (
                          <TableCell>
                            <span className='text-gray-900 dark:text-gray-300'>
                              {employee.position || '-'}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.includes('contact') && (
                          <TableCell>
                            <div className='flex flex-col gap-1 text-sm'>
                              {employee.email && (
                                <span className='text-gray-700 dark:text-gray-400 flex items-center gap-1'>
                                  <Mail className='h-3 w-3' />
                                  {employee.email}
                                </span>
                              )}
                              {employee.phone && (
                                <span className='text-gray-700 dark:text-gray-400 flex items-center gap-1'>
                                  <Phone className='h-3 w-3' />
                                  {formatPhone(employee.phone)}
                                </span>
                              )}
                              {!employee.email && !employee.phone && (
                                <span className='text-gray-500 dark:text-gray-500'>-</span>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.includes('cpf') && (
                          <TableCell>
                            <span className='text-gray-900 dark:text-gray-300'>
                              {formatCPF(employee.cpf)}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.includes('birthDate') && (
                          <TableCell>
                            <span className='text-gray-900 dark:text-gray-300'>
                              {employee.birthDate ? formatDate(new Date(employee.birthDate)) : '-'}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.includes('hireDate') && (
                          <TableCell>
                            <span className='text-gray-900 dark:text-gray-300'>
                              {employee.hireDate ? formatDate(new Date(employee.hireDate)) : '-'}
                            </span>
                          </TableCell>
                        )}
                        {visibleColumns.includes('services') && (
                          <TableCell>
                            <Badge 
                              variant='outline' 
                              className='bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                            >
                              {employee._count.serviceAssignments} {employee._count.serviceAssignments === 1 ? 'serviço' : 'serviços'}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.includes('status') && (
                          <TableCell>
                            <Badge
                              variant={employee.isActive ? 'default' : 'secondary'}
                              className={
                                employee.isActive
                                  ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                              }
                            >
                              {employee.isActive ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewEmployee(employee)}
                              title='Visualizar'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => navigate(`/employees/${employee.id}/schedules` as any)}
                              title='Ver horários'
                            >
                              <Calendar className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => navigate(`/employees/${employee.id}/edit` as any)}
                              title='Editar'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteEmployee(employee)}
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

              {/* Results info */}
              <div className='border-t border-gray-200 dark:border-gray-800 px-6 py-4'>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Mostrando <span className='font-medium text-gray-900 dark:text-white'>{filteredAndSortedEmployees.length}</span> de{' '}
                  <span className='font-medium text-gray-900 dark:text-white'>{data?.total || 0}</span> colaborador
                  {(data?.total || 0) !== 1 && 'es'}
                </p>
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

      {/* View Employee Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Detalhes do Colaborador</DialogTitle>
            <DialogDescription>
              Visualização completa de todas as informações do colaborador
            </DialogDescription>
          </DialogHeader>
          {viewingEmployee && (
            <div className='space-y-6'>
              {/* Informações Básicas */}
              <div>
                <h3 className='text-lg font-semibold mb-3'>Informações Básicas</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Nome</p>
                    <p className='font-medium'>{viewingEmployee.name}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Cor de Identificação</p>
                    <div className='flex items-center gap-2'>
                      <div
                        className='w-6 h-6 rounded-full border-2 border-gray-300'
                        style={{ backgroundColor: viewingEmployee.color || '#999' }}
                      />
                      <span className='text-sm'>{viewingEmployee.color || 'Não definida'}</span>
                    </div>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Cargo</p>
                    <p className='font-medium'>{viewingEmployee.position || '-'}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Status</p>
                    <Badge
                      variant={viewingEmployee.isActive ? 'default' : 'secondary'}
                      className={
                        viewingEmployee.isActive
                          ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                      }
                    >
                      {viewingEmployee.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  {viewingEmployee.user && (
                    <div className='col-span-2'>
                      <p className='text-sm text-muted-foreground'>Acesso ao Sistema</p>
                      <p className='font-medium text-brand-600 flex items-center gap-1'>
                        <Mail className='h-4 w-4' />
                        Possui acesso ao sistema
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contato */}
              <div>
                <h3 className='text-lg font-semibold mb-3'>Contato</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>E-mail</p>
                    <p className='font-medium'>{viewingEmployee.email || '-'}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Telefone</p>
                    <p className='font-medium'>{formatPhone(viewingEmployee.phone)}</p>
                  </div>
                </div>
              </div>

              {/* Documentos */}
              <div>
                <h3 className='text-lg font-semibold mb-3'>Documentos</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>CPF</p>
                    <p className='font-medium'>{formatCPF(viewingEmployee.cpf)}</p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Data de Nascimento</p>
                    <p className='font-medium'>
                      {viewingEmployee.birthDate
                        ? formatDate(new Date(viewingEmployee.birthDate))
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informações Profissionais */}
              <div>
                <h3 className='text-lg font-semibold mb-3'>Informações Profissionais</h3>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-sm text-muted-foreground'>Data de Contratação</p>
                    <p className='font-medium'>
                      {viewingEmployee.hireDate
                        ? formatDate(new Date(viewingEmployee.hireDate))
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-muted-foreground'>Serviços Atribuídos</p>
                    <Badge 
                      variant='outline' 
                      className='bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400'
                    >
                      {viewingEmployee._count.serviceAssignments} {viewingEmployee._count.serviceAssignments === 1 ? 'serviço' : 'serviços'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              {(viewingEmployee.address ||
                viewingEmployee.city ||
                viewingEmployee.state ||
                viewingEmployee.zipCode) && (
                <div>
                  <h3 className='text-lg font-semibold mb-3'>Endereço</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='col-span-2'>
                      <p className='text-sm text-muted-foreground'>Endereço</p>
                      <p className='font-medium'>{viewingEmployee.address || '-'}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Cidade</p>
                      <p className='font-medium'>{viewingEmployee.city || '-'}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>Estado</p>
                      <p className='font-medium'>{viewingEmployee.state || '-'}</p>
                    </div>
                    <div>
                      <p className='text-sm text-muted-foreground'>CEP</p>
                      <p className='font-medium'>{viewingEmployee.zipCode || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Observações */}
              {viewingEmployee.notes && (
                <div>
                  <h3 className='text-lg font-semibold mb-3'>Observações</h3>
                  <p className='text-sm'>{viewingEmployee.notes}</p>
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
              Tem certeza que deseja excluir o colaborador <strong>{employeeToDelete?.name}</strong>?
              Esta ação não pode ser desfeita e removerá todos os dados associados, incluindo
              horários e atribuições de serviços.
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
    </div>
  );
}
