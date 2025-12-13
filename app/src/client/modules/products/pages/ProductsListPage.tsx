import { useState, useMemo, useEffect } from 'react';
import { useQuery, listProducts, deleteProduct, listProductBrands, listProductCategories, listSuppliers } from 'wasp/client/operations';
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
  Package, 
  Edit, 
  Trash2,
  Star,
  Filter,
  X,
  ArrowUpDown,
  Settings2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { ProductFormModal } from '../components/ProductFormModal';
import { ProductStatsCards } from '../components/ProductStatsCards';
import { useToast } from '../../../../components/ui/use-toast';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Pagination } from '../../../../components/ui/pagination';

// Definição de colunas disponíveis
const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'Produto', enabled: true },
  { id: 'category', label: 'Categoria', enabled: true },
  { id: 'brand', label: 'Marca', enabled: true },
  { id: 'cost', label: 'Custo', enabled: true },
  { id: 'price', label: 'Venda', enabled: true },
  { id: 'stock', label: 'Estoque', enabled: true },
  { id: 'supplier', label: 'Fornecedor', enabled: false },
  { id: 'sku', label: 'SKU', enabled: false },
  { id: 'barcode', label: 'Código de Barras', enabled: false },
  { id: 'status', label: 'Status', enabled: true },
];

