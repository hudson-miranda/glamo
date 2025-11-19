import React, { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';

interface DurationSelectProps {
  label: string;
  value: number; // Duration in minutes
  onChange: (minutes: number) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  id?: string;
  tooltip?: React.ReactNode;
}

export const DurationSelect: React.FC<DurationSelectProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  error,
  required = false,
  id,
  tooltip,
}) => {
  // Gera opções de 5 min até 8 horas (480 minutos) em incrementos de 5 minutos
  const durationOptions = useMemo(() => {
    const options: { value: number; label: string }[] = [];
    
    // De 5 min até 55 min (incrementos de 5)
    for (let i = 5; i <= 55; i += 5) {
      options.push({
        value: i,
        label: `${i} min`,
      });
    }
    
    // De 1h até 8h (incrementos de 5 minutos)
    for (let hours = 1; hours <= 8; hours++) {
      // Hora cheia
      const totalMinutes = hours * 60;
      options.push({
        value: totalMinutes,
        label: `${hours}h`,
      });
      
      // Se não for 8h, adiciona intervalos de 5 minutos dentro da hora
      if (hours < 8) {
        for (let mins = 5; mins <= 55; mins += 5) {
          const total = totalMinutes + mins;
          options.push({
            value: total,
            label: `${hours}h ${mins}min`,
          });
        }
      }
    }
    
    return options;
  }, []);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${mins}min`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
          {label}
        </Label>
        {tooltip}
      </div>
      
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(parseInt(val, 10))}
        disabled={disabled}
      >
        <SelectTrigger id={id} className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Selecione a duração">
            {value > 0 ? formatDuration(value) : 'Selecione'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {durationOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {value > 0 && (
        <p className="text-xs text-gray-500">
          Duração total: {formatDuration(value)}
        </p>
      )}
    </div>
  );
};

export default DurationSelect;
