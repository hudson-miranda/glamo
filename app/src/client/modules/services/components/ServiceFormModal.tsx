import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Badge } from '../../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { Separator } from '../../../../components/ui/separator';
import { Loader2, Plus, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '../../../../components/ui/use-toast';

// Validation schema
const serviceSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().optional(),
  defaultPrice: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  defaultDuration: z.number().min(1, 'Duração deve ser pelo menos 1 minuto'),
  active: z.boolean().optional(),
  requiresDeposit: z.boolean().optional(),
  depositAmount: z.number().min(0).optional(),
  allowOnlineBooking: z.boolean().optional(),
  color: z.string().optional(),
  imageUrl: z.string().url('URL inválida').optional().or(z.literal('')),
  instructions: z.string().max(1000).optional(),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

interface ServiceVariant {
  id?: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  active: boolean;
}

interface Service {
  id: string;
  name: string;
  description?: string | null;
  categoryId?: string | null;
  defaultPrice: number;
  defaultDuration: number;
  active: boolean;
  requiresDeposit?: boolean;
  depositAmount?: number | null;
  allowOnlineBooking?: boolean;
  color?: string | null;
  imageUrl?: string | null;
  instructions?: string | null;
  variants?: ServiceVariant[];
}

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ServiceFormData, variants: ServiceVariant[]) => Promise<void>;
  onSubmitVariant?: (serviceId: string, variant: ServiceVariant) => Promise<void>;
  onDeleteVariant?: (serviceId: string, variantId: string) => Promise<void>;
  service?: Service | null;
  isLoading?: boolean;
}

