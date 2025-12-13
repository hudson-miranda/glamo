import { useState, useMemo, useEffect } from 'react';
import { useQuery, listSuppliers, createSupplier, updateSupplier, deleteSupplier } from 'wasp/client/operations';
import { useSalonContext } from '../../../hooks/useSalonContext';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '../../../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
import { Badge } from '../../../../components/ui/badge';
import { 
  Plus, 
  Search, 
  Building2, 
  Edit, 
  Trash2,
  MoreVertical,
  Package,
  Phone,
  Mail,
  MapPin,
  FileText,
  Filter,
  X,
  ArrowUpDown,
  Settings2,
} from 'lucide-react';
import { useToast } from '../../../../components/ui/use-toast';
import { SupplierFormModal } from '../components/SupplierFormModal';
import { Pagination } from '../../../../components/ui/pagination';
import { SupplierStatsCards } from '../components/SupplierStatsCards';
import { Checkbox } from '../../../../components/ui/checkbox';

// Definição de colunas disponíveis
const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'Nome', enabled: true },
  { id: 'contact', label: 'Contato', enabled: true },
  { id: 'email', label: 'Email', enabled: true },
  { id: 'cnpj', label: 'CNPJ', enabled: true },
  { id: 'address', label: 'Endereço', enabled: false },
  { id: 'city', label: 'Cidade', enabled: false },
  { id: 'products', label: 'Produtos', enabled: true },
];

interface Supplier {
  id: string;
  name: string;
  description?: string | null;
  email?: string | null;
  phoneType?: string | null;
  phone?: string | null;
  phoneType2?: string | null;
  phone2?: string | null;
  contactName?: string | null;
  cnpj?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  complement?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  _count?: {
    products: number;
  };
}

