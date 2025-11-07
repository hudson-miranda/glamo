import { useState } from 'react';
import { useQuery, getPendingInvites, listEmployees } from 'wasp/client/operations';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';
import { Users, UserPlus, Mail } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { InvitesTable } from './components/InvitesTable';
import { PlanLimitsBadge } from './components/PlanLimitsBadge';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { activeSalonId } = useSalonContext();

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
            Gerencie os colaboradores do seu negócio. Ao cadastrar um colaborador com e-mail, um convite será enviado automaticamente.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <PlanLimitsBadge currentCount={employees?.employees?.length || 0} />
          <Button 
            onClick={() => navigate('/employees/new')}
            className='bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 text-white shadow-lg shadow-brand-500/30'
          >
            <UserPlus className='mr-2 h-4 w-4' />
            Cadastrar Colaborador
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
          ) : !employees || employees.employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title='Nenhum colaborador cadastrado'
              description='Cadastre seu primeiro colaborador para começar a gerenciar sua equipe'
              action={
                <Button onClick={() => navigate('/employees/new')}>
                  <UserPlus className='mr-2 h-4 w-4' />
                  Cadastrar Colaborador
                </Button>
              }
            />
          ) : (
            <div className='p-4'>
              <div className='space-y-2'>
                {employees.employees.map((employee: any) => (
                  <div key={employee.id} className='flex items-center justify-between p-3 border rounded-lg'>
                    <div>
                      <p className='font-medium'>{employee.name}</p>
                      {employee.email && <p className='text-sm text-gray-500'>{employee.email}</p>}
                      {employee.phone && <p className='text-sm text-gray-500'>{employee.phone}</p>}
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className={`px-2 py-1 rounded text-xs ${employee.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {employee.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <Button 
                        size='sm' 
                        variant='outline'
                        onClick={() => navigate(`/employees/${employee.id}/edit` as any)}
                      >
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
    </div>
  );
}