export default function ProductsListPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  
  // Filtros
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterBrand, setFilterBrand] = useState<string>('all');
  const [filterSupplier, setFilterSupplier] = useState<string>('all');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Ordenação
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.enabled).map(col => col.id)
  );

  const { data, isLoading, error, refetch } = useQuery(listProducts, { 
    salonId: activeSalonId || '',
    includeDeleted: false,
  }, {
    enabled: !!activeSalonId,
  });

  const { data: brandsData } = useQuery(listProductBrands, { 
    salonId: activeSalonId || '' 
  }, {
    enabled: !!activeSalonId,
  });
  
  const { data: categoriesData } = useQuery(listProductCategories, { 
    salonId: activeSalonId || '' 
  }, {
    enabled: !!activeSalonId,
  });
  
  const { data: suppliersData } = useQuery(listSuppliers, { 
    salonId: activeSalonId || '' 
  }, {
    enabled: !!activeSalonId,
  });

  const brands = brandsData || [];
  const categories = categoriesData || [];
  const suppliers = suppliersData || [];

  const handleOpenModal = (product: any = null) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (product: any) => {
    if (!activeSalonId) {
      toast({
        title: 'Erro',
        description: 'Nenhum salão ativo',
        variant: 'destructive',
      });
      return;
    }

    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete || !activeSalonId) return;

    try {
      await deleteProduct({
        productId: productToDelete.id,
        salonId: activeSalonId,
      });

      toast({
        title: 'Produto excluído',
        description: 'Produto removido com sucesso',
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir produto',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
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
    setFilterBrand('all');
    setFilterSupplier('all');
    setFilterLowStock(false);
    setFilterStatus('all');
    setSearch('');
  };

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPage(1);
  }, [search, filterCategory, filterBrand, filterSupplier, filterLowStock, filterStatus]);

  const hasActiveFilters = filterCategory !== 'all' || filterBrand !== 'all' || 
    filterSupplier !== 'all' || filterLowStock || filterStatus !== 'all' || search !== '';

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calculate stats
  const stats = useMemo(() => {
    if (!data?.products) {
      return { total: 0, active: 0, inactive: 0, lowStock: 0, favorites: 0 };
    }

    return {
      total: data.products.length,
      active: data.products.filter((p: any) => p.isActive).length,
      inactive: data.products.filter((p: any) => !p.isActive).length,
      lowStock: data.products.filter((p: any) => p.stockQuantity <= p.minimumStock).length,
      favorites: data.products.filter((p: any) => p.isFavorite).length,
    };
  }, [data]);

  // Filter and sort products
  const allFilteredProducts = useMemo(() => {
    if (!data?.products) return [];

    return data.products
      .filter((product: any) => {
        // Search filter
        if (search) {
          const searchLower = search.toLowerCase();
          const matchesName = product.name.toLowerCase().includes(searchLower);
          const matchesBarcode = product.barcode?.toLowerCase().includes(searchLower);
          const matchesSku = product.sku?.toLowerCase().includes(searchLower);
          if (!matchesName && !matchesBarcode && !matchesSku) return false;
        }
        
        // Category filter
        if (filterCategory !== 'all' && product.categoryId !== filterCategory) {
          return false;
        }
        
        // Brand filter
        if (filterBrand !== 'all' && product.brandId !== filterBrand) {
          return false;
        }
        
        // Supplier filter
        if (filterSupplier !== 'all' && product.supplierId !== filterSupplier) {
          return false;
        }
        
        // Status filter
        if (filterStatus === 'active' && !product.isActive) return false;
        if (filterStatus === 'inactive' && product.isActive) return false;
        
        // Low stock filter
        if (filterLowStock && product.stockQuantity > product.minimumStock) {
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
            aValue = a.salePrice || 0;
            bValue = b.salePrice || 0;
            break;
          case 'cost':
            aValue = a.costPrice || 0;
            bValue = b.costPrice || 0;
            break;
          case 'stock':
            aValue = a.stockQuantity || 0;
            bValue = b.stockQuantity || 0;
            break;
          case 'category':
            aValue = a.category?.name?.toLowerCase() || '';
            bValue = b.category?.name?.toLowerCase() || '';
            break;
          case 'brand':
            aValue = a.brand?.name?.toLowerCase() || '';
            bValue = b.brand?.name?.toLowerCase() || '';
            break;
          default:
            return 0;
        }
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, search, filterCategory, filterBrand, filterSupplier, filterStatus, filterLowStock, sortBy, sortOrder]);

  // Paginação
  const totalPages = Math.ceil(allFilteredProducts.length / perPage);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const filteredAndSortedProducts = allFilteredProducts.slice(startIndex, endIndex);

  return (
    <div className='space-y-6'>
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={refetch}
        product={selectedProduct}
        salonId={activeSalonId || ''}
      />

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Produtos</h1>
          <p className='text-muted-foreground'>
            Gerencie os produtos do seu salão
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className='mr-2 h-4 w-4' />
          Novo Produto
        </Button>
      </div>

      {/* Stats Cards */}
      <ProductStatsCards stats={stats} isLoading={isLoading} />

      {/* Search, Filters and Actions */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4'>
            {/* Busca */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar por nome, SKU ou código de barras...'
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
                        {[filterCategory !== 'all', filterBrand !== 'all', filterSupplier !== 'all', filterStatus !== 'all', filterLowStock].filter(Boolean).length}
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
                      <Label className='text-xs text-muted-foreground mb-1.5 block'>Marca</Label>
                      <select
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={filterBrand}
                        onChange={(e) => setFilterBrand(e.target.value)}
                      >
                        <option value='all'>Todas</option>
                        {brands.map((brand: any) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label className='text-xs text-muted-foreground mb-1.5 block'>Fornecedor</Label>
                      <select
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={filterSupplier}
                        onChange={(e) => setFilterSupplier(e.target.value)}
                      >
                        <option value='all'>Todos</option>
                        {suppliers.map((supplier: any) => (
                          <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
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

                    <div className='flex items-center space-x-2 pt-2'>
                      <Checkbox
                        id='lowStock'
                        checked={filterLowStock}
                        onCheckedChange={(checked) => setFilterLowStock(checked as boolean)}
                      />
                      <label
                        htmlFor='lowStock'
                        className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                      >
                        Apenas estoque baixo
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
                  <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder('asc'); }}>
                    Preço (Menor)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('price'); setSortOrder('desc'); }}>
                    Preço (Maior)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('cost'); setSortOrder('asc'); }}>
                    Custo (Menor)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('cost'); setSortOrder('desc'); }}>
                    Custo (Maior)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('stock'); setSortOrder('asc'); }}>
                    Estoque (Menor)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('stock'); setSortOrder('desc'); }}>
                    Estoque (Maior)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('category'); setSortOrder('asc'); }}>
                    Categoria (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('brand'); setSortOrder('asc'); }}>
                    Marca (A-Z)
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
                {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'produto' : 'produtos'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-muted-foreground'>Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-destructive'>
                Erro ao carregar produtos: {error.message}
              </p>
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center p-12 text-center'>
              <Package className='h-12 w-12 text-muted-foreground mb-4' />
              <h3 className='text-lg font-semibold mb-2'>
                {hasActiveFilters ? 'Nenhum produto encontrado' : 'Nenhum produto cadastrado'}
              </h3>
              <p className='text-sm text-muted-foreground mb-4'>
                {hasActiveFilters
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece adicionando o primeiro produto'}
              </p>
              {!hasActiveFilters && (
                <Button onClick={() => handleOpenModal()}>
                  <Plus className='mr-2 h-4 w-4' />
                  Adicionar Produto
                </Button>
              )}
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow>
                    {visibleColumns.includes('name') && <TableHead>Produto</TableHead>}
                    {visibleColumns.includes('category') && <TableHead>Categoria</TableHead>}
                    {visibleColumns.includes('brand') && <TableHead>Marca</TableHead>}
                    {visibleColumns.includes('cost') && <TableHead>Custo</TableHead>}
                    {visibleColumns.includes('price') && <TableHead>Venda</TableHead>}
                    {visibleColumns.includes('stock') && <TableHead>Estoque</TableHead>}
                    {visibleColumns.includes('supplier') && <TableHead>Fornecedor</TableHead>}
                    {visibleColumns.includes('sku') && <TableHead>SKU</TableHead>}
                    {visibleColumns.includes('barcode') && <TableHead>Código de Barras</TableHead>}
                    {visibleColumns.includes('status') && <TableHead>Status</TableHead>}
                    <TableHead className='text-right'>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedProducts.map((product: any) => (
                    <TableRow key={product.id}>
                      {visibleColumns.includes('name') && (
                        <TableCell className='font-medium'>
                          <div className='flex items-center gap-2'>
                            {product.isFavorite && (
                              <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                            )}
                            {product.name}
                          </div>
                        </TableCell>
                      )}
                      {visibleColumns.includes('category') && (
                        <TableCell>{product.category?.name || '-'}</TableCell>
                      )}
                      {visibleColumns.includes('brand') && (
                        <TableCell>{product.brand?.name || '-'}</TableCell>
                      )}
                      {visibleColumns.includes('cost') && (
                        <TableCell>{formatCurrency(product.costPrice || 0)}</TableCell>
                      )}
                      {visibleColumns.includes('price') && (
                        <TableCell>{formatCurrency(product.salePrice || 0)}</TableCell>
                      )}
                      {visibleColumns.includes('stock') && (
                        <TableCell>
                          <Badge 
                            variant={product.stockQuantity <= product.minimumStock ? 'destructive' : 'secondary'}
                          >
                            {product.stockQuantity}
                          </Badge>
                        </TableCell>
                      )}
                      {visibleColumns.includes('supplier') && (
                        <TableCell>{product.supplier?.name || '-'}</TableCell>
                      )}
                      {visibleColumns.includes('sku') && (
                        <TableCell>{product.sku || '-'}</TableCell>
                      )}
                      {visibleColumns.includes('barcode') && (
                        <TableCell>{product.barcode || '-'}</TableCell>
                      )}
                      {visibleColumns.includes('status') && (
                        <TableCell>
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? (
                              <><CheckCircle className='mr-1 h-3 w-3' /> Ativo</>
                            ) : (
                              <><XCircle className='mr-1 h-3 w-3' /> Inativo</>
                            )}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell className='text-right'>
                        <div className='flex items-center justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleOpenModal(product)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleDeleteProduct(product)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && allFilteredProducts.length > 0 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={allFilteredProducts.length}
              itemsPerPage={perPage}
              startIndex={startIndex}
              endIndex={endIndex}
              onPageChange={setPage}
              onItemsPerPageChange={(value) => {
                setPerPage(value);
                setPage(1);
              }}
              itemLabel="produto"
              itemLabelPlural="produtos"
            />
          )}
        </CardContent>
      </Card>

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
                  onCheckedChange={() => handleToggleColumn(column.id)}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto "{productToDelete?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProduct} className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
