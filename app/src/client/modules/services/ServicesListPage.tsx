import { useState } from 'react';
import { useQuery, listServices, createService, updateService, deleteService, listEmployees, listProducts } from 'wasp/client/operations';
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
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Plus, Search, Scissors, Edit, Trash2, Eye, Filter, ArrowUpDown, Settings2, X } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { ServiceFormModal } from './components/ServiceFormModal';
import { useToast } from '../../../components/ui/use-toast';

// Definição de colunas disponíveis
const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'Nome', enabled: true },
  { id: 'category', label: 'Categoria', enabled: true },
  { id: 'price', label: 'Preço', enabled: true },
  { id: 'duration', label: 'Duração', enabled: true },
  { id: 'priceType', label: 'Tipo de Preço', enabled: false },
  { id: 'commission', label: 'Comissão', enabled: false },
  { id: 'cost', label: 'Custo', enabled: false },
  { id: 'isFavorite', label: 'Favorito', enabled: false },
  { id: 'isVisible', label: 'Visível', enabled: false },
  { id: 'allowOnlineBooking', label: 'Agendamento Online', enabled: false },
  { id: 'status', label: 'Status', enabled: true },
];

export default function ServicesListPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [serviceToDelete, setServiceToDelete] = useState<any>(null);
  
  // Filtros
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriceType, setFilterPriceType] = useState<string>('all');
  
  // Ordenação
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.enabled).map(col => col.id)
  );

  const { data, isLoading, error, refetch } = useQuery(listServices, {
    salonId: activeSalonId || '',
    search,
    page,
    perPage: 20,
  }, {
    enabled: !!activeSalonId,
  });

  const { data: employees = [] } = useQuery(listEmployees, {
    salonId: activeSalonId || '',
  }, {
    enabled: !!activeSalonId,
  });

  const { data: products = [] } = useQuery(listProducts, {
    salonId: activeSalonId || '',
  }, {
    enabled: !!activeSalonId,
  });

  const handleOpenModal = (service: any = null) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedService(null); // Limpar primeiro para garantir reset correto
    setIsModalOpen(false);
  };

  const handleSubmitService = async (formData: any) => {
    if (!activeSalonId) {
      throw new Error('No active salon');
    }

    if (selectedService) {
      // Update existing service
      await updateService({
        serviceId: selectedService.id,
        salonId: activeSalonId,
        name: formData.name,
        description: formData.description || undefined,
        duration: formData.defaultDuration,
        price: formData.defaultPrice,
        categoryId: formData.categoryId || undefined,
        priceType: formData.priceType || undefined,
        costValue: formData.costValue || undefined,
        costValueType: formData.costValueType || undefined,
        commissionValue: formData.commissionValue || undefined,
        commissionValueType: formData.commissionValueType || undefined,
        cardColor: formData.color || undefined,
        active: formData.active !== undefined ? formData.active : true,
        isFavorite: formData.isFavorite || false,
        isVisible: formData.isVisible !== undefined ? formData.isVisible : true,
        requiresDeposit: formData.requiresDeposit || false,
        depositAmount: formData.depositAmount || undefined,
        allowOnlineBooking: formData.allowOnlineBooking !== undefined ? formData.allowOnlineBooking : true,
        advanceBookingTime: formData.advanceBookingTime || undefined,
        imagePath: formData.imagePath || undefined,
        instructions: formData.instructions || undefined,
        cashbackActive: formData.cashbackActive || false,
        cashbackValue: formData.cashbackValue || undefined,
        cashbackValueType: formData.cashbackValueType || undefined,
        returnActive: formData.returnActive || false,
        returnDays: formData.returnDays || undefined,
        returnMessage: formData.returnMessage || undefined,
        serviceListItem: formData.serviceListItem || undefined,
        cnae: formData.cnae || undefined,
        municipalServiceCode: formData.municipalServiceCode || undefined,
      });
    } else {
      // Create new service
      await createService({
        salonId: activeSalonId,
        name: formData.name,
        description: formData.description || undefined,
        duration: formData.defaultDuration,
        price: formData.defaultPrice,
        hasVariants: false,
        categoryId: formData.categoryId || undefined,
        priceType: formData.priceType || undefined,
        costValue: formData.costValue || undefined,
        costValueType: formData.costValueType || undefined,
        commissionValue: formData.commissionValue || undefined,
        commissionValueType: formData.commissionValueType || undefined,
        cardColor: formData.color || undefined,
        active: formData.active !== undefined ? formData.active : true,
        isFavorite: formData.isFavorite || false,
        isVisible: formData.isVisible !== undefined ? formData.isVisible : true,
        requiresDeposit: formData.requiresDeposit || false,
        depositAmount: formData.depositAmount || undefined,
        allowOnlineBooking: formData.allowOnlineBooking !== undefined ? formData.allowOnlineBooking : true,
        advanceBookingTime: formData.advanceBookingTime || undefined,
        imagePath: formData.imagePath || undefined,
        instructions: formData.instructions || undefined,
        cashbackActive: formData.cashbackActive || false,
        cashbackValue: formData.cashbackValue || undefined,
        cashbackValueType: formData.cashbackValueType || undefined,
        returnActive: formData.returnActive || false,
        returnDays: formData.returnDays || undefined,
        returnMessage: formData.returnMessage || undefined,
        serviceListItem: formData.serviceListItem || undefined,
        cnae: formData.cnae || undefined,
        municipalServiceCode: formData.municipalServiceCode || undefined,
      });
    }

    await refetch();
  };



  const handleDeleteService = (service: any) => {
    if (!activeSalonId) {
      toast({
        title: 'Erro',
        description: 'Nenhum salão ativo',
        variant: 'destructive',
      });
      return;
    }

    setServiceToDelete(service);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteService = async () => {
    if (!serviceToDelete || !activeSalonId) return;

    try {
      await deleteService({
        serviceId: serviceToDelete.id,
        salonId: activeSalonId,
      });

      toast({
        title: 'Serviço excluído',
        description: 'Serviço removido com sucesso',
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir serviço',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setServiceToDelete(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins === 0 ? `${hours}h` : `${hours}h ${mins}min`;
  };

  const handleViewService = (service: any) => {
    setSelectedService(service);
    setIsViewModalOpen(true);
  };

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleClearFilters = () => {
    setFilterCategory('all');
    setFilterStatus('all');
    setFilterPriceType('all');
    setSearch('');
  };

  const hasActiveFilters = filterCategory !== 'all' || filterStatus !== 'all' || filterPriceType !== 'all' || search !== '';

  // Filtrar e ordenar serviços
  const filteredAndSortedServices = data?.services
    ? data.services
        .filter((service: any) => {
          // Filtro por categoria
          if (filterCategory !== 'all' && service.category?.id !== filterCategory) {
            return false;
          }
          // Filtro por status
          if (filterStatus === 'active' && service.deletedAt) return false;
          if (filterStatus === 'inactive' && !service.deletedAt) return false;
          // Filtro por tipo de preço
          if (filterPriceType !== 'all' && service.priceType !== filterPriceType) {
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
            case 'price':
              aValue = a.price || 0;
              bValue = b.price || 0;
              break;
            case 'duration':
              aValue = a.duration || 0;
              bValue = b.duration || 0;
              break;
            case 'category':
              aValue = a.category?.name?.toLowerCase() || '';
              bValue = b.category?.name?.toLowerCase() || '';
              break;
            default:
              return 0;
          }
          if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
          if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
          return 0;
        })
    : [];

  // Obter categorias únicas para filtro
  const categories = Array.from(
    new Set(
      data?.services
        ?.map((s: any) => s.category)
        .filter(Boolean)
        .map((c: any) => JSON.stringify(c))
    )
  ).map((c: any) => JSON.parse(c));

  return (
      <div className='space-y-6'>
        <ServiceFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitService}
          service={selectedService}
          salonId={activeSalonId || ''}
          employees={(employees as any)?.employees || []}
          products={(products as any)?.products || []}
        />

        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Serviços</h1>
            <p className='text-muted-foreground'>
              Gerencie os serviços e preços do seu salão
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className='mr-2 h-4 w-4' />
            Novo Serviço
          </Button>
        </div>

        {/* Search, Filters and Actions */}
        <Card>
          <CardContent className='pt-6'>
            <div className='flex flex-col gap-4'>
              {/* Busca */}
              <div className='relative flex-1'>
                <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
                <Input
                  placeholder='Buscar por nome do serviço...'
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
                          {[filterCategory !== 'all', filterStatus !== 'all', filterPriceType !== 'all'].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='w-56'>
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <div className='p-2 space-y-2'>
                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>Categoria</Label>
                        <select
                          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                          value={filterCategory}
                          onChange={(e) => setFilterCategory(e.target.value)}
                        >
                          <option value='all'>Todas</option>
                          {categories.map((cat: any) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

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

                      <div>
                        <Label className='text-xs text-muted-foreground mb-1.5 block'>Tipo de Preço</Label>
                        <select
                          className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                          value={filterPriceType}
                          onChange={(e) => setFilterPriceType(e.target.value)}
                        >
                          <option value='all'>Todos</option>
                          <option value='FIXED'>Fixo</option>
                          <option value='FROM'>A partir de</option>
                          <option value='CONSULTATION'>Sob consulta</option>
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
                    <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder('asc'); }}>
                      Preço (Menor)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder('desc'); }}>
                      Preço (Maior)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('duration'); setSortOrder('asc'); }}>
                      Duração (Menor)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('duration'); setSortOrder('desc'); }}>
                      Duração (Maior)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => { setSortBy('category'); setSortOrder('asc'); }}>
                      Categoria (A-Z)
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
                  {filteredAndSortedServices.length} {filteredAndSortedServices.length === 1 ? 'serviço' : 'serviços'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <CardContent className='p-0'>
            {isLoading ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-muted-foreground'>Loading services...</p>
              </div>
            ) : error ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-destructive'>
                  Error loading services: {error.message}
                </p>
              </div>
            ) : filteredAndSortedServices.length === 0 ? (
              <EmptyState
                icon={Scissors}
                title={hasActiveFilters ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
                description={
                  hasActiveFilters
                    ? 'Tente ajustar seus filtros de busca'
                    : 'Comece criando seu primeiro serviço'
                }
                action={
                  !hasActiveFilters && (
                    <Button onClick={() => handleOpenModal()}>
                      <Plus className='mr-2 h-4 w-4' />
                      Novo Serviço
                    </Button>
                  )
                }
              />
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.includes('name') && <TableHead>Nome</TableHead>}
                      {visibleColumns.includes('category') && <TableHead>Categoria</TableHead>}
                      {visibleColumns.includes('price') && <TableHead>Preço</TableHead>}
                      {visibleColumns.includes('duration') && <TableHead>Duração</TableHead>}
                      {visibleColumns.includes('priceType') && <TableHead>Tipo de Preço</TableHead>}
                      {visibleColumns.includes('commission') && <TableHead>Comissão</TableHead>}
                      {visibleColumns.includes('cost') && <TableHead>Custo</TableHead>}
                      {visibleColumns.includes('isFavorite') && <TableHead>Favorito</TableHead>}
                      {visibleColumns.includes('isVisible') && <TableHead>Visível</TableHead>}
                      {visibleColumns.includes('allowOnlineBooking') && <TableHead>Ag. Online</TableHead>}
                      {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                      <TableHead className='text-right'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedServices.map((service: any) => (
                      <TableRow key={service.id}>
                        {visibleColumns.includes('name') && (
                          <TableCell className='font-medium'>
                            <div>
                              <div>{service.name}</div>
                              {service.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-xs">
                                  {service.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.includes('category') && (
                          <TableCell>
                            {service.category?.name || '-'}
                          </TableCell>
                        )}
                        {visibleColumns.includes('price') && (
                          <TableCell>
                            {service.price ? formatCurrency(service.price) : '-'}
                          </TableCell>
                        )}
                        {visibleColumns.includes('duration') && (
                          <TableCell>
                            {service.duration ? formatDuration(service.duration) : '-'}
                          </TableCell>
                        )}
                        {visibleColumns.includes('priceType') && (
                          <TableCell>
                            {service.priceType === 'FIXED' && 'Fixo'}
                            {service.priceType === 'FROM' && 'A partir de'}
                            {service.priceType === 'CONSULTATION' && 'Sob consulta'}
                            {!service.priceType && '-'}
                          </TableCell>
                        )}
                        {visibleColumns.includes('commission') && (
                          <TableCell>
                            {service.commissionValue 
                              ? `${service.commissionValueType === 'PERCENT' ? service.commissionValue + '%' : formatCurrency(service.commissionValue)}`
                              : '-'}
                          </TableCell>
                        )}
                        {visibleColumns.includes('cost') && (
                          <TableCell>
                            {service.costValue 
                              ? `${service.costValueType === 'PERCENT' ? service.costValue + '%' : formatCurrency(service.costValue)}`
                              : '-'}
                          </TableCell>
                        )}
                        {visibleColumns.includes('isFavorite') && (
                          <TableCell>
                            <Badge variant={service.isFavorite ? 'default' : 'secondary'}>
                              {service.isFavorite ? 'Sim' : 'Não'}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.includes('isVisible') && (
                          <TableCell>
                            <Badge variant={service.isVisible !== false ? 'default' : 'secondary'}>
                              {service.isVisible !== false ? 'Sim' : 'Não'}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.includes('allowOnlineBooking') && (
                          <TableCell>
                            <Badge variant={service.allowOnlineBooking !== false ? 'default' : 'secondary'}>
                              {service.allowOnlineBooking !== false ? 'Sim' : 'Não'}
                            </Badge>
                          </TableCell>
                        )}
                        {visibleColumns.includes('status') && (
                          <TableCell>
                            <Badge variant={service.deletedAt ? 'secondary' : 'default'}>
                              {service.deletedAt ? 'Inativo' : 'Ativo'}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            <Button 
                              variant='ghost' 
                              size='sm'
                              onClick={() => handleViewService(service)}
                              title='Visualizar'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button 
                              variant='ghost' 
                              size='sm'
                              onClick={() => handleOpenModal(service)}
                              title='Editar'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button 
                              variant='ghost' 
                              size='sm'
                              onClick={() => handleDeleteService(service)}
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

                {/* Pagination */}
                <div className='flex items-center justify-between border-t px-6 py-4'>
                  <div className='text-sm text-muted-foreground'>
                    Exibindo {filteredAndSortedServices.length} de {data.total} serviços
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
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setPage(page + 1)}
                      disabled={
                        !data.total || page * data.perPage >= data.total
                      }
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal de Visualização */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>Detalhes do Serviço</DialogTitle>
              <DialogDescription>
                Visualização completa de todas as informações do serviço
              </DialogDescription>
            </DialogHeader>
            
            {selectedService && (
              <div className='space-y-6'>
                {/* Informações Básicas */}
                <div className='space-y-3'>
                  <h3 className='font-semibold text-lg'>Informações Básicas</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Nome</Label>
                      <p className='font-medium'>{selectedService.name}</p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Categoria</Label>
                      <p className='font-medium'>{selectedService.category?.name || 'Sem categoria'}</p>
                    </div>
                    <div className='col-span-2'>
                      <Label className='text-muted-foreground text-sm'>Descrição</Label>
                      <p className='font-medium'>{selectedService.description || 'Sem descrição'}</p>
                    </div>
                  </div>
                </div>

                {/* Preço e Duração */}
                <div className='space-y-3 border-t pt-4'>
                  <h3 className='font-semibold text-lg'>Preço e Duração</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Tipo de Preço</Label>
                      <p className='font-medium'>
                        {selectedService.priceType === 'FIXED' && 'Fixo'}
                        {selectedService.priceType === 'FROM' && 'A partir de'}
                        {selectedService.priceType === 'CONSULTATION' && 'Sob consulta'}
                        {!selectedService.priceType && 'Fixo'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Preço</Label>
                      <p className='font-medium'>{formatCurrency(selectedService.price || 0)}</p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Duração</Label>
                      <p className='font-medium'>{formatDuration(selectedService.duration || 0)}</p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Custo</Label>
                      <p className='font-medium'>
                        {selectedService.costValue 
                          ? `${selectedService.costValueType === 'PERCENT' ? selectedService.costValue + '%' : formatCurrency(selectedService.costValue)}`
                          : 'Não definido'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comissão */}
                <div className='space-y-3 border-t pt-4'>
                  <h3 className='font-semibold text-lg'>Comissão</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Comissão Padrão</Label>
                      <p className='font-medium'>
                        {selectedService.commissionValue 
                          ? `${selectedService.commissionValueType === 'PERCENT' ? selectedService.commissionValue + '%' : formatCurrency(selectedService.commissionValue)}`
                          : 'Não definida'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configurações */}
                <div className='space-y-3 border-t pt-4'>
                  <h3 className='font-semibold text-lg'>Configurações</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Status</Label>
                      <Badge variant={selectedService.deletedAt ? 'secondary' : 'default'}>
                        {selectedService.deletedAt ? 'Inativo' : 'Ativo'}
                      </Badge>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Favorito</Label>
                      <Badge variant={selectedService.isFavorite ? 'default' : 'secondary'}>
                        {selectedService.isFavorite ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Visível no App</Label>
                      <Badge variant={selectedService.isVisible !== false ? 'default' : 'secondary'}>
                        {selectedService.isVisible !== false ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Agendamento Online</Label>
                      <Badge variant={selectedService.allowOnlineBooking !== false ? 'default' : 'secondary'}>
                        {selectedService.allowOnlineBooking !== false ? 'Permitido' : 'Bloqueado'}
                      </Badge>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Tempo de Antecedência</Label>
                      <p className='font-medium'>
                        {selectedService.advanceBookingTime 
                          ? `${selectedService.advanceBookingTime}h` 
                          : 'Sem restrição'}
                      </p>
                    </div>
                    <div>
                      <Label className='text-muted-foreground text-sm'>Requer Depósito</Label>
                      <Badge variant={selectedService.requiresDeposit ? 'default' : 'secondary'}>
                        {selectedService.requiresDeposit ? 'Sim' : 'Não'}
                      </Badge>
                    </div>
                    {selectedService.requiresDeposit && selectedService.depositAmount && (
                      <div>
                        <Label className='text-muted-foreground text-sm'>Valor do Depósito</Label>
                        <p className='font-medium'>{formatCurrency(selectedService.depositAmount)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cashback */}
                {selectedService.cashbackActive && (
                  <div className='space-y-3 border-t pt-4'>
                    <h3 className='font-semibold text-lg'>Cashback</h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label className='text-muted-foreground text-sm'>Cashback Ativo</Label>
                        <Badge variant='default'>Sim</Badge>
                      </div>
                      <div>
                        <Label className='text-muted-foreground text-sm'>Valor do Cashback</Label>
                        <p className='font-medium'>
                          {selectedService.cashbackValue 
                            ? `${selectedService.cashbackValueType === 'PERCENT' ? selectedService.cashbackValue + '%' : formatCurrency(selectedService.cashbackValue)}`
                            : 'Não definido'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Retorno */}
                {selectedService.returnActive && (
                  <div className='space-y-3 border-t pt-4'>
                    <h3 className='font-semibold text-lg'>Política de Retorno</h3>
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <Label className='text-muted-foreground text-sm'>Retorno Ativo</Label>
                        <Badge variant='default'>Sim</Badge>
                      </div>
                      <div>
                        <Label className='text-muted-foreground text-sm'>Prazo de Retorno</Label>
                        <p className='font-medium'>{selectedService.returnDays} dias</p>
                      </div>
                      {selectedService.returnMessage && (
                        <div className='col-span-2'>
                          <Label className='text-muted-foreground text-sm'>Mensagem de Retorno</Label>
                          <p className='font-medium'>{selectedService.returnMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Informações Fiscais */}
                {(selectedService.serviceListItem || selectedService.cnae || selectedService.municipalServiceCode) && (
                  <div className='space-y-3 border-t pt-4'>
                    <h3 className='font-semibold text-lg'>Informações Fiscais</h3>
                    <div className='grid grid-cols-2 gap-4'>
                      {selectedService.serviceListItem && (
                        <div>
                          <Label className='text-muted-foreground text-sm'>Item da Lista de Serviços</Label>
                          <p className='font-medium'>{selectedService.serviceListItem}</p>
                        </div>
                      )}
                      {selectedService.cnae && (
                        <div>
                          <Label className='text-muted-foreground text-sm'>CNAE</Label>
                          <p className='font-medium'>{selectedService.cnae}</p>
                        </div>
                      )}
                      {selectedService.municipalServiceCode && (
                        <div>
                          <Label className='text-muted-foreground text-sm'>Código Municipal</Label>
                          <p className='font-medium'>{selectedService.municipalServiceCode}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className='flex justify-end gap-2 pt-4'>
              <Button variant='outline' onClick={() => setIsViewModalOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setIsViewModalOpen(false);
                handleOpenModal(selectedService);
              }}>
                <Edit className='mr-2 h-4 w-4' />
                Editar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Customização de Colunas */}
        <Dialog open={isColumnsModalOpen} onOpenChange={setIsColumnsModalOpen}>
          <DialogContent className='max-w-md'>
            <DialogHeader>
              <DialogTitle>Customizar Colunas</DialogTitle>
              <DialogDescription>
                Selecione quais colunas deseja visualizar na tabela
              </DialogDescription>
            </DialogHeader>
            
            <div className='space-y-4 py-4'>
              {AVAILABLE_COLUMNS.map((column) => (
                <div key={column.id} className='flex items-center space-x-2'>
                  <Checkbox
                    id={column.id}
                    checked={visibleColumns.includes(column.id)}
                    onCheckedChange={() => handleToggleColumn(column.id)}
                  />
                  <Label
                    htmlFor={column.id}
                    className='text-sm font-normal cursor-pointer flex-1'
                  >
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className='flex justify-between gap-2 pt-4'>
              <Button 
                variant='outline' 
                onClick={() => {
                  setVisibleColumns(AVAILABLE_COLUMNS.map(col => col.id));
                }}
              >
                Selecionar Todas
              </Button>
              <Button onClick={() => setIsColumnsModalOpen(false)}>
                Concluído
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmação de Exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O serviço <strong>{serviceToDelete?.name}</strong> será excluído permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setServiceToDelete(null)}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteService}
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
