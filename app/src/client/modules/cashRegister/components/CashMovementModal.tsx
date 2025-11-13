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
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

const movementSchema = z.object({
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'ADJUSTMENT']),
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  description: z.string().min(3, 'Descrição deve ter pelo menos 3 caracteres').max(500),
  category: z.string().optional(),
  referenceNumber: z.string().max(100).optional(),
});

type MovementFormData = z.infer<typeof movementSchema>;

interface CashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MovementFormData) => Promise<void>;
  sessionId: string;
  isLoading?: boolean;
}

const movementTypes = [
  { value: 'DEPOSIT', label: 'Entrada (Depósito)', icon: TrendingUp, color: 'text-green-500' },
  { value: 'WITHDRAWAL', label: 'Saída (Sangria)', icon: TrendingDown, color: 'text-red-500' },
  { value: 'ADJUSTMENT', label: 'Ajuste', icon: TrendingUp, color: 'text-blue-500' },
];

export function CashMovementModal({
  isOpen,
  onClose,
  onSubmit,
  sessionId,
  isLoading = false,
}: CashMovementModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<MovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: 'DEPOSIT',
      amount: 0,
      description: '',
      category: '',
      referenceNumber: '',
    },
  });

  const selectedType = watch('type');

  const handleFormSubmit = async (data: MovementFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const currentTypeInfo = movementTypes.find(t => t.value === selectedType);
  const Icon = currentTypeInfo?.icon || TrendingUp;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {Icon && <Icon className={`h-5 w-5 ${currentTypeInfo?.color}`} />}
            Nova Movimentação de Caixa
          </DialogTitle>
          <DialogDescription>
            Registre entradas, saídas ou ajustes no caixa atual
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Movimentação *</Label>
            <Select
              value={selectedType}
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {movementTypes.map((type) => {
                  const TypeIcon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <TypeIcon className={`h-4 w-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder={
                selectedType === 'DEPOSIT'
                  ? 'Ex: Troco recebido do banco'
                  : selectedType === 'WITHDRAWAL'
                  ? 'Ex: Retirada para depósito bancário'
                  : 'Ex: Correção de valor'
              }
              rows={3}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              {...register('category')}
              placeholder="Ex: Banco, Fornecedor, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="referenceNumber">Número de Referência</Label>
            <Input
              id="referenceNumber"
              {...register('referenceNumber')}
              placeholder="Ex: Comprovante, nota fiscal..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || isLoading}>
              {(isSubmitting || isLoading) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrar Movimentação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
