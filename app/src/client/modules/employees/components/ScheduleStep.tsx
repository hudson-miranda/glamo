import { EmployeeFormData } from '../CreateEmployeePage';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Plus, Trash2, Clock } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../components/ui/select';

type ScheduleStepProps = {
  formData: EmployeeFormData;
  updateFormData: (data: Partial<EmployeeFormData>) => void;
};

const DAYS_OF_WEEK = [
  { id: 0, name: 'Segunda-feira', short: 'SEG' },
  { id: 1, name: 'Terça-feira', short: 'TER' },
  { id: 2, name: 'Quarta-feira', short: 'QUA' },
  { id: 3, name: 'Quinta-feira', short: 'QUI' },
  { id: 4, name: 'Sexta-feira', short: 'SEX' },
  { id: 5, name: 'Sábado', short: 'SÁB' },
  { id: 6, name: 'Domingo', short: 'DOM' },
];

// Gerar horários de 00:00 às 23:30 de 30 em 30 minutos
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      times.push(`${h}:${m}`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

export function ScheduleStep({ formData, updateFormData }: ScheduleStepProps) {
  const getSchedulesForDay = (dayOfWeek: number) => {
    return formData.schedules
      .map((schedule, index) => ({ ...schedule, originalIndex: index }))
      .filter((schedule) => schedule.dayOfWeek === dayOfWeek);
  };

  const addSchedule = (dayOfWeek: number) => {
    const newSchedule = {
      dayOfWeek,
      startTime: '09:00',
      endTime: '18:00',
    };
    updateFormData({ schedules: [...formData.schedules, newSchedule] });
  };

  const removeSchedule = (index: number) => {
    const newSchedules = formData.schedules.filter((_, i) => i !== index);
    updateFormData({ schedules: newSchedules });
  };

  const updateSchedule = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const newSchedules = [...formData.schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    updateFormData({ schedules: newSchedules });
  };

  const hasScheduleForDay = (dayOfWeek: number) => {
    return formData.schedules.some((s) => s.dayOfWeek === dayOfWeek);
  };

  const copyToAllDays = (dayOfWeek: number) => {
    const sourceSchedules = getSchedulesForDay(dayOfWeek);
    
    if (sourceSchedules.length === 0) {
      return;
    }

    // Remove todos os horários existentes dos outros dias
    const newSchedules = formData.schedules.filter((s) => s.dayOfWeek === dayOfWeek);

    // Copia para todos os outros dias
    DAYS_OF_WEEK.forEach((day) => {
      if (day.id !== dayOfWeek) {
        sourceSchedules.forEach((schedule) => {
          newSchedules.push({
            dayOfWeek: day.id,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          });
        });
      }
    });

    updateFormData({ schedules: newSchedules });
  };

  const clearAllSchedules = () => {
    updateFormData({ schedules: [] });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
            <Clock className='mr-2 h-5 w-5 text-brand-600' />
            Horários de Trabalho
          </h3>
          <p className='text-sm text-gray-600 dark:text-gray-400 mt-1'>
            Configure os horários de trabalho do colaborador. Você pode adicionar múltiplos períodos por dia.
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={clearAllSchedules}
          className='border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
        >
          <Trash2 className='mr-2 h-4 w-4' />
          Limpar Tudo
        </Button>
      </div>

      {/* Dias da Semana */}
      <div className='space-y-4'>
        {DAYS_OF_WEEK.map((day) => {
          const daySchedules = getSchedulesForDay(day.id);
          const hasSchedule = hasScheduleForDay(day.id);

          return (
            <div
              key={day.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                hasSchedule
                  ? 'border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50'
              }`}
            >
              {/* Cabeçalho do Dia */}
              <div className='flex items-center justify-between mb-3'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg font-bold text-xs ${
                      hasSchedule
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {day.short}
                  </div>
                  <div>
                    <p className='font-semibold text-gray-900 dark:text-white'>
                      {day.name}
                    </p>
                    {daySchedules.length > 0 && (
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        {daySchedules.length} período{daySchedules.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>

                <div className='flex gap-2'>
                  {hasSchedule && (
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => copyToAllDays(day.id)}
                      className='border-gray-200 dark:border-gray-700 text-xs'
                    >
                      Copiar para todos
                    </Button>
                  )}
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => addSchedule(day.id)}
                    className='border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400'
                  >
                    <Plus className='mr-1 h-3 w-3' />
                    Adicionar Período
                  </Button>
                </div>
              </div>

              {/* Períodos do Dia */}
              {daySchedules.length > 0 ? (
                <div className='space-y-2'>
                  {daySchedules.map((schedule) => (
                    <div
                      key={schedule.originalIndex}
                      className='flex items-center gap-3 p-3 bg-white dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700'
                    >
                      <div className='flex-1 grid grid-cols-2 gap-3'>
                        <div>
                          <Label className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
                            Início
                          </Label>
                          <Select
                            value={schedule.startTime}
                            onValueChange={(value) =>
                              updateSchedule(schedule.originalIndex, 'startTime', value)
                            }
                          >
                            <SelectTrigger className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-9'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='max-h-60'>
                              {TIME_OPTIONS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className='text-xs text-gray-600 dark:text-gray-400 mb-1'>
                            Fim
                          </Label>
                          <Select
                            value={schedule.endTime}
                            onValueChange={(value) =>
                              updateSchedule(schedule.originalIndex, 'endTime', value)
                            }
                          >
                            <SelectTrigger className='bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 h-9'>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className='max-h-60'>
                              {TIME_OPTIONS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => removeSchedule(schedule.originalIndex)}
                        className='text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-4 text-sm text-gray-500 dark:text-gray-400'>
                  Nenhum horário configurado
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Resumo */}
      {formData.schedules.length > 0 && (
        <div className='p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800'>
          <p className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>
            📋 Resumo dos Horários
          </p>
          <div className='text-sm text-gray-700 dark:text-gray-300'>
            <p>
              Total de períodos: <strong>{formData.schedules.length}</strong>
            </p>
            <p>
              Dias configurados:{' '}
              <strong>
                {DAYS_OF_WEEK.filter((day) => hasScheduleForDay(day.id))
                  .map((day) => day.short)
                  .join(', ')}
              </strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
