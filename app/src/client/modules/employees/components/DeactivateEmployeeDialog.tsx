import { useState } from 'react';
import { deactivateEmployee } from 'wasp/client/operations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { useToast } from '../../../../components/ui/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '../../../../components/ui/alert';

type Employee = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  roles: Array<{ id: string; name: string }>;
  isActive: boolean;
  createdAt: Date;
};

interface DeactivateEmployeeDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeactivateEmployeeDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: DeactivateEmployeeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleDeactivate = async () => {
    try {
      setIsSubmitting(true);
      await deactivateEmployee({ userSalonId: employee.id });

      toast({
        title: 'Funcionário desativado',
        description: `${employee.userName || employee.userEmail} foi desativado com sucesso.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao desativar funcionário',
        description: error.message || 'Ocorreu um erro ao tentar desativar o funcionário.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-5 w-5' />
            Desativar Funcionário
          </DialogTitle>
          <DialogDescription>
            Esta ação removerá o acesso do funcionário ao negócio.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <Alert variant='destructive'>
            <AlertTriangle className='h-4 w-4' />
            <AlertDescription>
              <strong>Atenção:</strong> Ao desativar este funcionário, ele perderá acesso
              imediato a todas as funcionalidades do negócio. Esta ação não exclui o cadastro,
              apenas desativa o acesso.
            </AlertDescription>
          </Alert>

          <div className='rounded-md border border-input bg-muted p-4'>
            <p className='text-sm font-medium text-muted-foreground mb-1'>Funcionário</p>
            <p className='font-semibold'>{employee.userName || 'Sem nome'}</p>
            <p className='text-sm text-muted-foreground'>{employee.userEmail}</p>
            <div className='mt-2'>
              <p className='text-sm font-medium text-muted-foreground mb-1'>Função Atual</p>
              <p className='text-sm'>
                {employee.roles[0]?.name.charAt(0).toUpperCase() +
                  employee.roles[0]?.name.slice(1)}
              </p>
            </div>
          </div>

          <div className='rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-4'>
            <p className='text-sm text-amber-800 dark:text-amber-200'>
              💡 <strong>Dica:</strong> Você pode reativar este funcionário posteriormente
              através do histórico de membros.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={handleDeactivate}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Desativando...
              </>
            ) : (
              'Desativar Funcionário'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
