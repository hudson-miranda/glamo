import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createCategory } from 'wasp/client/operations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (categoryId: string) => void;
  salonId: string;
}

interface CategoryFormData {
  name: string;
  description?: string;
  type: 'SERVICE' | 'PRODUCT' | 'BOTH';
}

export function CategoryModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  salonId 
}: CategoryModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<'SERVICE' | 'PRODUCT' | 'BOTH'>('BOTH');
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CategoryFormData>({
    defaultValues: {
      type: 'BOTH'
    }
  });

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    try {
      const result = await createCategory({
        salonId,
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        type: selectedType,
      });

      toast({
        title: 'Categoria criada',
        description: 'Nova categoria adicionada com sucesso',
      });

      reset();
      onSuccess(result.id);
    } catch (error: any) {
      toast({
        title: 'Erro ao criar categoria',
        description: error.message || 'Ocorreu um erro ao criar a categoria',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      reset();
      setSelectedType('BOTH');
      onClose();
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Prevent closing during submission
    if (!open && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange} modal>
      <DialogContent 
        className="sm:max-w-[425px]"
        onPointerDownOutside={(e) => {
          // Prevent closing when clicking outside during submission
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent interaction with parent modal
          if (isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Nova Categoria</DialogTitle>
          <DialogDescription>
            Crie uma nova categoria para organizar seus serviços
          </DialogDescription>
        </DialogHeader>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmit)(e);
          }} 
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">
              Nome da categoria <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Ex: Cabelo, Estética, Manicure"
              maxLength={100}
              {...register('name', {
                required: 'Nome é obrigatório',
                minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
                maxLength: { value: 100, message: 'Nome deve ter no máximo 100 caracteres' },
              })}
              className={errors.name ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição opcional da categoria"
              maxLength={500}
              rows={3}
              {...register('description', {
                maxLength: { value: 500, message: 'Descrição deve ter no máximo 500 caracteres' },
              })}
              className={errors.description ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Tipo de Categoria <span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as 'SERVICE' | 'PRODUCT' | 'BOTH')}
              disabled={isSubmitting}
            >
              <SelectTrigger id="type">
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
            <p className="text-xs text-muted-foreground">
              {selectedType === 'BOTH' && 'Esta categoria estará disponível tanto para produtos quanto para serviços'}
              {selectedType === 'SERVICE' && 'Esta categoria estará disponível apenas para serviços'}
              {selectedType === 'PRODUCT' && 'Esta categoria estará disponível apenas para produtos'}
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
