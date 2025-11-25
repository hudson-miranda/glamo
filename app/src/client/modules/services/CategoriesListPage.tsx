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
import { Plus, Search, Edit, Trash2, Tag, Eye } from 'lucide-react';
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

export default function CategoriesListPage() {
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryToView, setCategoryToView] = useState<string | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);

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

  const filteredCategories = categories || [];

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

      {/* Search */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex items-center gap-4'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar categorias...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className='pl-9'
              />
            </div>
            <span className='text-sm text-muted-foreground whitespace-nowrap'>
              {filteredCategories.length} {filteredCategories.length === 1 ? 'categoria' : 'categorias'}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className='p-0'>
          {filteredCategories.length === 0 ? (
            <div className='py-12'>
              <EmptyState
                icon={Tag}
                title='Nenhuma categoria encontrada'
                description={
                  search
                    ? 'Nenhuma categoria corresponde à sua busca.'
                    : 'Comece criando sua primeira categoria.'
                }
                action={
                  !search && (
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className='text-center'>Serviços</TableHead>
                  <TableHead className='text-center'>Status</TableHead>
                  <TableHead className='text-right'>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category: any) => (
                  <TableRow key={category.id}>
                    <TableCell className='font-medium'>{category.name}</TableCell>
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
                    <TableCell className='text-center'>
                      <Badge variant='secondary'>
                        {category._count?.services || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-center'>
                      <Badge variant={category.active ? 'default' : 'secondary'}>
                        {category.active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
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
