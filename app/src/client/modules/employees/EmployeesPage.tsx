import { useState, useMemo } from 'react';
import { useQuery, getPendingInvites, listEmployees } from 'wasp/client/operations';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Users, UserPlus, Mail, Search, UserCheck, UserX, CalendarCheck } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';
import { InvitesTable } from './components/InvitesTable';
import { PlanLimitsBadge } from './components/PlanLimitsBadge';

export default function EmployeesPage() {
  const navigate = useNavigate();
  const { activeSalonId } = useSalonContext();
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');

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

  // Compute stats and filtered data
  const { stats, filteredEmployees, uniquePositions } = useMemo(() => {
    if (!employees?.employees) {
      return {
        stats: { total: 0, active: 0, inactive: 0, withOnlineBooking: 0 },
        filteredEmployees: [],
        uniquePositions: [],
      };
    }

    const allEmployees = employees.employees;
    
    // Calculate stats
    const stats = {
      total: allEmployees.length,
      active: allEmployees.filter((e: any) => e.isActive).length,
      inactive: allEmployees.filter((e: any) => !e.isActive).length,
      withOnlineBooking: allEmployees.filter((e: any) => e.acceptsOnlineBooking).length,
    };

    // Get unique positions
    const positions = Array.from(
      new Set(allEmployees.map((e: any) => e.position).filter(Boolean))
    );

    // Apply filters
    let filtered = allEmployees;

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter((e: any) => e.isActive);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter((e: any) => !e.isActive);
    }

    // Position filter
    if (positionFilter !== 'all') {
      filtered = filtered.filter((e: any) => e.position === positionFilter);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e: any) =>
          e.name?.toLowerCase().includes(search) ||
          e.email?.toLowerCase().includes(search) ||
          e.phone?.includes(search)
      );
    }

    return {
      stats,
      filteredEmployees: filtered,
      uniquePositions: positions,
    };
  }, [employees, searchTerm, statusFilter, positionFilter]);

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

      {/* Stats Cards */}
      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total de Colaboradores</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.total}</div>
            <p className='text-xs text-muted-foreground'>
              Todos os colaboradores cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Ativos</CardTitle>
            <UserCheck className='h-4 w-4 text-green-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-600'>{stats.active}</div>
            <p className='text-xs text-muted-foreground'>
              Colaboradores ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Inativos</CardTitle>
            <UserX className='h-4 w-4 text-gray-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-gray-600'>{stats.inactive}</div>
            <p className='text-xs text-muted-foreground'>
              Colaboradores inativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Agendamento Online</CardTitle>
            <CalendarCheck className='h-4 w-4 text-blue-600' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-blue-600'>{stats.withOnlineBooking}</div>
            <p className='text-xs text-muted-foreground'>
              Com agendamento habilitado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Buscar por nome, email ou telefone...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='pl-9'
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className='w-full md:w-[180px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Todos</SelectItem>
                <SelectItem value='active'>Ativos</SelectItem>
                <SelectItem value='inactive'>Inativos</SelectItem>
              </SelectContent>
            </Select>
            {uniquePositions.length > 0 && (
              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className='w-full md:w-[180px]'>
                  <SelectValue placeholder='Cargo' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Todos os cargos</SelectItem>
                  {uniquePositions.map((position: any) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

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
          ) : filteredEmployees.length === 0 ? (
            <EmptyState
              icon={Search}
              title='Nenhum colaborador encontrado'
              description='Tente ajustar os filtros para encontrar o que procura'
            />
          ) : (
            <div className='p-4'>
              <div className='space-y-2'>
                {filteredEmployees.map((employee: any) => (
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
