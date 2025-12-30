import { useState, useMemo, useEffect } from 'react';
import { useQuery, listProductBrands, createProductBrand, updateProductBrand, deleteProductBrand } from 'wasp/client/operations';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { Card, CardContent } from '../../../components/ui/card';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Plus, Search, Edit, Trash2, Tag, Eye, Filter, ArrowUpDown, Settings2, X } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { BrandFormModal } from './components/BrandFormModal';
import { BrandViewModal } from './components/BrandViewModal';
import { useToast } from '../../../components/ui/use-toast';
import { BrandStatsCards } from './components/BrandStatsCards';
import { Pagination } from '../../../components/ui/pagination';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip';

// Definição de colunas disponíveis
const AVAILABLE_COLUMNS = [
  { id: 'name', label: 'Nome', enabled: true },
  { id: 'description', label: 'Descrição', enabled: true },
  { id: 'products', label: 'Produtos', enabled: true },
];

export default function BrandsListPage() {
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
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [brandToView, setBrandToView] = useState<string | null>(null);
  const [brandToDelete, setBrandToDelete] = useState<any>(null);
  
  // Filtros
  const [filterProducts, setFilterProducts] = useState<string>('all');
  
  // Ordenação
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.enabled).map(col => col.id)
  );

  const { data: brands, isLoading, error, refetch } = useQuery(
    listProductBrands,
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
      setSelectedBrand(null);
      // Limpar query parameter
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  // Filtros e ordenação
  const allFilteredBrands = useMemo(() => {
    if (!brands) return [];

    let filtered = [...brands];

    // Busca
    if (search) {
      filtered = filtered.filter(
        (brand) =>
          brand.name.toLowerCase().includes(search.toLowerCase()) ||
          brand.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtro por produtos
    if (filterProducts !== 'all') {
      if (filterProducts === 'with-products') {
        filtered = filtered.filter((b) => (b._count?.products || 0) > 0);
      } else if (filterProducts === 'without-products') {
        filtered = filtered.filter((b) => (b._count?.products || 0) === 0);
      }
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];

      // Tratamento especial para produtos
      if (sortBy === 'products') {
        aValue = a._count?.products || 0;
        bValue = b._count?.products || 0;
      }

      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [brands, search, filterProducts, sortBy, sortOrder]);

  // Paginação
  const paginatedBrands = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    return allFilteredBrands.slice(startIndex, startIndex + perPage);
  }, [allFilteredBrands, page, perPage]);

  const totalPages = Math.ceil(allFilteredBrands.length / perPage);

  // Handlers
  const handleCreateBrand = async (data: any) => {
    try {
      await createProductBrand({ salonId: activeSalonId, ...data });
      toast({
        title: 'Sucesso',
        description: 'Marca criada com sucesso!',
      });
      await refetch();
      setIsModalOpen(false);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao criar marca',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBrand = async (data: any) => {
    try {
      await updateProductBrand({
        brandId: selectedBrand.id,
        salonId: activeSalonId,
        ...data,
      });
      toast({
        title: 'Sucesso',
        description: 'Marca atualizada com sucesso!',
      });
      await refetch();
      setIsModalOpen(false);
      setSelectedBrand(null);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao atualizar marca',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBrand = async () => {
    if (!brandToDelete) return;

    try {
      await deleteProductBrand({
        brandId: brandToDelete.id,
        salonId: activeSalonId!,
      });
      toast({
        title: 'Sucesso',
        description: 'Marca excluída com sucesso!',
      });
      await refetch();
      setIsDeleteDialogOpen(false);
      setBrandToDelete(null);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir marca',
        variant: 'destructive',
      });
    }
  };

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnId)
        ? prev.filter((id) => id !== columnId)
        : [...prev, columnId]
    );
  };

  const stats = useMemo(() => {
    if (!brands) return { total: 0, withProducts: 0, withoutProducts: 0 };

    return {
      total: brands.length,
      withProducts: brands.filter((b: any) => (b._count?.products || 0) > 0).length,
      withoutProducts: brands.filter((b: any) => (b._count?.products || 0) === 0).length,
    };
  }, [brands]);

  if (error) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Tag}
          title="Erro ao carregar marcas"
          description="Ocorreu um erro ao carregar as marcas. Tente novamente."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Marcas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as marcas dos seus produtos
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedBrand(null);
            setIsModalOpen(true);
          }}
          className="w-full sm:w-auto flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Marca
        </Button>
      </div>

      {/* Stats Cards */}
      <BrandStatsCards stats={stats} isLoading={isLoading} />

      {/* Search, Filters and Actions */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4'>
            {/* Busca */}
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar marcas...'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
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
                    {filterProducts !== 'all' && (
                      <Badge variant='secondary' className='ml-1 px-1.5 py-0.5 text-xs'>
                        1
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
                        value={filterProducts}
                        onChange={(e) => setFilterProducts(e.target.value)}
                      >
                        <option value='all'>Todas</option>
                        <option value='with-products'>Com Produtos</option>
                        <option value='without-products'>Sem Produtos</option>
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
              {filterProducts !== 'all' && (
                <Button 
                  variant='ghost' 
                  size='sm' 
                  className='gap-2'
                  onClick={() => setFilterProducts('all')}
                >
                  <X className='h-4 w-4' />
                  Limpar filtros
                </Button>
              )}

              <div className='ml-auto text-sm text-muted-foreground'>
                {allFilteredBrands.length} {allFilteredBrands.length === 1 ? 'marca' : 'marcas'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Carregando marcas...</p>
            </div>
          ) : paginatedBrands.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Tag}
                title={search ? 'Nenhuma marca encontrada' : 'Nenhuma marca cadastrada'}
                description={
                  search
                    ? 'Tente ajustar os filtros de busca.'
                    : 'Comece criando sua primeira marca de produto.'
                }
                action={
                  !search && (
                    <Button
                      onClick={() => {
                        setSelectedBrand(null);
                        setIsModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Marca
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {visibleColumns.includes('name') && <TableHead>Nome</TableHead>}
                      {visibleColumns.includes('description') && <TableHead>Descrição</TableHead>}
                      {visibleColumns.includes('products') && <TableHead className='text-center'>Produtos</TableHead>}
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBrands.map((brand) => (
                      <TableRow key={brand.id} className='h-16'>
                        {visibleColumns.includes('name') && (
                          <TableCell className="font-medium py-3 sm:py-2">
                            <div className='max-w-[200px] truncate'>{brand.name}</div>
                          </TableCell>
                        )}
                        {visibleColumns.includes('description') && (
                          <TableCell className='max-w-xs py-3 sm:py-2'>
                            {brand.description ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className='text-sm text-muted-foreground line-clamp-1 cursor-help'>
                                      {brand.description}
                                    </span>
                                  </TooltipTrigger>
                                  <TooltipContent className='max-w-md'>
                                    <p className='whitespace-pre-wrap'>{brand.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className='text-sm text-muted-foreground italic'>
                                Sem descrição
                              </span>
                            )}
                          </TableCell>
                        )}
                        {visibleColumns.includes('products') && (
                          <TableCell className='text-center py-3 sm:py-2'>
                            <Badge variant='secondary'>
                              {brand._count?.products || 0}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className='text-right py-3 sm:py-2'>
                          <div className='flex justify-end gap-3 sm:gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setBrandToView(brand.id);
                                setIsViewModalOpen(true);
                              }}
                              title='Visualizar marca'
                              className='h-10 w-10 p-0 sm:h-9 sm:w-9'
                            >
                              <Eye className='h-5 w-5 sm:h-4 sm:w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setSelectedBrand(brand);
                                setIsModalOpen(true);
                              }}
                              title='Editar marca'
                              className='h-10 w-10 p-0 sm:h-9 sm:w-9'
                            >
                              <Edit className='h-5 w-5 sm:h-4 sm:w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setBrandToDelete(brand);
                                setIsDeleteDialogOpen(true);
                              }}
                              title='Excluir marca'
                              className='h-10 w-10 p-0 sm:h-9 sm:w-9'
                            >
                              <Trash2 className='h-5 w-5 sm:h-4 sm:w-4' />
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
                totalItems={allFilteredBrands.length}
                itemsPerPage={perPage}
                startIndex={(page - 1) * perPage}
                endIndex={page * perPage}
                onPageChange={setPage}
                onItemsPerPageChange={(value) => {
                  setPerPage(value);
                  setPage(1);
                }}
                itemLabel="marca"
                itemLabelPlural="marcas"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <BrandFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBrand(null);
        }}
        onSubmit={selectedBrand ? handleUpdateBrand : handleCreateBrand}
        brand={selectedBrand}
      />

      <BrandViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setBrandToView(null);
        }}
        brandId={brandToView || ''}
        salonId={activeSalonId || ''}
      />

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir marca?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a marca "{brandToDelete?.name}"?
              {brandToDelete?._count?.products > 0 && (
                <span className="block mt-2 text-destructive font-medium">
                  Atenção: Esta marca possui {brandToDelete._count.products} produto(s)
                  vinculado(s) e não pode ser excluída.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBrand}
              disabled={brandToDelete?._count?.products > 0}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                  onCheckedChange={() => toggleColumn(column.id)}
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
              Aplicar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
