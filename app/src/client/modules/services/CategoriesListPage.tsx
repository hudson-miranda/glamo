import { useState } from 'react';
import { useQuery, listCategories, createCategory, updateCategory, deleteCategory } from 'wasp/client/operations';
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
import { CategoryFormModal } from './components/CategoryFormModal';
import { CategoryViewModal } from './components/CategoryViewModal';
import { useToast } from '../../../components/ui/use-toast';
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
  { id: 'services', label: 'Serviços', enabled: true },
  { id: 'status', label: 'Status', enabled: true },
];

export default function CategoriesListPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isColumnsModalOpen, setIsColumnsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryToView, setCategoryToView] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterServices, setFilterServices] = useState<string>('all');
  
  // Ordenação
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    AVAILABLE_COLUMNS.filter(col => col.enabled).map(col => col.id)
  );

  const { data: categories, isLoading, error, refetch } = useQuery(
    listCategories,
    {
      salonId: activeSalonId || '',
      search,
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const handleOpenModal = (category: any = null) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setIsModalOpen(false);
  };

  const handleOpenViewModal = (categoryId: string) => {
    setCategoryToView(categoryId);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setCategoryToView(null);
    setIsViewModalOpen(false);
  };

  const handleToggleColumn = (columnId: string) => {
    setVisibleColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
  };

  const handleClearFilters = () => {
    setFilterStatus('all');
    setFilterServices('all');
    setSearch('');
  };

  const hasActiveFilters = filterStatus !== 'all' || filterServices !== 'all' || search !== '';

  const handleSubmitCategory = async (formData: any) => {
    if (!activeSalonId) {
      throw new Error('No active salon');
    }

    try {
      if (selectedCategory) {
        // Update existing category
        await updateCategory({
          categoryId: selectedCategory.id,
          salonId: activeSalonId,
          name: formData.name,
          description: formData.description || undefined,
          active: formData.active,
        });

        toast({
          title: 'Categoria atualizada',
          description: 'Categoria atualizada com sucesso',
        });
      } else {
        // Create new category
        await createCategory({
          salonId: activeSalonId,
          name: formData.name,
          description: formData.description || undefined,
          active: formData.active,
        });

        toast({
          title: 'Categoria criada',
          description: 'Nova categoria adicionada',
        });
      }

      await refetch();
      handleCloseModal();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar categoria',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleDeleteCategory = (category: any) => {
    if (!activeSalonId) {
      toast({
        title: 'Erro',
        description: 'Nenhum salão ativo',
        variant: 'destructive',
      });
      return;
    }

    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete || !activeSalonId) return;

    try {
      await deleteCategory({
        categoryId: categoryToDelete.id,
        salonId: activeSalonId,
      });

      toast({
        title: 'Categoria excluída',
        description: 'Categoria removida com sucesso',
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao excluir categoria',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto'></div>
          <p className='mt-4 text-muted-foreground'>Carregando categorias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-96'>
        <EmptyState
          icon={Tag}
          title='Erro ao carregar categorias'
          description='Não foi possível carregar as categorias. Tente novamente.'
        />
      </div>
    );
  }

  // Filtrar e ordenar categorias
  const filteredAndSortedCategories = (categories || [])
    .filter((category: any) => {
      // Filtro por status
      if (filterStatus === 'active' && !category.active) return false;
      if (filterStatus === 'inactive' && category.active) return false;
      // Filtro por quantidade de serviços
      const servicesCount = category._count?.services || 0;
      if (filterServices === 'with' && servicesCount === 0) return false;
      if (filterServices === 'without' && servicesCount > 0) return false;
      return true;
    })
    .sort((a: any, b: any) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'description':
          aValue = (a.description || '').toLowerCase();
          bValue = (b.description || '').toLowerCase();
          break;
        case 'services':
          aValue = a._count?.services || 0;
          bValue = b._count?.services || 0;
          break;
        default:
          return 0;
      }
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className='space-y-6'>
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCategory}
        category={selectedCategory}
      />

      <CategoryViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        categoryId={categoryToView}
      />

      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Categorias</h1>
          <p className='text-muted-foreground'>
            Organize seus serviços em categorias
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className='mr-2 h-4 w-4' />
          Nova Categoria
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
                placeholder='Buscar categorias...'
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
                        {[filterStatus !== 'all', filterServices !== 'all'].filter(Boolean).length}
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
                        <option value='active'>Ativas</option>
                        <option value='inactive'>Inativas</option>
                      </select>
                    </div>

                    <div>
                      <Label className='text-xs text-muted-foreground mb-1.5 block'>Serviços</Label>
                      <select
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={filterServices}
                        onChange={(e) => setFilterServices(e.target.value)}
                      >
                        <option value='all'>Todos</option>
                        <option value='with'>Com serviços</option>
                        <option value='without'>Sem serviços</option>
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
                  <DropdownMenuItem onClick={() => { setSortBy('services'); setSortOrder('desc'); }}>
                    Mais Serviços
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('services'); setSortOrder('asc'); }}>
                    Menos Serviços
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('description'); setSortOrder('asc'); }}>
                    Descrição (A-Z)
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
                {filteredAndSortedCategories.length} {filteredAndSortedCategories.length === 1 ? 'categoria' : 'categorias'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories Table */}
      <Card>
        <CardContent className='p-0'>
          {filteredAndSortedCategories.length === 0 ? (
            <div className='py-12'>
              <EmptyState
                icon={Tag}
                title={hasActiveFilters ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria cadastrada'}
                description={
                  hasActiveFilters
                    ? 'Tente ajustar seus filtros de busca'
                    : 'Comece criando sua primeira categoria'
                }
                action={
                  !hasActiveFilters && (
                    <Button onClick={() => handleOpenModal()}>
                      <Plus className='mr-2 h-4 w-4' />
                      Nova Categoria
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {visibleColumns.includes('name') && <TableHead>Nome</TableHead>}
                  {visibleColumns.includes('description') && <TableHead>Descrição</TableHead>}
                  {visibleColumns.includes('services') && <TableHead className='text-center'>Serviços</TableHead>}
                  {visibleColumns.includes('status') && <TableHead className='text-center'>Status</TableHead>}
                  <TableHead className='text-right'>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedCategories.map((category: any) => (
                  <TableRow key={category.id}>
                    {visibleColumns.includes('name') && (
                      <TableCell className='font-medium'>{category.name}</TableCell>
                    )}
                    {visibleColumns.includes('description') && (
                      <TableCell className='max-w-xs'>
                      {category.description ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className='text-sm text-muted-foreground line-clamp-2 cursor-help'>
                                {category.description}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className='max-w-md'>
                              <p className='whitespace-pre-wrap'>{category.description}</p>
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
                    {visibleColumns.includes('services') && (
                      <TableCell className='text-center'>
                        <Badge variant='secondary'>
                          {category._count?.services || 0}
                        </Badge>
                      </TableCell>
                    )}
                    {visibleColumns.includes('status') && (
                      <TableCell className='text-center'>
                        <Badge variant={category.active ? 'default' : 'secondary'}>
                          {category.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell className='text-right'>
                      <div className='flex justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleOpenViewModal(category.id)}
                          title='Visualizar categoria'
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleOpenModal(category)}
                          title='Editar categoria'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteCategory(category)}
                          title='Excluir categoria'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

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
              Esta ação não pode ser desfeita. A categoria <strong>{categoryToDelete?.name}</strong> será excluída permanentemente.
              {categoryToDelete?._count?.services > 0 && (
                <span className='block mt-2 text-orange-600 font-medium'>
                  ⚠️ Esta categoria possui {categoryToDelete._count.services} serviço(s) associado(s).
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
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
