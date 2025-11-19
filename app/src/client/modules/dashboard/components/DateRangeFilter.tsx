import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Filter } from 'lucide-react';

export interface DateRangeFilterProps {
  onApply: (startDate: Date, endDate: Date) => void;
  onClear: () => void;
  defaultStartDate?: Date;
  defaultEndDate?: Date;
}

export function DateRangeFilter({
  onApply,
  onClear,
  defaultStartDate,
  defaultEndDate,
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(defaultEndDate);

  const handleApply = () => {
    if (startDate && endDate) {
      onApply(startDate, endDate);
    }
  };

  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    onClear();
  };

  const hasActiveFilter = startDate && endDate;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-background">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            value={startDate ? startDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
              if (date && date <= new Date()) {
                setStartDate(date);
              }
            }}
            max={new Date().toISOString().split('T')[0]}
            className="border-none focus:outline-none bg-transparent cursor-pointer"
          />
          <span className="text-muted-foreground">até</span>
          <input
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const date = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined;
              if (date && date <= new Date() && (!startDate || date >= startDate)) {
                setEndDate(date);
              }
            }}
            min={startDate ? startDate.toISOString().split('T')[0] : undefined}
            max={new Date().toISOString().split('T')[0]}
            className="border-none focus:outline-none bg-transparent cursor-pointer"
          />
        </div>
      </div>
      <Button onClick={handleApply} size="sm" disabled={!startDate || !endDate}>
        Aplicar
      </Button>
      {hasActiveFilter && (
        <Button onClick={handleClear} variant="outline" size="sm">
          Limpar
        </Button>
      )}
    </div>
  );
}
