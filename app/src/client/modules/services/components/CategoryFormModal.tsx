import { useEffect } from 'react';
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
import { Switch } from '../../../../components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
  active: z.boolean(),
  type: z.enum(['SERVICE', 'PRODUCT', 'BOTH']),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface Category {
  id: string;
  name: string;
  description?: string | null;
  active: boolean;
  type: 'SERVICE' | 'PRODUCT' | 'BOTH';
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  category?: Category | null;
  isLoading?: boolean;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category,
  isLoading = false,
}: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      active: true,
      type: 'BOTH' as const,
    },
  });

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          description: category.description || '',
          active: category.active,
          type: category.type || 'BOTH',
        });
      } else {
        reset({
          name: '',
          description: '',
          active: true,
          type: 'BOTH',
        });
      }
    }
  }, [isOpen, reset, category]);

  const handleFormSubmit = async (data: CategoryFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {category 
              ? 'Atualize as informações da categoria'
              : 'Preencha os campos para criar uma nova categoria'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
          <div className='space-y-4'>
            {/* Nome */}
            <div>
              <Label htmlFor="name">
                Nome da Categoria <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Ex: Cabelo, Barba, Estética"
                className={errors.name ? 'border-red-500' : ''}
                maxLength={100}
              />
              {errors.name ? (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {watch('name')?.length || 0}/100 caracteres
                </p>
              )}
            </div>

            {/* Descrição */}
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descrição detalhada da categoria..."
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {watch('description')?.length || 0}/500 caracteres
              </p>
            </div>

            {/* Tipo */}
            <div>
              <Label htmlFor="type">
                Tipo de Categoria <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('type')}
                onValueChange={(value) => setValue('type', value as 'SERVICE' | 'PRODUCT' | 'BOTH')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOTH">
                    <div className="flex flex-col">
                      <span className="font-medium">Ambos</span>
                      <span className="text-xs text-muted-foreground">Pode ser usada em serviços e produtos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="SERVICE">
                    <div className="flex flex-col">
                      <span className="font-medium">Apenas Serviços</span>
                      <span className="text-xs text-muted-foreground">Aparece somente em serviços</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="PRODUCT">
                    <div className="flex flex-col">
                      <span className="font-medium">Apenas Produtos</span>
                      <span className="text-xs text-muted-foreground">Aparece somente em produtos</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {watch('type') === 'BOTH' && 'Esta categoria estará disponível tanto para produtos quanto para serviços'}
                {watch('type') === 'SERVICE' && 'Esta categoria estará disponível apenas para serviços'}
                {watch('type') === 'PRODUCT' && 'Esta categoria estará disponível apenas para produtos'}
              </p>
            </div>

            {/* Ativo */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="active">Categoria Ativa</Label>
                <p className="text-sm text-muted-foreground">
                  Categorias inativas não aparecem na seleção de serviços
                </p>
              </div>
              <Switch
                id="active"
                checked={watch('active')}
                onCheckedChange={(checked) => setValue('active', checked)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {category ? 'Atualizar' : 'Criar'} Categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
