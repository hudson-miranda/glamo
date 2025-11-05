import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Mail, RefreshCw, X } from 'lucide-react';
import { resendInvite, cancelInvite } from 'wasp/client/operations';
import { useState } from 'react';
import { useToast } from '../../../../components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Invite = {
  id: string;
  salonName: string;
  roleName: string;
  inviterName: string | null;
  createdAt: Date;
  expiresAt: Date;
};

interface InvitesTableProps {
  invites: Invite[];
  onRefresh: () => void;
}

export function InvitesTable({ invites, onRefresh }: InvitesTableProps) {
  const [loadingInviteId, setLoadingInviteId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleResendInvite = async (inviteId: string) => {
    try {
      setLoadingInviteId(inviteId);
      await resendInvite({ inviteId });
      toast({
        title: 'Convite reenviado',
        description: 'O convite foi reenviado com sucesso e a validade foi estendida.',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Erro ao reenviar convite',
        description: error.message || 'Ocorreu um erro ao tentar reenviar o convite.',
        variant: 'destructive',
      });
    } finally {
      setLoadingInviteId(null);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      setLoadingInviteId(inviteId);
      await cancelInvite({ inviteId });
      toast({
        title: 'Convite cancelado',
        description: 'O convite foi cancelado com sucesso.',
      });
      onRefresh();
    } catch (error: any) {
      toast({
        title: 'Erro ao cancelar convite',
        description: error.message || 'Ocorreu um erro ao tentar cancelar o convite.',
        variant: 'destructive',
      });
    } finally {
      setLoadingInviteId(null);
    }
  };

  const isExpiringSoon = (expiresAt: Date) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffDays = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email Convidado</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Enviado por</TableHead>
          <TableHead>Enviado em</TableHead>
          <TableHead>Expira em</TableHead>
          <TableHead className='text-right'>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invites.map((invite) => (
          <TableRow key={invite.id}>
            <TableCell className='font-medium flex items-center gap-2'>
              <Mail className='h-4 w-4 text-muted-foreground' />
              {invite.salonName}
            </TableCell>
            <TableCell>
              <Badge variant='outline'>
                {invite.roleName.charAt(0).toUpperCase() + invite.roleName.slice(1)}
              </Badge>
            </TableCell>
            <TableCell className='text-muted-foreground'>
              {invite.inviterName || 'Sistema'}
            </TableCell>
            <TableCell className='text-sm text-muted-foreground'>
              {formatDistanceToNow(new Date(invite.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </TableCell>
            <TableCell>
              <div className='flex items-center gap-2'>
                <span
                  className={`text-sm ${
                    isExpiringSoon(invite.expiresAt)
                      ? 'text-destructive font-medium'
                      : 'text-muted-foreground'
                  }`}
                >
                  {formatDistanceToNow(new Date(invite.expiresAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
                {isExpiringSoon(invite.expiresAt) && (
                  <Badge variant='destructive' className='text-xs'>
                    Expirando
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className='text-right'>
              <div className='flex items-center justify-end gap-2'>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleResendInvite(invite.id)}
                  disabled={loadingInviteId === invite.id}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${
                      loadingInviteId === invite.id ? 'animate-spin' : ''
                    }`}
                  />
                  <span className='sr-only'>Reenviar</span>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => handleCancelInvite(invite.id)}
                  disabled={loadingInviteId === invite.id}
                  className='text-destructive hover:text-destructive'
                >
                  <X className='h-4 w-4' />
                  <span className='sr-only'>Cancelar</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
