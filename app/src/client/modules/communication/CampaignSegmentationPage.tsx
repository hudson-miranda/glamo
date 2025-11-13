import { useState } from 'react';
import { useQuery, listSegments, createSegment, updateSegment, deleteSegment, evaluateSegment } from 'wasp/client/operations';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Filter,
  Target,
  TrendingUp,
  CheckCircle,
  XCircle,
  PlayCircle,
} from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { formatDate } from '../../lib/formatters';

const FIELD_OPTIONS = [
  { value: 'status', label: 'Status', type: 'select', options: ['ACTIVE', 'INACTIVE', 'BLOCKED'] },
  { value: 'totalSpent', label: 'Total Gasto', type: 'number' },
  { value: 'visitCount', label: 'Número de Visitas', type: 'number' },
  { value: 'lastVisitDate', label: 'Última Visita', type: 'date' },
  { value: 'createdAt', label: 'Data de Cadastro', type: 'date' },
  { value: 'tags', label: 'Tags', type: 'text' },
  { value: 'city', label: 'Cidade', type: 'text' },
  { value: 'gender', label: 'Gênero', type: 'select', options: ['MALE', 'FEMALE', 'OTHER'] },
];

const OPERATORS = {
  text: [
    { value: 'eq', label: 'é igual a' },
    { value: 'ne', label: 'não é igual a' },
    { value: 'contains', label: 'contém' },
  ],
  number: [
    { value: 'eq', label: 'é igual a' },
    { value: 'ne', label: 'não é igual a' },
    { value: 'gt', label: 'maior que' },
    { value: 'gte', label: 'maior ou igual a' },
    { value: 'lt', label: 'menor que' },
    { value: 'lte', label: 'menor ou igual a' },
    { value: 'between', label: 'entre' },
  ],
  date: [
    { value: 'gt', label: 'depois de' },
    { value: 'gte', label: 'a partir de' },
    { value: 'lt', label: 'antes de' },
    { value: 'lte', label: 'até' },
    { value: 'between', label: 'entre' },
  ],
  select: [
    { value: 'eq', label: 'é igual a' },
    { value: 'ne', label: 'não é igual a' },
    { value: 'in', label: 'está em' },
  ],
};

interface SegmentRule {
  field: string;
  operator: string;
  value: any;
}

