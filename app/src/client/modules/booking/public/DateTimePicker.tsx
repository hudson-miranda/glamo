
import { useState, useEffect } from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Calendar } from '../../../../components/ui/calendar';
import { Badge } from '../../../../components/ui/badge';
import { Clock, CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { format, addDays, isSameDay, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TimeSlot {
  startTime: string;
  endTime: string;
  professionalId: string;
  professionalName: string;
}

interface DateTimePickerProps {
  availableSlots: TimeSlot[];
  selectedDateTime: Date | null;
  onSelectDateTime: (date: Date, slot: TimeSlot) => void;
  onDateChange: (date: Date) => void;
  isLoading: boolean;
  minDate: Date;
  maxDate: Date;
}

export function DateTimePicker({
  availableSlots,
  selectedDateTime,
  onSelectDateTime,
  onDateChange,
  isLoading,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<'calendar' | 'slots'>('calendar');

  useEffect(() => {
    // Trigger slot loading when date changes
    onDateChange(selectedDate);
  }, [selectedDate]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setView('slots');
    }
  };

  const formatTime = (isoString: string) => {
    return format(new Date(isoString), 'HH:mm', { locale: ptBR });
  };

  const formatDateDisplay = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  // Group slots by time for display
  const groupedSlots = availableSlots.reduce((acc, slot) => {
    const timeKey = formatTime(slot.startTime);
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const sortedTimes = Object.keys(groupedSlots).sort();

  // Quick date navigation (next 7 days)
  const quickDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i)).filter(
    (date) => date >= minDate && date <= maxDate
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-2">Escolha Data e Horário</h2>
        <p className="text-muted-foreground">
          Selecione o dia e horário mais conveniente para você
        </p>
      </div>

      {/* Quick Date Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {quickDates.map((date) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          return (
            <Button
              key={date.toISOString()}
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => handleDateSelect(date)}
              className={cn(
                'flex-shrink-0 flex flex-col items-center px-4 py-3 h-auto',
                isSelected && 'bg-neon-500 text-black hover:bg-neon-600'
              )}
            >
              <span className="text-xs font-medium">
                {format(date, 'EEE', { locale: ptBR })}
              </span>
              <span className="text-lg font-bold">{format(date, 'd', { locale: ptBR })}</span>
              {isToday && <Badge variant="outline" className="mt-1 text-xs">Hoje</Badge>}
            </Button>
          );
        })}
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === 'calendar' ? 'default' : 'outline'}
          onClick={() => setView('calendar')}
          className={cn(view === 'calendar' && 'bg-neon-500 text-black hover:bg-neon-600')}
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Calendário
        </Button>
        <Button
          variant={view === 'slots' ? 'default' : 'outline'}
          onClick={() => setView('slots')}
          className={cn(view === 'slots' && 'bg-neon-500 text-black hover:bg-neon-600')}
        >
          <Clock className="h-4 w-4 mr-2" />
          Horários
        </Button>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <Card className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < minDate || date > maxDate}
            locale={ptBR}
            className="mx-auto"
          />
        </Card>
      )}

      {/* Slots View */}
      {view === 'slots' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold capitalize">
              {formatDateDisplay(selectedDate)}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView('calendar')}
            >
              Mudar Data
            </Button>
          </div>

          {isLoading ? (
            <Card className="p-12 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-neon-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Carregando horários disponíveis...
                </p>
              </div>
            </Card>
          ) : sortedTimes.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {sortedTimes.map((time) => {
                const slots = groupedSlots[time];
                const slot = slots[0]; // Take the first available slot for this time
                const isSelected =
                  selectedDateTime && isSameDay(selectedDateTime, new Date(slot.startTime))
                    ? format(selectedDateTime, 'HH:mm') === time
                    : false;

                return (
                  <Button
                    key={time}
                    variant={isSelected ? 'default' : 'outline'}
                    onClick={() => onSelectDateTime(new Date(slot.startTime), slot)}
                    className={cn(
                      'h-auto py-3 flex flex-col gap-1',
                      isSelected && 'bg-neon-500 text-black hover:bg-neon-600',
                      !isSelected && 'hover:border-neon-500/50 hover:shadow-glow-sm'
                    )}
                  >
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{time}</span>
                    {slots.length > 1 && (
                      <span className="text-xs opacity-70">
                        {slots.length} disponíveis
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground font-medium mb-2">
                Sem horários disponíveis
              </p>
              <p className="text-sm text-muted-foreground">
                Escolha outra data para ver horários disponíveis
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
