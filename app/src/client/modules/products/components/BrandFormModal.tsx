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
import { Loader2 } from 'lucide-react';

const brandSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  description: z.string().max(500).optional(),
});

type BrandFormData = z.infer<typeof brandSchema>;

interface Brand {
  id: string;
  name: string;
  description?: string | null;
}

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BrandFormData) => Promise<void>;
  brand?: Brand | null;
  isLoading?: boolean;
}

export function BrandFormModal({
  isOpen,
  onClose,
  onSubmit,
  brand,
  isLoading = false,
}: BrandFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (brand) {
        reset({
          name: brand.name,
          description: brand.description || '',
        });
      } else {
        reset({
          name: '',
          description: '',
        });
      }
    }
  }, [isOpen, reset, brand]);

  const handleFormSubmit = async (data: BrandFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle>
            {brand ? 'Editar Marca' : 'Nova Marca'}
          </DialogTitle>
          <DialogDescription>
            {brand 
              ? 'Atualize as informações da marca'
              : 'Preencha os campos para criar uma nova marca'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor="name">
              Nome da Marca <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: L'Oréal, Wella, Salon Line"
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

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Descrição da marca..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {watch('description')?.length || 0}/500 caracteres
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {(isSubmitting || isLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {brand ? 'Atualizar' : 'Criar'} Marca
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
