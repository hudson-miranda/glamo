import { useState } from 'react';
import { useQuery, listBudgets } from 'wasp/client/operations';
import { createBudget, updateBudget, deleteBudget } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { formatCurrency, formatDate } from '../../lib/formatters';

export default function BudgetsPage() {
  const { activeSalonId } = useSalonContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const { data: budgets, isLoading, refetch } = useQuery(
    listBudgets,
    {
      salonId: activeSalonId || '',
    },
    {
      enabled: !!activeSalonId,
    }
  );

  const handleDelete = async (budgetId: string) => {
    if (!confirm('Deseja realmente excluir este orçamento?')) return;
    
    try {
      await deleteBudget({
        budgetId,
        salonId: activeSalonId || '',
      });
      refetch();
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      alert('Erro ao excluir orçamento. Tente novamente.');
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Carregando orçamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 px-4 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Orçamentos</h1>
          <p className='text-muted-foreground'>
            Gerencie os orçamentos financeiros do seu salão
          </p>
        </div>
        <Button onClick={() => { setEditingBudget(null); setShowCreateDialog(true); }}>
          <Plus className='mr-2 h-4 w-4' />
          Novo Orçamento
        </Button>
      </div>

      {/* Budget Cards Grid */}
      {budgets && budgets.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {budgets.map((budget: any) => {
            const totalPlanned = budget.totalPlanned || 0;
            const totalSpent = budget.items?.reduce((sum: number, item: any) => sum + (item.actualAmount || 0), 0) || 0;
            const percentUsed = totalPlanned > 0 ? (totalSpent / totalPlanned) * 100 : 0;
            const remaining = totalPlanned - totalSpent;
            const isOverBudget = percentUsed > 100;
            const isNearLimit = percentUsed > 80 && percentUsed <= 100;

            return (
              <Card key={budget.id} className={`
                relative overflow-hidden
                ${isOverBudget ? 'border-red-500 border-2' : ''}
                ${isNearLimit ? 'border-yellow-500 border-2' : ''}
              `}>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <CardTitle className='text-xl'>{budget.name}</CardTitle>
                      {budget.status && (
                        <Badge variant='outline' className='mt-2'>
                          {budget.status}
                        </Badge>
                      )}
                    </div>
                    <div className='flex gap-1'>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => { setEditingBudget(budget); setShowCreateDialog(true); }}
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        size='sm'
                        variant='ghost'
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className='h-4 w-4 text-destructive' />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Amount Display */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Gasto</span>
                      <span className='font-semibold'>{formatCurrency(totalSpent)}</span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Orçado</span>
                      <span className='font-semibold'>{formatCurrency(totalPlanned)}</span>
                    </div>
                    <div className='flex justify-between text-sm font-medium'>
                      <span className='text-muted-foreground'>Restante</span>
                      <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className='space-y-2'>
                    <div className='flex justify-between text-xs'>
                      <span className={`font-medium ${
                        isOverBudget ? 'text-red-600' :
                        isNearLimit ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {percentUsed.toFixed(1)}% utilizado
                      </span>
                      {isOverBudget && (
                        <span className='flex items-center gap-1 text-red-600'>
                          <AlertCircle className='h-3 w-3' />
                          Acima do limite
                        </span>
                      )}
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
                      <div
                        className={`h-full rounded-full transition-all ${
                          isOverBudget ? 'bg-red-600' :
                          isNearLimit ? 'bg-yellow-600' :
                          'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(percentUsed, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Period */}
                  {budget.startDate && budget.endDate && (
                    <div className='pt-2 border-t text-xs text-muted-foreground'>
                      {formatDate(budget.startDate)} até {formatDate(budget.endDate)}
                    </div>
                  )}

                  {/* Items Count */}
                  {budget.items && budget.items.length > 0 && (
                    <div className='text-xs text-muted-foreground'>
                      {budget.items.length} item{budget.items.length !== 1 ? 's' : ''} no orçamento
                    </div>
                  )}

                  {/* Status Indicator */}
                  {isOverBudget && (
                    <div className='flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md'>
                      <TrendingDown className='h-4 w-4 text-red-600' />
                      <span className='text-xs text-red-700'>
                        Excedeu em {formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                  )}
                  {isNearLimit && !isOverBudget && (
                    <div className='flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md'>
                      <AlertCircle className='h-4 w-4 text-yellow-600' />
                      <span className='text-xs text-yellow-700'>
                        Próximo do limite
                      </span>
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
              <DollarSign className='h-16 w-16 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium mb-2'>Nenhum orçamento criado</p>
              <p className='text-sm mb-4'>
                Crie orçamentos para controlar melhor suas finanças
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Criar Primeiro Orçamento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      {showCreateDialog && (
        <BudgetDialog
          budget={editingBudget}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingBudget(null);
          }}
          onSuccess={() => {
            refetch();
            setShowCreateDialog(false);
            setEditingBudget(null);
          }}
          salonId={activeSalonId || ''}
        />
      )}
    </div>
  );
}

// Budget Dialog Component
function BudgetDialog({ budget, onClose, onSuccess, salonId }: any) {
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    description: budget?.description || '',
    startDate: budget?.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
    endDate: budget?.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
    totalPlanned: budget?.totalPlanned || 0,
    items: budget?.items || [{ description: '', plannedAmount: 0 }],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Convert string dates to Date objects
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (budget) {
        await updateBudget({
          budgetId: budget.id,
          salonId,
          name: formData.name,
          description: formData.description,
          startDate,
          endDate,
          items: formData.items,
        });
      } else {
        await createBudget({
          salonId,
          name: formData.name,
          description: formData.description,
          startDate,
          endDate,
          totalPlanned: formData.totalPlanned,
          items: formData.items,
        });
      }
      onSuccess();
    } catch (error) {
      console.error('Erro ao salvar orçamento:', error);
      alert('Erro ao salvar orçamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const addBudgetItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', plannedAmount: 0 }],
    });
  };

  const removeBudgetItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_: any, i: number) => i !== index),
    });
  };

  const updateBudgetItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  // Calculate total planned from items
  const calculatedTotal = formData.items.reduce(
    (sum: number, item: any) => sum + (parseFloat(item.plannedAmount) || 0),
    0
  );

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <Card className='max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <CardHeader>
          <CardTitle>{budget ? 'Editar' : 'Novo'} Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium mb-2'>Nome do Orçamento *</label>
              <input
                type='text'
                required
                className='w-full border rounded-md px-3 py-2'
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder='Ex: Marketing Mensal'
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Data Início *</label>
                <input
                  type='date'
                  required
                  className='w-full border rounded-md px-3 py-2'
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className='block text-sm font-medium mb-2'>Data Fim *</label>
                <input
                  type='date'
                  required
                  className='w-full border rounded-md px-3 py-2'
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-2'>Descrição</label>
              <textarea
                className='w-full border rounded-md px-3 py-2 resize-none'
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder='Descrição opcional do orçamento...'
              />
            </div>

            {/* Budget Items */}
            <div>
              <div className='flex justify-between items-center mb-2'>
                <label className='block text-sm font-medium'>Itens do Orçamento *</label>
                <Button type='button' size='sm' variant='outline' onClick={addBudgetItem}>
                  <Plus className='h-3 w-3 mr-1' />
                  Adicionar Item
                </Button>
              </div>
              
              <div className='space-y-3 max-h-60 overflow-y-auto border rounded-md p-3'>
                {formData.items.map((item: any, index: number) => (
                  <div key={index} className='flex gap-2 items-start'>
                    <input
                      type='text'
                      required
                      placeholder='Descrição do item'
                      className='flex-1 border rounded-md px-2 py-1 text-sm'
                      value={item.description}
                      onChange={(e) => updateBudgetItem(index, 'description', e.target.value)}
                    />
                    <input
                      type='number'
                      required
                      step='0.01'
                      min='0'
                      placeholder='Valor'
                      className='w-32 border rounded-md px-2 py-1 text-sm'
                      value={item.plannedAmount}
                      onChange={(e) => updateBudgetItem(index, 'plannedAmount', parseFloat(e.target.value) || 0)}
                    />
                    {formData.items.length > 1 && (
                      <Button
                        type='button'
                        size='sm'
                        variant='ghost'
                        onClick={() => removeBudgetItem(index)}
                      >
                        <Trash2 className='h-3 w-3 text-destructive' />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className='mt-2 flex justify-between items-center p-2 bg-gray-50 rounded-md'>
                <span className='text-sm font-medium'>Total Planejado:</span>
                <span className='text-lg font-bold'>{formatCurrency(calculatedTotal)}</span>
              </div>
            </div>

            <div className='flex gap-3 pt-4'>
              <Button type='button' variant='outline' onClick={onClose} className='flex-1'>
                Cancelar
              </Button>
              <Button type='submit' disabled={submitting || formData.items.length === 0} className='flex-1'>
                {submitting ? 'Salvando...' : budget ? 'Atualizar' : 'Criar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