export function ServiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  onSubmitVariant,
  onDeleteVariant,
  service,
  isLoading = false,
}: ServiceFormModalProps) {
  const { toast } = useToast();
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [editingVariant, setEditingVariant] = useState<ServiceVariant | null>(null);
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      defaultPrice: 0,
      defaultDuration: 30,
      active: true,
      requiresDeposit: false,
      depositAmount: 0,
      allowOnlineBooking: true,
      color: '#8B5CF6',
      imageUrl: '',
      instructions: '',
    },
  });

  const requiresDeposit = watch('requiresDeposit');

  // Reset form when service changes or modal opens
  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description || '',
        categoryId: service.categoryId || '',
        defaultPrice: service.defaultPrice,
        defaultDuration: service.defaultDuration,
        active: service.active,
        requiresDeposit: service.requiresDeposit || false,
        depositAmount: service.depositAmount || 0,
        allowOnlineBooking: service.allowOnlineBooking !== false,
        color: service.color || '#8B5CF6',
        imageUrl: service.imageUrl || '',
        instructions: service.instructions || '',
      });
      setVariants(service.variants || []);
    } else {
      reset();
      setVariants([]);
    }
    setIsAddingVariant(false);
    setEditingVariant(null);
  }, [service, reset, isOpen]);

  const handleFormSubmit = async (data: ServiceFormData) => {
    try {
      await onSubmit(data, variants);
      toast({
        title: service ? 'Serviço atualizado' : 'Serviço criado',
        description: service 
          ? 'Serviço atualizado com sucesso' 
          : 'Novo serviço adicionado',
      });
      onClose();
      reset();
      setVariants([]);
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar serviço',
        variant: 'destructive',
      });
    }
  };

  const handleAddVariant = () => {
    setEditingVariant({
      name: '',
      description: '',
      price: watch('defaultPrice'),
      duration: watch('defaultDuration'),
      active: true,
    });
    setIsAddingVariant(true);
  };

  const handleSaveVariant = async () => {
    if (!editingVariant || !editingVariant.name || editingVariant.price <= 0 || editingVariant.duration <= 0) {
      toast({
        title: 'Dados inválidos',
        description: 'Preencha todos os campos obrigatórios',
        variant: 'destructive',
      });
      return;
    }

    if (service?.id && onSubmitVariant) {
      // Save directly to backend if editing existing service
      try {
        await onSubmitVariant(service.id, editingVariant);
        toast({
          title: 'Variante salva',
          description: 'Variante adicionada com sucesso',
        });
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao salvar variante',
          variant: 'destructive',
        });
        return;
      }
    }

    // Update local state
    if (editingVariant.id) {
      setVariants(variants.map(v => v.id === editingVariant.id ? editingVariant : v));
    } else {
      setVariants([...variants, { ...editingVariant, id: `temp-${Date.now()}` }]);
    }

    setEditingVariant(null);
    setIsAddingVariant(false);
  };

  const handleEditVariant = (variant: ServiceVariant) => {
    setEditingVariant({ ...variant });
    setIsAddingVariant(true);
  };

  const handleDeleteVariant = async (variant: ServiceVariant) => {
    if (service?.id && variant.id && onDeleteVariant && !variant.id.startsWith('temp-')) {
      try {
        await onDeleteVariant(service.id, variant.id);
        toast({
          title: 'Variante removida',
          description: 'Variante removida com sucesso',
        });
      } catch (error: any) {
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao remover variante',
          variant: 'destructive',
        });
        return;
      }
    }

    setVariants(variants.filter(v => v.id !== variant.id));
  };

  const handleCancelVariant = () => {
    setEditingVariant(null);
    setIsAddingVariant(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar Serviço' : 'Novo Serviço'}</DialogTitle>
          <DialogDescription>
            {service
              ? 'Atualize as informações do serviço e suas variantes'
              : 'Preencha os dados do novo serviço'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="service" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="service">Informações do Serviço</TabsTrigger>
            <TabsTrigger value="variants">Variantes ({variants.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="service" className="space-y-6 mt-6">
            <form onSubmit={handleSubmit(handleFormSubmit)} id="service-form" className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Básicas</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="name">Nome do Serviço *</Label>
                    <Input
                      id="name"
                      {...register('name')}
                      placeholder="Ex: Corte de Cabelo Masculino"
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder="Descrição detalhada do serviço..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="categoryId">Categoria</Label>
                      <Input
                        id="categoryId"
                        {...register('categoryId')}
                        placeholder="Ex: Cabelo, Unha, Estética"
                      />
                  </div>

                  <div>
                    <Label htmlFor="color">Cor (Agenda)</Label>
                    <Input
                      id="color"
                      type="color"
                      {...register('color')}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Duration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Preço e Duração Padrão</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="defaultPrice">Preço Padrão (R$) *</Label>
                    <Input
                      id="defaultPrice"
                      type="number"
                      step="0.01"
                      {...register('defaultPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                      className={errors.defaultPrice ? 'border-red-500' : ''}
                    />
                    {errors.defaultPrice && (
                      <p className="text-sm text-red-500 mt-1">{errors.defaultPrice.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="defaultDuration">Duração Padrão (min) *</Label>
                    <Input
                      id="defaultDuration"
                      type="number"
                      {...register('defaultDuration', { valueAsNumber: true })}
                      placeholder="30"
                      className={errors.defaultDuration ? 'border-red-500' : ''}
                    />
                    {errors.defaultDuration && (
                      <p className="text-sm text-red-500 mt-1">{errors.defaultDuration.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Configurações</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="active"
                      {...register('active')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="active" className="cursor-pointer">
                      Serviço ativo (visível para agendamento)
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="allowOnlineBooking"
                      {...register('allowOnlineBooking')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="allowOnlineBooking" className="cursor-pointer">
                      Permitir agendamento online
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="requiresDeposit"
                      {...register('requiresDeposit')}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="requiresDeposit" className="cursor-pointer">
                      Requer sinal/depósito
                    </Label>
                  </div>

                  {requiresDeposit && (
                    <div className="ml-6">
                      <Label htmlFor="depositAmount">Valor do Sinal (R$)</Label>
                      <Input
                        id="depositAmount"
                        type="number"
                        step="0.01"
                        {...register('depositAmount', { valueAsNumber: true })}
                        placeholder="0.00"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Adicionais</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="instructions">Instruções/Preparação</Label>
                    <Textarea
                      id="instructions"
                      {...register('instructions')}
                      placeholder="Ex: Lavar o cabelo antes, trazer fotos de referência..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">URL da Imagem</Label>
                    <Input
                      id="imageUrl"
                      {...register('imageUrl')}
                      placeholder="https://..."
                      className={errors.imageUrl ? 'border-red-500' : ''}
                    />
                    {errors.imageUrl && (
                      <p className="text-sm text-red-500 mt-1">{errors.imageUrl.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="variants" className="space-y-4 mt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Variantes do Serviço</h3>
                <p className="text-sm text-muted-foreground">
                  Crie variações de preço e duração (ex: curto, médio, longo)
                </p>
              </div>
              <Button type="button" onClick={handleAddVariant} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nova Variante
              </Button>
            </div>

            <Separator />

            {isAddingVariant && editingVariant && (
              <div className="border rounded-lg p-4 space-y-4 bg-accent/50">
                <h4 className="font-medium">
                  {editingVariant.id ? 'Editar Variante' : 'Nova Variante'}
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Nome da Variante *</Label>
                    <Input
                      value={editingVariant.name}
                      onChange={(e) => setEditingVariant({...editingVariant, name: e.target.value})}
                      placeholder="Ex: Cabelo Curto"
                    />
                  </div>

                  <div>
                    <Label>Preço (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={editingVariant.price}
                      onChange={(e) => setEditingVariant({...editingVariant, price: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Duração (min) *</Label>
                    <Input
                      type="number"
                      value={editingVariant.duration}
                      onChange={(e) => setEditingVariant({...editingVariant, duration: parseInt(e.target.value) || 0})}
                      placeholder="30"
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={editingVariant.description || ''}
                      onChange={(e) => setEditingVariant({...editingVariant, description: e.target.value})}
                      placeholder="Descrição opcional..."
                      rows={2}
                    />
                  </div>

                  <div className="col-span-2 flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="variant-active"
                      checked={editingVariant.active}
                      onChange={(e) => setEditingVariant({...editingVariant, active: e.target.checked})}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="variant-active" className="cursor-pointer">
                      Variante ativa
                    </Label>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" onClick={handleSaveVariant} size="sm">
                    Salvar Variante
                  </Button>
                  <Button type="button" onClick={handleCancelVariant} variant="outline" size="sm">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {variants.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhuma variante adicionada</p>
                  <p className="text-sm">Clique em "Nova Variante" para adicionar</p>
                </div>
              ) : (
                variants.map((variant) => (
                  <div key={variant.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{variant.name}</h4>
                        <Badge variant={variant.active ? 'success' : 'secondary'}>
                          {variant.active ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      {variant.description && (
                        <p className="text-sm text-muted-foreground mt-1">{variant.description}</p>
                      )}
                      <div className="flex gap-4 mt-2 text-sm">
                        <span className="font-medium">
                          R$ {variant.price.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground">
                          {variant.duration} min
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditVariant(variant)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteVariant(variant)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
            Cancelar
          </Button>
          <Button type="submit" form="service-form" disabled={isSubmitting || isLoading}>
            {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {service ? 'Atualizar' : 'Criar'} Serviço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
