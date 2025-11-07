import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, getEmployee } from 'wasp/client/operations';
import { Button } from '../../../components/ui/button';
import { ChevronLeft, Loader2, Clock } from 'lucide-react';

// TODO: Implementar visualização e edição de horários
export default function EmployeeSchedulesPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: employee,
    isLoading,
    error,
  } = useQuery(getEmployee, { id: id! }, { enabled: !!id });

  const DAYS_OF_WEEK = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo',
  ];

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

  const schedulesByDay = (employee.schedules || []).reduce((acc, schedule) => {
    if (!acc[schedule.dayOfWeek]) {
      acc[schedule.dayOfWeek] = [];
    }
    acc[schedule.dayOfWeek].push(schedule);
    return acc;
  }, {} as Record<number, typeof employee.schedules>);

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-gray-900 dark:text-white'>
            Horários de Trabalho
          </h1>
          <p className='text-gray-600 dark:text-gray-400 mt-1'>{employee.name}</p>
        </div>
        <div className='flex gap-3'>
          <Button
            variant='outline'
            onClick={() => navigate(`/employees/${id}/edit`)}
            className='border-gray-200 dark:border-gray-700'
          >
            Editar
          </Button>
          <Button
            variant='outline'
            onClick={() => navigate('/employees')}
            className='border-gray-200 dark:border-gray-700'
          >
            <ChevronLeft className='mr-2 h-4 w-4' />
            Voltar
          </Button>
        </div>
      </div>

      {/* Calendário Semanal */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {DAYS_OF_WEEK.map((day, index) => {
          const daySchedules = schedulesByDay[index] || [];
          const hasSchedules = daySchedules.length > 0;

          return (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                hasSchedules
                  ? 'border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
              }`}
            >
              <div className='flex items-center gap-3 mb-3'>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-xs ${
                    hasSchedules
                      ? 'bg-brand-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {day.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <p className='font-semibold text-gray-900 dark:text-white'>{day}</p>
                  {daySchedules.length > 0 && (
                    <p className='text-xs text-gray-500 dark:text-gray-400'>
                      {daySchedules.length} período{daySchedules.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {daySchedules.length > 0 ? (
                <div className='space-y-2'>
                  {daySchedules.map((schedule, idx) => (
                    <div
                      key={idx}
                      className='flex items-center gap-2 p-2 bg-white dark:bg-gray-900/50 rounded border border-gray-200 dark:border-gray-700'
                    >
                      <Clock className='h-4 w-4 text-brand-600' />
                      <span className='text-sm font-medium text-gray-900 dark:text-white'>
                        {schedule.startTime} - {schedule.endTime}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className='text-sm text-center text-gray-500 dark:text-gray-400 py-2'>
                  Sem horários
                </p>
              )}
            </div>
          );
        })}
      </div>

      {!employee.schedules || employee.schedules.length === 0 ? (
        <div className='p-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700'>
          <Clock className='h-12 w-12 mx-auto mb-3 text-gray-400' />
          <p className='text-gray-900 dark:text-white font-semibold mb-1'>
            Nenhum horário configurado
          </p>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Configure os horários de trabalho deste colaborador para facilitar o agendamento.
          </p>
        </div>
      ) : null}
    </div>
  );
}
