import { useState } from 'react';
import { useQuery, sendSalonInvite, listSalonRoles } from 'wasp/client/operations';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';
import { useToast } from '../../../../components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface InviteEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteEmployeeDialog({
  open,
  onOpenChange,
  onSuccess,
}: InviteEmployeeDialogProps) {
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch available roles
  const { data: roles, isLoading: loadingRoles } = useQuery(listSalonRoles, undefined, {
    enabled: open,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !roleId) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Por favor, preencha o email e selecione uma função.',
        variant: 'destructive',
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, verifique o email informado.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await sendSalonInvite({ email, roleTemplate: roleId }); // Changed from roleId to roleTemplate
      
      toast({
        title: 'Convite enviado!',
        description: `Um convite foi enviado para ${email}.`,
      });

      // Reset form
      setEmail('');
      setRoleId('');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar convite',
        description: error.message || 'Ocorreu um erro ao tentar enviar o convite.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter out 'client' role and 'owner' role for invites
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
          <DialogTitle>Convidar Funcionário</DialogTitle>
          <DialogDescription>
            Envie um convite por email para adicionar um novo membro à sua equipe.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email *</Label>
            <Input
              id='email'
              type='email'
              placeholder='funcionario@exemplo.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <p className='text-xs text-muted-foreground'>
              O convite será enviado para este endereço de email
            </p>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='role'>Função *</Label>
            {loadingRoles ? (
              <div className='flex items-center justify-center p-4'>
                <Loader2 className='h-4 w-4 animate-spin' />
              </div>
            ) : (
              <Select value={roleId} onValueChange={setRoleId} disabled={isSubmitting}>
                <SelectTrigger id='role'>
                  <SelectValue placeholder='Selecione uma função' />
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
            <p className='text-xs text-muted-foreground'>
              Define o nível de acesso e permissões do funcionário
            </p>
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
            <Button type='submit' disabled={isSubmitting || !email || !roleId}>
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Enviando...
                </>
              ) : (
                'Enviar Convite'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
