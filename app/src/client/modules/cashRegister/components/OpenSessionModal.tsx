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
import { Loader2, DollarSign } from 'lucide-react';

const openSessionSchema = z.object({
  openingBalance: z.number().min(0, 'Saldo inicial deve ser maior ou igual a 0'),
  notes: z.string().max(500).optional(),
});

type OpenSessionFormData = z.infer<typeof openSessionSchema>;

interface OpenSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: OpenSessionFormData) => Promise<void>;
  isLoading?: boolean;
}

export function OpenSessionModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: OpenSessionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<OpenSessionFormData>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      openingBalance: 0,
      notes: '',
    },
  });

  const handleFormSubmit = async (data: OpenSessionFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Abrir Caixa
          </DialogTitle>
          <DialogDescription>
            Informe o saldo inicial para abrir uma nova sessão de caixa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openingBalance">Saldo Inicial (R$) *</Label>
            <Input
              id="openingBalance"
              type="number"
              step="0.01"
              {...register('openingBalance', { valueAsNumber: true })}
              placeholder="0.00"
              className={errors.openingBalance ? 'border-red-500' : ''}
              autoFocus
            />
            {errors.openingBalance && (
              <p className="text-sm text-red-500">{errors.openingBalance.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Informe o valor em dinheiro disponível no início do expediente
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Input
              id="notes"
              {...register('notes')}
              placeholder="Observações sobre a abertura..."
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
              Abrir Caixa
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
