import { useState } from 'react';
import { useQuery, getPendingInvites, listEmployees } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';
import { Users, UserPlus, Mail } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { EmployeesTable } from './components/EmployeesTable';
import { InvitesTable } from './components/InvitesTable';
import { InviteEmployeeDialog } from './components/InviteEmployeeDialog';
import { PlanLimitsBadge } from './components/PlanLimitsBadge';

export default function EmployeesPage() {
  const { activeSalonId } = useSalonContext();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Fetch employees
  const {
    data: employees,
    isLoading: loadingEmployees,
    error: employeesError,
    refetch: refetchEmployees,
  } = useQuery(listEmployees, undefined, {
    enabled: !!activeSalonId,
  });

  // Fetch pending invites
  const {
    data: invites,
    isLoading: loadingInvites,
    error: invitesError,
    refetch: refetchInvites,
  } = useQuery(getPendingInvites, undefined, {
    enabled: !!activeSalonId,
  });

  const handleRefresh = () => {
    refetchEmployees();
    refetchInvites();
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-start justify-between'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight'>Equipe</h1>
          <p className='text-muted-foreground'>
            Gerencie os funcionários e convites do seu negócio
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <PlanLimitsBadge currentCount={employees?.length || 0} />
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className='mr-2 h-4 w-4' />
            Convidar Funcionário
          </Button>
        </div>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Users className='h-5 w-5' />
            Funcionários Ativos
          </CardTitle>
          <CardDescription>
            Membros da equipe com acesso ao negócio
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          {loadingEmployees ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-muted-foreground'>Carregando funcionários...</p>
            </div>
          ) : employeesError ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-destructive'>
                Erro ao carregar funcionários: {employeesError.message}
              </p>
            </div>
          ) : !employees || employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title='Nenhum funcionário'
              description='Comece enviando convites para sua equipe'
              action={
                <Button onClick={() => setIsInviteDialogOpen(true)}>
                  <UserPlus className='mr-2 h-4 w-4' />
                  Convidar Funcionário
                </Button>
              }
            />
          ) : (
            <EmployeesTable employees={employees} onRefresh={handleRefresh} />
          )}
        </CardContent>
      </Card>

      {/* Pending Invites Table */}
      {invites && invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Mail className='h-5 w-5' />
              Convites Pendentes
            </CardTitle>
            <CardDescription>
              Convites enviados aguardando resposta
            </CardDescription>
          </CardHeader>
          <CardContent className='p-0'>
            {loadingInvites ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-muted-foreground'>Carregando convites...</p>
              </div>
            ) : invitesError ? (
              <div className='flex items-center justify-center p-8'>
                <p className='text-sm text-destructive'>
                  Erro ao carregar convites: {invitesError.message}
                </p>
              </div>
            ) : (
              <InvitesTable invites={invites} onRefresh={handleRefresh} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <InviteEmployeeDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
