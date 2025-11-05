import { useState } from 'react';
import { useQuery, updateEmployeeRole, listSalonRoles } from 'wasp/client/operations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { useToast } from '../../../../components/ui/use-toast';
import { Loader2 } from 'lucide-react';

type Employee = {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  roles: Array<{ id: string; name: string }>;
  isActive: boolean;
  createdAt: Date;
};

interface EditRoleDialogProps {
  employee: Employee;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditRoleDialog({
  employee,
  open,
  onOpenChange,
  onSuccess,
}: EditRoleDialogProps) {
  const currentRoleId = employee.roles[0]?.id || '';
  const [newRoleId, setNewRoleId] = useState(currentRoleId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch available roles
  const { data: roles, isLoading: loadingRoles } = useQuery(listSalonRoles, undefined, {
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newRoleId) {
      toast({
        title: 'Selecione uma função',
        description: 'Por favor, selecione a nova função para o funcionário.',
        variant: 'destructive',
      });
      return;
    }

    if (newRoleId === currentRoleId) {
      toast({
        title: 'Mesma função',
        description: 'O funcionário já possui essa função.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await updateEmployeeRole({
        userSalonId: employee.id,
        newRoleId,
      });

      toast({
        title: 'Função atualizada!',
        description: `A função de ${employee.userName || employee.userEmail} foi atualizada com sucesso.`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar função',
        description: error.message || 'Ocorreu um erro ao tentar atualizar a função.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out 'client' role and 'owner' role
  const availableRoles = Array.isArray(roles) 
    ? roles.filter(
        (role: any) =>
          role.name.toLowerCase() !== 'client' && role.name.toLowerCase() !== 'owner'
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Alterar Função</DialogTitle>
          <DialogDescription>
            Altere a função de {employee.userName || employee.userEmail} no salão.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>Funcionário</Label>
            <div className='rounded-md border border-input bg-muted px-3 py-2'>
              <p className='font-medium'>{employee.userName || 'Sem nome'}</p>
              <p className='text-sm text-muted-foreground'>{employee.userEmail}</p>
            </div>
          </div>

          <div className='space-y-2'>
            <Label>Função Atual</Label>
            <div className='rounded-md border border-input bg-muted px-3 py-2'>
              <p className='font-medium'>
                {employee.roles[0]?.name.charAt(0).toUpperCase() +
                  employee.roles[0]?.name.slice(1)}
              </p>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='newRole'>Nova Função *</Label>
            {loadingRoles ? (
              <div className='flex items-center justify-center p-4'>
                <Loader2 className='h-4 w-4 animate-spin' />
              </div>
            ) : (
              <Select value={newRoleId} onValueChange={setNewRoleId} disabled={isSubmitting}>
                <SelectTrigger id='newRole'>
                  <SelectValue placeholder='Selecione uma nova função' />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role: any) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className='flex flex-col items-start'>
                        <span className='font-medium'>
                          {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                        </span>
                        {role.description && (
                          <span className='text-xs text-muted-foreground'>
                            {role.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
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
            <Button type='submit' disabled={isSubmitting || !newRoleId || newRoleId === currentRoleId}>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Atualizando...
                </>
              ) : (
                'Atualizar Função'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
