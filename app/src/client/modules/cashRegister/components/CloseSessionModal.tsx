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
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, CheckCircle } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Alert, AlertDescription } from '../../../../components/ui/alert';

const closeSessionSchema = z.object({
  actualBalance: z.number().min(0, 'Saldo real deve ser maior ou igual a 0'),
  notes: z.string().max(500).optional(),
});

type CloseSessionFormData = z.infer<typeof closeSessionSchema>;

interface CloseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CloseSessionFormData) => Promise<void>;
  session: any;
  isLoading?: boolean;
}

export function CloseSessionModal({
  isOpen,
  onClose,
  onSubmit,
  session,
  isLoading = false,
}: CloseSessionModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<CloseSessionFormData>({
    resolver: zodResolver(closeSessionSchema),
    defaultValues: {
      actualBalance: session?.expectedBalance || 0,
      notes: '',
    },
  });

  const actualBalance = watch('actualBalance');
  const difference = actualBalance - (session?.expectedBalance || 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleFormSubmit = async (data: CloseSessionFormData) => {
    await onSubmit(data);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Fechar Caixa</DialogTitle>
          <DialogDescription>
            Informe o saldo real contado no caixa para fechar a sessão
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Summary */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-accent/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Saldo Inicial</p>
              <p className="text-lg font-semibold">
                {formatCurrency(session?.openingBalance || 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saldo Esperado</p>
              <p className="text-lg font-semibold text-primary">
                {formatCurrency(session?.expectedBalance || 0)}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="actualBalance">Saldo Real Contado (R$) *</Label>
              <Input
                id="actualBalance"
                type="number"
                step="0.01"
                {...register('actualBalance', { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.actualBalance ? 'border-red-500' : ''}
                autoFocus
              />
              {errors.actualBalance && (
                <p className="text-sm text-red-500">{errors.actualBalance.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Conte o dinheiro físico no caixa e informe o valor total
              </p>
            </div>

            {/* Difference Alert */}
            {Math.abs(difference) > 0.01 && (
              <Alert variant={difference > 0 ? 'default' : 'destructive'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {difference > 0 ? 'Sobra de Caixa' : 'Falta de Caixa'}
                    </p>
                    <p className="text-xs mt-1">
                      Diferença de {formatCurrency(Math.abs(difference))}
                    </p>
                  </div>
                  {difference > 0 ? (
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-500" />
                  )}
                </AlertDescription>
              </Alert>
            )}

            {Math.abs(difference) < 0.01 && actualBalance > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Caixa Confere!</p>
                  <p className="text-xs mt-1">
                    O saldo contado está de acordo com o esperado
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                {...register('notes')}
                placeholder="Observações sobre o fechamento..."
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
                Fechar Caixa
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