export default function CampaignSegmentationPage() {
  const { activeSalonId } = useSalonContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSegment, setEditingSegment] = useState<any>(null);
  const [evaluating, setEvaluating] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery(
    listSegments,
    { salonId: activeSalonId || '' },
    { enabled: !!activeSalonId }
  );

  const handleDelete = async (segmentId: string) => {
    if (!confirm('Deseja realmente excluir este segmento? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await deleteSegment({ id: segmentId });
      refetch();
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir segmento');
    }
  };

  const handleEvaluate = async (segmentId: string) => {
    setEvaluating(segmentId);
    try {
      const result = await evaluateSegment({ segmentId });
      alert(`Este segmento contém ${result.count} clientes que atendem aos critérios.`);
    } catch (error: any) {
      alert(error.message || 'Erro ao avaliar segmento');
    } finally {
      setEvaluating(null);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='flex flex-col items-center gap-3'>
          <div className='h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent' />
          <p className='text-sm text-muted-foreground'>Carregando segmentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto py-6 px-4 space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Segmentação de Clientes</h1>
          <p className='text-muted-foreground'>
            Crie grupos dinâmicos de clientes com base em critérios avançados
          </p>
        </div>
        <Button onClick={() => { setEditingSegment(null); setShowCreateDialog(true); }}>
          <Plus className='mr-2 h-4 w-4' />
          Novo Segmento
        </Button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Total de Segmentos</p>
                <p className='text-2xl font-bold'>{data?.segments?.length || 0}</p>
              </div>
              <Target className='h-8 w-8 text-blue-500 opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Segmentos Ativos</p>
                <p className='text-2xl font-bold'>
                  {data?.segments?.filter((s: any) => s.isActive).length || 0}
                </p>
              </div>
              <CheckCircle className='h-8 w-8 text-green-500 opacity-50' />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-muted-foreground'>Total de Clientes Segmentados</p>
                <p className='text-2xl font-bold'>
                  {data?.segments?.reduce((sum: number, s: any) => sum + (s.clientCount || 0), 0) || 0}
                </p>
              </div>
              <Users className='h-8 w-8 text-purple-500 opacity-50' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segments List */}
      {data?.segments && data.segments.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {data.segments.map((segment: any) => (
            <Card key={segment.id} className='hover:shadow-lg transition-shadow'>
              <CardHeader className='pb-3'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1 min-w-0'>
                    <CardTitle className='text-lg truncate'>{segment.name}</CardTitle>
                    {segment.description && (
                      <p className='text-sm text-muted-foreground line-clamp-2 mt-1'>
                        {segment.description}
                      </p>
                    )}
                  </div>
                  <div className='flex gap-1 shrink-0'>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => { setEditingSegment(segment); setShowCreateDialog(true); }}
                    >
                      <Edit className='h-3 w-3' />
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      onClick={() => handleDelete(segment.id)}
                    >
                      <Trash2 className='h-3 w-3 text-destructive' />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='space-y-4'>
                {/* Client Count */}
                <div className='flex items-center justify-between p-3 bg-primary/5 rounded-md'>
                  <div className='flex items-center gap-2'>
                    <Users className='h-4 w-4 text-primary' />
                    <span className='text-sm font-medium'>Clientes no segmento</span>
                  </div>
                  <span className='text-lg font-bold text-primary'>{segment.clientCount || 0}</span>
                </div>

                {/* Status Badge */}
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Status</span>
                  {segment.isActive ? (
                    <Badge className='bg-green-500'>
                      <CheckCircle className='h-3 w-3 mr-1' />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge variant='secondary'>
                      <XCircle className='h-3 w-3 mr-1' />
                      Inativo
                    </Badge>
                  )}
                </div>

                {/* Last Calculated */}
                {segment.lastCalculatedAt && (
                  <div className='flex items-center justify-between text-xs'>
                    <span className='text-muted-foreground'>Última atualização</span>
                    <span>{formatDate(segment.lastCalculatedAt)}</span>
                  </div>
                )}

                {/* Criteria Summary */}
                {segment.criteria && segment.criteria.rules && (
                  <div className='pt-3 border-t'>
                    <p className='text-xs text-muted-foreground mb-2'>Critérios:</p>
                    <div className='space-y-1'>
                      {segment.criteria.rules.slice(0, 2).map((rule: any, idx: number) => {
                        const field = FIELD_OPTIONS.find((f) => f.value === rule.field);
                        return (
                          <div key={idx} className='text-xs bg-muted px-2 py-1 rounded'>
                            <span className='font-medium'>{field?.label || rule.field}</span>
                            {' '}
                            <span className='text-muted-foreground'>{rule.operator}</span>
                            {' '}
                            <span className='font-medium'>{String(rule.value)}</span>
                          </div>
                        );
                      })}
                      {segment.criteria.rules.length > 2 && (
                        <p className='text-xs text-muted-foreground'>
                          +{segment.criteria.rules.length - 2} critério(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className='pt-3 border-t'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='w-full'
                    onClick={() => handleEvaluate(segment.id)}
                    disabled={evaluating === segment.id}
                  >
                    {evaluating === segment.id ? (
                      <>
                        <div className='mr-2 h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent' />
                        Avaliando...
                      </>
                    ) : (
                      <>
                        <PlayCircle className='mr-2 h-3 w-3' />
                        Avaliar Segmento
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className='py-16'>
            <div className='text-center text-muted-foreground'>
              <Filter className='h-16 w-16 mx-auto mb-4 opacity-50' />
              <p className='text-lg font-medium mb-2'>Nenhum segmento criado</p>
              <p className='text-sm mb-4'>
                Crie segmentos para organizar e direcionar suas campanhas de forma mais eficaz
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Criar Primeiro Segmento
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Dialog */}
      {showCreateDialog && (
        <SegmentDialog
          segment={editingSegment}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingSegment(null);
          }}
          onSuccess={() => {
            refetch();
            setShowCreateDialog(false);
            setEditingSegment(null);
          }}
          salonId={activeSalonId || ''}
        />
      )}
    </div>
  );
}

// Segment Dialog Component
function SegmentDialog({ segment, onClose, onSuccess, salonId }: any) {
  const [formData, setFormData] = useState({
    name: segment?.name || '',
    description: segment?.description || '',
    isActive: segment?.isActive !== false,
    logic: segment?.criteria?.logic || 'AND',
    rules: segment?.criteria?.rules || [{ field: '', operator: '', value: '' }] as SegmentRule[],
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const criteria = {
        logic: formData.logic,
        rules: formData.rules.filter((r: SegmentRule) => r.field && r.operator),
      };

      if (segment) {
        await updateSegment({
          id: segment.id,
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
          criteria,
        });
      } else {
        await createSegment({
          salonId,
          name: formData.name,
          description: formData.description,
          criteria,
        });
      }
      onSuccess();
    } catch (error: any) {
      alert(error.message || 'Erro ao salvar segmento');
    } finally {
      setSubmitting(false);
    }
  };

  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, { field: '', operator: '', value: '' }],
    });
  };

  const removeRule = (index: number) => {
    setFormData({
      ...formData,
      rules: formData.rules.filter((_: SegmentRule, i: number) => i !== index),
    });
  };

  const updateRule = (index: number, field: keyof SegmentRule, value: any) => {
    const newRules = [...formData.rules];
    newRules[index] = { ...newRules[index], [field]: value };
    
    // Reset operator and value when field changes
    if (field === 'field') {
      newRules[index].operator = '';
      newRules[index].value = '';
    }
    
    setFormData({ ...formData, rules: newRules });
  };

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto'>
      <Card className='max-w-3xl w-full my-8'>
        <CardHeader>
          <CardTitle>{segment ? 'Editar' : 'Novo'} Segmento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Basic Info */}
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium mb-2'>Nome do Segmento *</label>
                <input
                  type='text'
                  required
                  className='w-full border rounded-md px-3 py-2'
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder='Ex: Clientes VIP'
                />
              </div>

              <div>
                <label className='block text-sm font-medium mb-2'>Descrição</label>
                <textarea
                  className='w-full border rounded-md px-3 py-2 resize-none'
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder='Descreva o propósito deste segmento...'
                />
              </div>

              <div className='flex items-center gap-3'>
                <input
                  type='checkbox'
                  id='isActive'
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className='h-4 w-4'
                />
                <label htmlFor='isActive' className='text-sm font-medium'>
                  Segmento ativo
                </label>
              </div>
            </div>

            {/* Criteria Logic */}
            <div>
              <label className='block text-sm font-medium mb-2'>Lógica dos Critérios</label>
              <div className='flex gap-4'>
                <label className='flex items-center gap-2'>
                  <input
                    type='radio'
                    value='AND'
                    checked={formData.logic === 'AND'}
                    onChange={(e) => setFormData({ ...formData, logic: e.target.value })}
                  />
                  <span className='text-sm'>
                    <strong>E</strong> - Cliente deve atender todos os critérios
                  </span>
                </label>
                <label className='flex items-center gap-2'>
                  <input
                    type='radio'
                    value='OR'
                    checked={formData.logic === 'OR'}
                    onChange={(e) => setFormData({ ...formData, logic: e.target.value })}
                  />
                  <span className='text-sm'>
                    <strong>OU</strong> - Cliente deve atender qualquer critério
                  </span>
                </label>
              </div>
            </div>

            {/* Rules */}
            <div>
              <div className='flex justify-between items-center mb-3'>
                <label className='block text-sm font-medium'>Critérios de Segmentação *</label>
                <Button type='button' size='sm' variant='outline' onClick={addRule}>
                  <Plus className='h-3 w-3 mr-1' />
                  Adicionar Critério
                </Button>
              </div>

              <div className='space-y-3 max-h-96 overflow-y-auto border rounded-md p-3'>
                {formData.rules.map((rule: SegmentRule, index: number) => {
                  const fieldConfig = FIELD_OPTIONS.find((f) => f.value === rule.field);
                  const operators = fieldConfig ? OPERATORS[fieldConfig.type as keyof typeof OPERATORS] || [] : [];

                  return (
                    <div key={index} className='flex gap-2 items-start p-3 bg-muted rounded-md'>
                      {/* Field */}
                      <select
                        className='flex-1 border rounded-md px-2 py-1 text-sm'
                        value={rule.field}
                        onChange={(e) => updateRule(index, 'field', e.target.value)}
                        required
                      >
                        <option value=''>Selecione o campo</option>
                        {FIELD_OPTIONS.map((field) => (
                          <option key={field.value} value={field.value}>
                            {field.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator */}
                      <select
                        className='flex-1 border rounded-md px-2 py-1 text-sm'
                        value={rule.operator}
                        onChange={(e) => updateRule(index, 'operator', e.target.value)}
                        disabled={!rule.field}
                        required
                      >
                        <option value=''>Operador</option>
                        {operators.map((op: { value: string; label: string }) => (
                          <option key={op.value} value={op.value}>
                            {op.label}
                          </option>
                        ))}
                      </select>

                      {/* Value */}
                      {fieldConfig?.type === 'select' && fieldConfig.options ? (
                        <select
                          className='flex-1 border rounded-md px-2 py-1 text-sm'
                          value={rule.value}
                          onChange={(e) => updateRule(index, 'value', e.target.value)}
                          disabled={!rule.operator}
                          required
                        >
                          <option value=''>Valor</option>
                          {fieldConfig.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={fieldConfig?.type === 'number' ? 'number' : fieldConfig?.type === 'date' ? 'date' : 'text'}
                          className='flex-1 border rounded-md px-2 py-1 text-sm'
                          value={rule.value}
                          onChange={(e) => updateRule(index, 'value', e.target.value)}
                          placeholder='Valor'
                          disabled={!rule.operator}
                          required
                        />
                      )}

                      {/* Remove */}
                      {formData.rules.length > 1 && (
                        <Button
                          type='button'
                          size='sm'
                          variant='ghost'
                          onClick={() => removeRule(index)}
                        >
                          <Trash2 className='h-3 w-3 text-destructive' />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className='flex gap-3 pt-4'>
              <Button type='button' variant='outline' onClick={onClose} className='flex-1'>
                Cancelar
              </Button>
              <Button type='submit' disabled={submitting} className='flex-1'>
                {submitting ? 'Salvando...' : segment ? 'Atualizar' : 'Criar Segmento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
