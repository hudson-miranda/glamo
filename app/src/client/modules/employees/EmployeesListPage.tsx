import { useState } from 'react';
import { useQuery, listEmployees } from 'wasp/client/operations';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Plus, Search, Users, Edit, Trash2, Mail, Phone, Calendar } from 'lucide-react';
import { useSalonContext } from '../../hooks/useSalonContext';

export default function EmployeesListPage() {
  const navigate = useNavigate();
  const { activeSalonId } = useSalonContext();
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery(listEmployees, {
    salonId: activeSalonId || '',
    search,
    isActive: true,
  }, {
    enabled: !!activeSalonId,
  });

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Colaboradores
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>
            Gerencie os colaboradores do seu salão
          </p>
        </div>
        <Button 
          onClick={() => navigate('/employees/new' as any)}
          className='bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 text-white shadow-lg shadow-brand-500/30'
        >
          <Plus className='mr-2 h-4 w-4' />
          Cadastrar Colaborador
        </Button>
      </div>

      {/* Search */}
      <Card className='bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800'>
        <CardHeader>
          <CardTitle className='text-base text-gray-900 dark:text-white'>
            Buscar Colaboradores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400' />
            <Input
              placeholder='Buscar por nome, email, telefone ou CPF...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className='pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
            />
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className='bg-white dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800'>
        <CardContent className='p-0'>
          {isLoading ? (
            <div className='flex items-center justify-center p-8'>
              <div className='flex items-center gap-3'>
                <div className='w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin' />
                <p className='text-sm text-gray-600 dark:text-gray-400'>Carregando colaboradores...</p>
              </div>
            </div>
          ) : error ? (
            <div className='flex items-center justify-center p-8'>
              <p className='text-sm text-red-600 dark:text-red-400'>
                Erro ao carregar colaboradores: {error.message}
              </p>
            </div>
          ) : !data?.employees || data.employees.length === 0 ? (
            <EmptyState
              icon={Users}
              title='Nenhum colaborador encontrado'
              description={
                search
                  ? 'Tente ajustar os filtros de busca'
                  : 'Comece cadastrando seu primeiro colaborador'
              }
              action={
                !search && (
                  <Button 
                    onClick={() => navigate('/employees/new' as any)}
                    className='bg-gradient-to-r from-brand-400 to-brand-600 hover:from-brand-500 hover:to-brand-700 text-white'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Cadastrar Colaborador
                  </Button>
                )
              }
            />
          ) : (
            <>
              <div className='overflow-x-auto'>
                <Table>
                  <TableHeader>
                    <TableRow className='border-gray-200 dark:border-gray-800'>
                      <TableHead className='text-gray-700 dark:text-gray-300'>Cor</TableHead>
                      <TableHead className='text-gray-700 dark:text-gray-300'>Nome</TableHead>
                      <TableHead className='text-gray-700 dark:text-gray-300'>Cargo</TableHead>
                      <TableHead className='text-gray-700 dark:text-gray-300'>Contato</TableHead>
                      <TableHead className='text-gray-700 dark:text-gray-300'>Serviços</TableHead>
                      <TableHead className='text-gray-700 dark:text-gray-300'>Status</TableHead>
                      <TableHead className='text-right text-gray-700 dark:text-gray-300'>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.employees.map((employee) => (
                      <TableRow key={employee.id} className='border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'>
                        <TableCell>
                          <div
                            className='w-8 h-8 rounded-full border-2 border-white dark:border-gray-800 shadow-sm'
                            style={{ backgroundColor: employee.color || '#999' }}
                            title={employee.color || 'Sem cor'}
                          />
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col'>
                            <span className='font-medium text-gray-900 dark:text-white'>
                              {employee.name}
                            </span>
                            {employee.user && (
                              <span className='text-xs text-brand-600 dark:text-brand-400 flex items-center gap-1 mt-1'>
                                <Mail className='h-3 w-3' />
                                Tem acesso ao sistema
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className='text-gray-900 dark:text-gray-300'>
                            {employee.position || '-'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1 text-sm'>
                            {employee.email && (
                              <span className='text-gray-700 dark:text-gray-400 flex items-center gap-1'>
                                <Mail className='h-3 w-3' />
                                {employee.email}
                              </span>
                            )}
                            {employee.phone && (
                              <span className='text-gray-700 dark:text-gray-400 flex items-center gap-1'>
                                <Phone className='h-3 w-3' />
                                {formatPhone(employee.phone)}
                              </span>
                            )}
                            {!employee.email && !employee.phone && (
                              <span className='text-gray-500 dark:text-gray-500'>-</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant='outline' 
                            className='bg-brand-50 dark:bg-brand-950/30 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                          >
                            {employee._count.serviceAssignments} {employee._count.serviceAssignments === 1 ? 'serviço' : 'serviços'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={employee.isActive ? 'default' : 'secondary'}
                            className={
                              employee.isActive
                                ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                            }
                          >
                            {employee.isActive ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => navigate(`/employees/${employee.id}/schedules` as any)}
                              className='h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400'
                              title='Ver horários'
                            >
                              <Calendar className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => navigate(`/employees/${employee.id}/edit` as any)}
                              className='h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400'
                              title='Editar'
                            >
                              <Edit className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                              title='Excluir'
                              onClick={() => {
                                if (confirm(`Tem certeza que deseja excluir ${employee.name}?`)) {
                                  // TODO: Implementar deleteEmployee
                                  console.log('Delete employee:', employee.id);
                                }
                              }}
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination info */}
              {data.total > 0 && (
                <div className='border-t border-gray-200 dark:border-gray-800 px-6 py-4'>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Mostrando <span className='font-medium text-gray-900 dark:text-white'>{data.employees.length}</span> de{' '}
                    <span className='font-medium text-gray-900 dark:text-white'>{data.total}</span> colaborador
                    {data.total !== 1 && 'es'}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
