// Advanced Calendar View Component
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type ViewMode = 'day' | 'week' | 'month' | 'agenda';

interface CalendarViewProps {
  salonId: string;
  onAppointmentClick?: (appointmentId: string) => void;
  onTimeSlotClick?: (date: Date, employeeId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  salonId,
  onAppointmentClick,
  onTimeSlotClick
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);

  // Navigation handlers
  const goToPrevious = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, -1));
        break;
      case 'week':
        setCurrentDate(addDays(currentDate, -7));
        break;
      case 'month':
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        break;
    }
  };

  const goToNext = () => {
    switch (viewMode) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addDays(currentDate, 7));
        break;
      case 'month':
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get date range based on view mode
  const getDateRange = () => {
    switch (viewMode) {
      case 'day':
        return { start: currentDate, end: currentDate };
      case 'week':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        };
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      default:
        return { start: currentDate, end: currentDate };
    }
  };

  const dateRange = getDateRange();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-md">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {/* Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Hoje
          </button>
          <button
            onClick={goToNext}
            className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <h2 className="ml-4 text-xl font-semibold text-gray-900 dark:text-white">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
        </div>

        {/* View Mode Selector */}
        <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {['day', 'week', 'month', 'agenda'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as ViewMode)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                viewMode === mode
                  ? 'bg-white dark:bg-gray-700 text-brand-600 dark:text-brand-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {mode === 'day' && 'Dia'}
              {mode === 'week' && 'Semana'}
              {mode === 'month' && 'Mês'}
              {mode === 'agenda' && 'Agenda'}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
            + Novo Agendamento
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto">
        {viewMode === 'day' && <DayView date={currentDate} salonId={salonId} />}
        {viewMode === 'week' && <WeekView startDate={dateRange.start} endDate={dateRange.end} salonId={salonId} />}
        {viewMode === 'month' && <MonthView date={currentDate} salonId={salonId} />}
        {viewMode === 'agenda' && <AgendaView startDate={dateRange.start} endDate={dateRange.end} salonId={salonId} />}
      </div>
    </div>
  );
};

// Day View Component
const DayView: React.FC<{ date: Date; salonId: string }> = ({ date, salonId }) => {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8); // 8 AM to 10 PM

  return (
    <div className="flex h-full">
      {/* Time Column */}
      <div className="w-20 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        <div className="h-16"></div> {/* Header spacer */}
        {hours.map((hour) => (
          <div key={hour} className="h-24 border-t border-gray-200 dark:border-gray-700 px-2 py-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {hour.toString().padStart(2, '0')}:00
            </span>
          </div>
        ))}
      </div>

      {/* Employee Columns */}
      <div className="flex-1 flex">
        {/* This would be populated with actual employee data */}
        <div className="flex-1 border-r border-gray-200 dark:border-gray-700">
          <div className="h-16 border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
            <h3 className="font-medium text-gray-900 dark:text-white">Profissional 1</h3>
          </div>
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-24 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              {/* Appointments would be rendered here */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Week View Component
const WeekView: React.FC<{ startDate: Date; endDate: Date; salonId: string }> = ({ startDate, endDate, salonId }) => {
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const hours = Array.from({ length: 14 }, (_, i) => i + 8);

  return (
    <div className="flex h-full">
      {/* Time Column */}
      <div className="w-20 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
        <div className="h-16"></div>
        {hours.map((hour) => (
          <div key={hour} className="h-20 border-t border-gray-200 dark:border-gray-700 px-2 py-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {hour.toString().padStart(2, '0')}:00
            </span>
          </div>
        ))}
      </div>

      {/* Day Columns */}
      <div className="flex-1 flex overflow-x-auto">
        {days.map((day) => (
          <div key={day.toString()} className="flex-1 min-w-[150px] border-r border-gray-200 dark:border-gray-700">
            <div className={`h-16 border-b border-gray-200 dark:border-gray-700 p-2 ${
              isSameDay(day, new Date()) ? 'bg-brand-50 dark:bg-brand-900' : 'bg-gray-50 dark:bg-gray-800'
            }`}>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {format(day, 'EEE', { locale: ptBR })}
              </div>
              <div className={`text-2xl font-bold ${
                isSameDay(day, new Date()) ? 'text-brand-600 dark:text-brand-400' : 'text-gray-900 dark:text-white'
              }`}>
                {format(day, 'd')}
              </div>
            </div>
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-20 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors relative"
              >
                {/* Appointments would be rendered here */}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Month View Component
const MonthView: React.FC<{ date: Date; salonId: string }> = ({ date, salonId }) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weeks: Date[][] = [];
  
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="h-full flex flex-col">
      {/* Week Day Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 grid grid-rows-[repeat(auto-fit,minmax(0,1fr))]">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {week.map((day) => {
              const isCurrentMonth = day.getMonth() === date.getMonth();
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toString()}
                  className={`border-r border-gray-200 dark:border-gray-700 p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                    !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday 
                      ? 'w-7 h-7 flex items-center justify-center rounded-full bg-brand-600 text-white'
                      : isCurrentMonth 
                        ? 'text-gray-900 dark:text-white' 
                        : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {format(day, 'd')}
                  </div>
                  {/* Appointments would be rendered here */}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Agenda View Component
const AgendaView: React.FC<{ startDate: Date; endDate: Date; salonId: string }> = ({ startDate, endDate, salonId }) => {
  return (
    <div className="p-4">
      <div className="space-y-4">
        {/* This would be populated with actual appointment data */}
        <div className="text-center text-gray-500 dark:text-gray-400 py-12">
          Nenhum agendamento encontrado
        </div>
      </div>
    </div>
  );
};
