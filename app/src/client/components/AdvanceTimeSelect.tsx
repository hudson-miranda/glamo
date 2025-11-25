import React, { useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';

interface AdvanceTimeSelectProps {
  label: string;
  value: number; // Time in hours
  onChange: (hours: number) => void;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  id?: string;
  tooltip?: React.ReactNode;
}

export const AdvanceTimeSelect: React.FC<AdvanceTimeSelectProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  error,
  required = false,
  id,
  tooltip,
}) => {
  // Gera opções de tempo de antecedência
  const advanceTimeOptions = useMemo(() => {
    const options: { value: number; label: string }[] = [];
    
    // Sem restrição
    options.push({
      value: 0,
      label: 'Sem restrição',
    });
    
    // De 1 hora até 12 horas
    for (let i = 1; i <= 12; i++) {
      options.push({
        value: i,
        label: i === 1 ? '1 hora' : `${i} horas`,
      });
    }
    
    // 24 horas (1 dia)
    options.push({
      value: 24,
      label: '24 horas (1 dia)',
    });
    
    // 48 horas (2 dias)
    options.push({
      value: 48,
      label: '48 horas (2 dias)',
    });
    
    // 72 horas (3 dias)
    options.push({
      value: 72,
      label: '72 horas (3 dias)',
    });
    
    // 1 semana (168 horas)
    options.push({
      value: 168,
      label: '1 semana',
    });
    
    // 2 semanas (336 horas)
    options.push({
      value: 336,
      label: '2 semanas',
    });
    
    return options;
  }, []);

  const formatAdvanceTime = (hours: number): string => {
    if (hours === 0) {
      return 'Sem restrição';
    }
    
    if (hours === 1) {
      return '1 hora';
    }
    
    if (hours < 24) {
      return `${hours} horas`;
    }
    
    if (hours === 24) {
      return '24 horas (1 dia)';
    }
    
    if (hours === 48) {
      return '48 horas (2 dias)';
    }
    
    if (hours === 72) {
      return '72 horas (3 dias)';
    }
    
    if (hours === 168) {
      return '1 semana';
    }
    
    if (hours === 336) {
      return '2 semanas';
    }
    
    const days = Math.floor(hours / 24);
    return `${days} dias`;
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
          <SelectValue placeholder="Selecione o tempo de antecedência">
            {formatAdvanceTime(value)}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {advanceTimeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
  
    </div>
  );
};

export default AdvanceTimeSelect;
