import { useState, useMemo, useEffect } from 'react';
import { useQuery, listProductBrands, createProductBrand, updateProductBrand, deleteProductBrand } from 'wasp/client/operations';
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
import { Plus, Search, Edit, Trash2, Tag, Eye, Filter, ArrowUpDown, Settings2, X, MoreHorizontal } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { BrandFormModal } from './components/BrandFormModal';
import { BrandViewModal } from './components/BrandViewModal';
import { useToast } from '../../../components/ui/use-toast';
import { BrandStatsCards } from './components/BrandStatsCards';
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marcas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as marcas dos seus produtos
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedBrand(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Marca
        </Button>
      </div>

      {/* Stats Cards */}
      <BrandStatsCards stats={stats} isLoading={isLoading} />

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar marcas..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Filtro de produtos */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                    {filterProducts !== 'all' && (
                      <Badge variant="outline" className="ml-1">
                        1
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Produtos</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setFilterProducts('all')}>
                    <div className="flex items-center gap-2">
                      {filterProducts === 'all' && <div className="h-2 w-2 rounded-full bg-primary" />}
                      Todas
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterProducts('with-products')}>
                    <div className="flex items-center gap-2">
                      {filterProducts === 'with-products' && <div className="h-2 w-2 rounded-full bg-primary" />}
                      Com Produtos
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterProducts('without-products')}>
                    <div className="flex items-center gap-2">
                      {filterProducts === 'without-products' && <div className="h-2 w-2 rounded-full bg-primary" />}
                      Sem Produtos
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Configuração de colunas */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Colunas Visíveis</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {AVAILABLE_COLUMNS.map((column) => (
                    <DropdownMenuItem
                      key={column.id}
                      onClick={() => toggleColumn(column.id)}
                      className="gap-2"
                    >
                      <Checkbox
                        checked={visibleColumns.includes(column.id)}
                        onCheckedChange={() => toggleColumn(column.id)}
                      />
                      {column.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Filtros ativos */}
            {filterProducts !== 'all' && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filtros ativos:</span>
                {filterProducts !== 'all' && (
                  <Badge variant="outline" className="gap-1">
                    {filterProducts === 'with-products' ? 'Com Produtos' : 'Sem Produtos'}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setFilterProducts('all')}
                    />
                  </Badge>
                )}
              </div>
            )}
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
                      {visibleColumns.includes('name') && (
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('name')}
                            className="gap-2 hover:bg-transparent p-0 h-auto font-semibold"
                          >
                            Nome
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TableHead>
                      )}
                      {visibleColumns.includes('description') && (
                        <TableHead>Descrição</TableHead>
                      )}
                      {visibleColumns.includes('products') && (
                        <TableHead>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort('products')}
                            className="gap-2 hover:bg-transparent p-0 h-auto font-semibold"
                          >
                            Produtos
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                        </TableHead>
                      )}
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBrands.map((brand) => (
                      <TableRow key={brand.id}>
                        {visibleColumns.includes('name') && (
                          <TableCell className="font-medium">{brand.name}</TableCell>
                        )}
                        {visibleColumns.includes('description') && (
                          <TableCell>
                            <div className="max-w-md truncate text-muted-foreground">
                              {brand.description || '-'}
                            </div>
                          </TableCell>
                        )}
                        {visibleColumns.includes('products') && (
                          <TableCell>
                            <Badge variant="outline">
                              {brand._count?.products || 0}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setBrandToView(brand.id);
                                  setIsViewModalOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBrand(brand);
                                  setIsModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setBrandToDelete(brand);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(page - 1) * perPage + 1} a{' '}
                    {Math.min(page * perPage, allFilteredBrands.length)} de{' '}
                    {allFilteredBrands.length} marcas
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => {
                          if (totalPages <= 7) return true;
                          if (p === 1 || p === totalPages) return true;
                          if (p >= page - 1 && p <= page + 1) return true;
                          return false;
                        })
                        .map((p, i, arr) => {
                          if (i > 0 && p - arr[i - 1] > 1) {
                            return [
                              <span key={`ellipsis-${p}`} className="px-2">
                                ...
                              </span>,
                              <Button
                                key={p}
                                variant={page === p ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setPage(p)}
                              >
                                {p}
                              </Button>,
                            ];
                          }
                          return (
                            <Button
                              key={p}
                              variant={page === p ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPage(p)}
                            >
                              {p}
                            </Button>
                          );
                        })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
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
    </div>
  );
}
