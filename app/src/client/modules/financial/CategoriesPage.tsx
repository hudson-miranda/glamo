import { useState } from 'react';
import { useQuery, listFinancialCategories } from 'wasp/client/operations';
import { createFinancialCategory, updateFinancialCategory, deleteFinancialCategory } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  TrendingUp,
  TrendingDown,
  Folder
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';

const CATEGORY_COLORS = [
  { value: 'blue', label: 'Azul', color: 'bg-blue-500' },
  { value: 'green', label: 'Verde', color: 'bg-green-500' },
  { value: 'red', label: 'Vermelho', color: 'bg-red-500' },
  { value: 'yellow', label: 'Amarelo', color: 'bg-yellow-500' },
  { value: 'purple', label: 'Roxo', color: 'bg-purple-500' },
  { value: 'pink', label: 'Rosa', color: 'bg-pink-500' },
  { value: 'orange', label: 'Laranja', color: 'bg-orange-500' },
  { value: 'gray', label: 'Cinza', color: 'bg-gray-500' },
];

const CATEGORY_TYPES = [
  { value: 'income', label: 'Receita', icon: TrendingUp, color: 'text-green-600' },
  { value: 'expense', label: 'Despesa', icon: TrendingDown, color: 'text-red-600' },
  { value: 'both', label: 'Ambos', icon: Folder, color: 'text-blue-600' },
];

export default function CategoriesPage() {
  const { activeSalonId } = useSalonContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [filterType, setFilterType] = useState<string>('all');

  const { data: categories, isLoading, refetch } = useQuery(
    listFinancialCategories,
    {
      salonId: activeSalonId || '',
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Deseja realmente excluir esta categoria? Esta ação não pode ser desfeita.')) return;
    
    try {
      await deleteFinancialCategory({
        categoryId,
        salonId: activeSalonId || '',
      });
      refetch();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria. Verifique se ela não está sendo usada em transações.');
    }
  };

  const filteredCategories = categories?.filter((cat: any) => {
    if (filterType === 'all') return true;
    return cat.type === filterType;
  }) || [];

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 px-4 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Categorias Financeiras</h1>
          <p className='text-muted-foreground'>
            Organize suas receitas e despesas com categorias personalizadas
          </p>
        </div>
        <Button onClick={() => { setEditingCategory(null); setShowCreateDialog(true); }}>
          <Plus className='mr-2 h-4 w-4' />
          Nova Categoria
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className='flex flex-wrap gap-2'>
        <Button
          size='sm'
          variant={filterType === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterType('all')}
        >
          Todas ({categories?.length || 0})
        </Button>
        {CATEGORY_TYPES.map((type) => {
          const count = categories?.filter((c: any) => c.type === type.value).length || 0;
          const Icon = type.icon;
          return (
            <Button
              key={type.value}
              size='sm'
              variant={filterType === type.value ? 'default' : 'outline'}
              onClick={() => setFilterType(type.value)}
            >
              <Icon className='mr-2 h-3 w-3' />
              {type.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {filteredCategories.map((category: any) => {
            const colorConfig = CATEGORY_COLORS.find(c => c.value === category.color);
            const typeConfig = CATEGORY_TYPES.find(t => t.value === category.type);
            const TypeIcon = typeConfig?.icon || Folder;

            return (
              <Card key={category.id} className='hover:shadow-md transition-shadow'>
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-3 flex-1 min-w-0'>
                      <div className={`w-3 h-3 rounded-full ${colorConfig?.color || 'bg-gray-500'} shrink-0`} />
                      <div className='flex-1 min-w-0'>
                        <CardTitle className='text-base truncate'>{category.name}</CardTitle>
                      </div>
                    </div>
                    <div className='flex gap-1 shrink-0'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => { setEditingCategory(category); setShowCreateDialog(true); }}
                      >
                        <Edit className='h-3 w-3' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 className='h-3 w-3 text-destructive' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {/* Type Badge */}
                  <div className='flex items-center gap-2'>
                    <TypeIcon className={`h-4 w-4 ${typeConfig?.color || 'text-gray-600'}`} />
                    <Badge variant='outline' className='text-xs'>
                      {typeConfig?.label || category.type}
                    </Badge>
                  </div>

                  {/* Description */}
                  {category.description && (
                    <p className='text-xs text-muted-foreground line-clamp-2'>
                      {category.description}
                    </p>
                  )}

                  {/* Usage Count (if available) */}
                  {category.usageCount !== undefined && (
                    <div className='text-xs text-muted-foreground pt-2 border-t'>
                      {category.usageCount} transaç{category.usageCount === 1 ? 'ão' : 'ões'}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className='py-16'>
            <div className='text-center text-muted-foreground'>
              <Tag className='h-16 w-16 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium mb-2'>
                {filterType === 'all' 
                  ? 'Nenhuma categoria criada' 
                  : `Nenhuma categoria de ${CATEGORY_TYPES.find(t => t.value === filterType)?.label.toLowerCase()}`
                }
              </p>
              <p className='text-sm mb-4'>
                Crie categorias para organizar melhor suas finanças
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Criar Primeira Categoria
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      {showCreateDialog && (
        <CategoryDialog
          category={editingCategory}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingCategory(null);
          }}
          onSuccess={() => {
            refetch();
            setShowCreateDialog(false);
            setEditingCategory(null);
          }}
          salonId={activeSalonId || ''}
        />
      )}
    </div>
  );
}

// Category Dialog Component
function CategoryDialog({ category, onClose, onSuccess, salonId }: any) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    type: category?.type || 'expense',
    color: category?.color || 'blue',
    description: category?.description || '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (category) {
        await updateFinancialCategory({
          categoryId: category.id,
          salonId,
          ...formData,
        });
      } else {
        await createFinancialCategory({
          salonId,
          ...formData,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      alert('Erro ao salvar categoria. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card className='max-w-md w-full'>
        <CardHeader>
          <CardTitle>{category ? 'Editar' : 'Nova'} Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Nome da Categoria *</label>
              <input
                type='text'
                required
                className='w-full border rounded-md px-3 py-2'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='Ex: Produtos, Salários, Marketing'
              />
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Tipo *</label>
              <div className='grid grid-cols-3 gap-2'>
                {CATEGORY_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type='button'
                      className={`p-3 border rounded-md flex flex-col items-center gap-2 transition-colors ${
                        formData.type === type.value
                          ? 'border-primary bg-primary/10'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                    >
                      <Icon className={`h-5 w-5 ${type.color}`} />
                      <span className='text-xs font-medium'>{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Cor *</label>
              <div className='grid grid-cols-4 gap-2'>
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type='button'
                    className={`p-3 border rounded-md flex flex-col items-center gap-2 transition-all ${
                      formData.color === color.value
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'hover:border-gray-400'
                    }`}
                    onClick={() => setFormData({ ...formData, color: color.value })}
                  >
                    <div className={`w-6 h-6 rounded-full ${color.color}`} />
                    <span className='text-xs'>{color.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Descrição</label>
              <textarea
                className='w-full border rounded-md px-3 py-2 resize-none'
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='Descrição opcional da categoria...'
              />
            </div>

            <div className='flex gap-3 pt-4'>
              <Button type='button' variant='outline' onClick={onClose} className='flex-1'>
                Cancelar
              </Button>
              <Button type='submit' disabled={submitting} className='flex-1'>
                {submitting ? 'Salvando...' : category ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
