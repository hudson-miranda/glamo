import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, getEmployee } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';

// TODO: Implementar página de edição usando o wizard
export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery(getEmployee, { id: id! }, { enabled: !!id });

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin text-brand-600' />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className='space-y-6'>
        <Button
          variant='outline'
          onClick={() => navigate('/employees')}
          className='border-gray-200 dark:border-gray-700'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
        <div className='text-center py-12'>
          <p className='text-red-600 dark:text-red-400'>
            {error?.message || 'Colaborador não encontrado'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Editar Colaborador
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>{employee.name}</p>
        </div>
        <Button
          variant='outline'
          onClick={() => navigate('/employees')}
          className='border-gray-200 dark:border-gray-700'
        >
          <ChevronLeft className='mr-2 h-4 w-4' />
          Voltar
        </Button>
      </div>

      <div className='p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-yellow-200 dark:border-yellow-800'>
        <p className='text-yellow-800 dark:text-yellow-200'>
          🚧 <strong>Em Desenvolvimento</strong>
        </p>
        <p className='text-sm text-yellow-700 dark:text-yellow-300 mt-2'>
          A página de edição será implementada reutilizando o wizard de cadastro com dados
          pré-preenchidos.
        </p>
      </div>

      {/* Dados do Colaborador */}
      <div className='p-6 bg-white dark:bg-gray-900/80 rounded-lg border border-gray-200 dark:border-gray-700'>
        <h3 className='font-semibold text-gray-900 dark:text-white mb-4'>
          Dados Atuais
        </h3>
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <p className='text-gray-600 dark:text-gray-400'>Nome:</p>
            <p className='font-medium text-gray-900 dark:text-white'>{employee.name}</p>
          </div>
          {employee.email && (
            <div>
              <p className='text-gray-600 dark:text-gray-400'>E-mail:</p>
              <p className='font-medium text-gray-900 dark:text-white'>{employee.email}</p>
            </div>
          )}
          {employee.phone && (
            <div>
              <p className='text-gray-600 dark:text-gray-400'>Celular:</p>
              <p className='font-medium text-gray-900 dark:text-white'>{employee.phone}</p>
            </div>
          )}
          {employee.position && (
            <div>
              <p className='text-gray-600 dark:text-gray-400'>Cargo:</p>
              <p className='font-medium text-gray-900 dark:text-white'>{employee.position}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