export default function SuppliersListPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [isDeletingSupplier, setIsDeletingSupplier] = useState(false);

  // Filtros
  const [filterHasProducts, setFilterHasProducts] = useState<string>('all');
  const [filterHasEmail, setFilterHasEmail] = useState(false);
  const [filterHasPhone, setFilterHasPhone] = useState(false);
  
  // Ordenação
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.enabled).map(col => col.id)
  );

  const { data, isLoading, error, refetch } = useQuery(listSuppliers, {
    salonId: activeSalonId!,
    includeProductCount: true,
  });

  const suppliers = data || [];

  // Filter and sort suppliers
  const allFilteredSuppliers = useMemo(() => {
    let filtered = [...suppliers];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.email?.toLowerCase().includes(searchLower) ||
        supplier.phone?.includes(search) ||
        supplier.cnpj?.includes(search) ||
        supplier.contactName?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro de produtos
    if (filterHasProducts === 'with') {
      filtered = filtered.filter(s => s._count && s._count.products > 0);
    } else if (filterHasProducts === 'without') {
      filtered = filtered.filter(s => !s._count || s._count.products === 0);
    }

    // Filtro de email
    if (filterHasEmail) {
      filtered = filtered.filter(s => s.email);
    }

    // Filtro de telefone
    if (filterHasPhone) {
      filtered = filtered.filter(s => s.phone);
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'products':
          aValue = a._count?.products || 0;
          bValue = b._count?.products || 0;
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [suppliers, search, filterHasProducts, filterHasEmail, filterHasPhone, sortBy, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(allFilteredSuppliers.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const filteredSuppliers = allFilteredSuppliers.slice(startIndex, endIndex);

  const handleOpenModal = (supplier?: Supplier) => {
    setEditingSupplier(supplier || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleSubmitSupplier = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (editingSupplier) {
        await updateSupplier({
          supplierId: editingSupplier.id,
          salonId: activeSalonId!,
          ...formData,
        });
        toast({
          title: 'Fornecedor atualizado',
          description: 'Fornecedor atualizado com sucesso',
        });
      } else {
        await createSupplier({
          salonId: activeSalonId!,
          ...formData,
        });
        toast({
          title: 'Fornecedor criado',
          description: 'Fornecedor criado com sucesso',
        });
      }
      refetch();
      handleCloseModal();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Ocorreu um erro ao salvar o fornecedor',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!supplierToDelete) return;

    setIsDeletingSupplier(true);
    try {
      await deleteSupplier({
        supplierId: supplierToDelete.id,
        salonId: activeSalonId!,
      });
      
      toast({
        title: 'Fornecedor excluído',
        description: 'Fornecedor excluído com sucesso',
      });
      
      refetch();
      setDeleteDialogOpen(false);
      setSupplierToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message || 'Não foi possível excluir o fornecedor',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingSupplier(false);
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilterHasProducts('all');
    setFilterHasEmail(false);
    setFilterHasPhone(false);
  };

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [search, filterHasProducts, filterHasEmail, filterHasPhone]);

  const hasActiveFilters = search !== '' || filterHasProducts !== 'all' || 
    filterHasEmail || filterHasPhone;

  const toggleColumn = (columnId: string) => {
    setVisibleColumns(prev =>
      prev.includes(columnId)
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  if (!activeSalonId) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Selecione um salão para continuar</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Fornecedores</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie os fornecedores do seu salão
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Stats Cards */}
      <SupplierStatsCards
        stats={{
          total: suppliers.length,
          withProducts: suppliers.filter((s: Supplier) => s._count && s._count.products > 0).length,
          withEmail: suppliers.filter((s: Supplier) => s.email).length,
          withPhone: suppliers.filter((s: Supplier) => s.phone).length,
        }}
        isLoading={isLoading}
      />

      {/* Search, Filters and Actions */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4'>
            {/* Busca */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar por nome, email, telefone, CNPJ...'
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
                        {[filterHasProducts !== 'all', filterHasEmail, filterHasPhone].filter(Boolean).length}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='start' className='w-56'>
                  <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className='p-2 space-y-2'>
                    <div>
                      <Label className='text-xs text-muted-foreground mb-1.5 block'>Produtos</Label>
                      <select
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={filterHasProducts}
                        onChange={(e) => setFilterHasProducts(e.target.value)}
                      >
                        <option value='all'>Todos</option>
                        <option value='with'>Com produtos</option>
                        <option value='without'>Sem produtos</option>
                      </select>
                    </div>

                    <div className='flex items-center space-x-2 pt-2'>
                      <Checkbox
                        id='hasEmail'
                        checked={filterHasEmail}
                        onCheckedChange={(checked) => setFilterHasEmail(checked as boolean)}
                      />
                      <label
                        htmlFor='hasEmail'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        Apenas com email
                      </label>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='hasPhone'
                        checked={filterHasPhone}
                        onCheckedChange={(checked) => setFilterHasPhone(checked as boolean)}
                      />
                      <label
                        htmlFor='hasPhone'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        Apenas com telefone
                      </label>
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
                  <DropdownMenuItem onClick={() => { setSortBy('email'); setSortOrder('asc'); }}>
                    Email (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('products'); setSortOrder('desc'); }}>
                    Mais Produtos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('products'); setSortOrder('asc'); }}>
                    Menos Produtos
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
                  onClick={handleClearFilters}
                  className='gap-2'
                >
                  <X className='h-4 w-4' />
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-muted-foreground'>Carregando fornecedores...</p>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-destructive'>
                Erro ao carregar fornecedores: {error.message}
              </p>
            </div>
          ) : allFilteredSuppliers.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-12 text-center'>
              <Building2 className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                {hasActiveFilters ? 'Nenhum fornecedor encontrado' : 'Nenhum fornecedor cadastrado'}
              </h3>
              <p className='text-sm text-muted-foreground mb-4'>
                {hasActiveFilters
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando o primeiro fornecedor'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => handleOpenModal()}>
                  <Plus className='mr-2 h-4 w-4' />
                  Adicionar Fornecedor
                </Button>
              )}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleColumns.includes('name') && <TableHead>Nome</TableHead>}
                    {visibleColumns.includes('contact') && <TableHead className='hidden md:table-cell'>Contato</TableHead>}
                    {visibleColumns.includes('email') && <TableHead className='hidden lg:table-cell'>Email</TableHead>}
                    {visibleColumns.includes('cnpj') && <TableHead className='hidden xl:table-cell'>CNPJ</TableHead>}
                    {visibleColumns.includes('address') && <TableHead className='hidden xl:table-cell'>Endereço</TableHead>}
                    {visibleColumns.includes('city') && <TableHead className='hidden xl:table-cell'>Cidade</TableHead>}
                    {visibleColumns.includes('products') && <TableHead className='text-center'>Produtos</TableHead>}
                    <TableHead className='text-right'>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      {visibleColumns.includes('name') && (
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium'>{supplier.name}</span>
                            {supplier.contactName && (
                              <span className='text-xs text-muted-foreground'>
                                Contato: {supplier.contactName}
                              </span>
                            )}
                            {/* Show on mobile */}
                            <div className='md:hidden mt-1 space-y-0.5'>
                              {supplier.phone && (
                                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                  <Phone className='h-3 w-3' />
                                  {supplier.phone}
                                </div>
                              )}
                              {supplier.email && (
                                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                  <Mail className='h-3 w-3' />
                                  {supplier.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.includes('contact') && (
                        <TableCell className='hidden md:table-cell'>
                          {supplier.phone ? (
                            <div className='flex items-center gap-2'>
                              <Phone className='h-4 w-4 text-muted-foreground' />
                              <span className='text-sm'>{supplier.phone}</span>
                            </div>
                          ) : (
                            <span className='text-sm text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.includes('email') && (
                        <TableCell className='hidden lg:table-cell'>
                          {supplier.email ? (
                            <div className='flex items-center gap-2'>
                              <Mail className='h-4 w-4 text-muted-foreground' />
                              <span className='text-sm'>{supplier.email}</span>
                            </div>
                          ) : (
                            <span className='text-sm text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.includes('cnpj') && (
                        <TableCell className='hidden xl:table-cell'>
                          {supplier.cnpj ? (
                            <span className='text-sm'>{supplier.cnpj}</span>
                          ) : (
                            <span className='text-sm text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.includes('address') && (
                        <TableCell className='hidden xl:table-cell'>
                          {supplier.address ? (
                            <span className='text-sm'>{supplier.address}{supplier.addressNumber ? `, ${supplier.addressNumber}` : ''}</span>
                          ) : (
                            <span className='text-sm text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.includes('city') && (
                        <TableCell className='hidden xl:table-cell'>
                          {supplier.city ? (
                            <span className='text-sm'>{supplier.city}{supplier.state ? ` - ${supplier.state}` : ''}</span>
                          ) : (
                            <span className='text-sm text-muted-foreground'>-</span>
                          )}
                        </TableCell>
                      )}
                      {visibleColumns.includes('products') && (
                        <TableCell className='text-center'>
                          <Badge variant='secondary'>
                            {supplier._count?.products || 0}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className='text-right py-3 sm:py-2'>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className='h-10 w-10 sm:h-9 sm:w-9'>
                              <MoreVertical className='h-5 w-5 sm:h-4 sm:w-4' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleOpenModal(supplier)}>
                              <Edit className='mr-2 h-4 w-4' />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteClick(supplier)}
                              className='text-destructive'
                            >
                              <Trash2 className='mr-2 h-4 w-4' />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && allFilteredSuppliers.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={allFilteredSuppliers.length}
              itemsPerPage={perPage}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setPage}
              onItemsPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              itemLabel="fornecedor"
              itemLabelPlural="fornecedores"
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <SupplierFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitSupplier}
        supplier={editingSupplier}
        isLoading={isSubmitting}
      />

      {/* Columns Modal */}
      <Dialog open={isColumnsModalOpen} onOpenChange={setIsColumnsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customizar Colunas</DialogTitle>
            <DialogDescription>
              Selecione as colunas que deseja exibir na tabela
            </DialogDescription>
          </DialogHeader>
          <div className='space-y-4 py-4'>
            {AVAILABLE_COLUMNS.map((column) => (
              <div key={column.id} className='flex items-center space-x-2'>
                <Checkbox
                  id={column.id}
                  checked={visibleColumns.includes(column.id)}
                  onCheckedChange={() => toggleColumn(column.id)}
                />
                <label
                  htmlFor={column.id}
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o fornecedor "{supplierToDelete?.name}"?
              {supplierToDelete?._count?.products && supplierToDelete._count.products > 0 && (
                <span className="block mt-2 text-orange-600 dark:text-orange-400">
                  ⚠️ Este fornecedor possui {supplierToDelete._count.products} produto(s) vinculado(s).
                  A exclusão removerá o vínculo com esses produtos.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingSupplier}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeletingSupplier}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeletingSupplier ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
