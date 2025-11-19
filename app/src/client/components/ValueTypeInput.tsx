import React from 'react';
import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Label } from '../../components/ui/label';

export type ValueType = 'FIXED' | 'PERCENT';

interface ValueTypeInputProps {
  label: string;
  value: number;
  valueType: ValueType;
  onValueChange: (value: number) => void;
  onValueTypeChange: (type: ValueType) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  id?: string;
  tooltip?: React.ReactNode;
}

export const ValueTypeInput: React.FC<ValueTypeInputProps> = ({
  label,
  value,
  valueType,
  onValueChange,
  onValueTypeChange,
  placeholder = '0.00',
  min = 0,
  max,
  step = 0.01,
  disabled = false,
  error,
  required = false,
  id,
  tooltip,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    onValueChange(newValue);
  };

  const effectiveMax = valueType === 'PERCENT' ? 100 : max;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className={required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}>
          {label}
        </Label>
        {tooltip}
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            id={id}
            type="number"
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            min={min}
            max={effectiveMax}
            step={step}
            disabled={disabled}
            className={error ? 'border-red-500' : ''}
          />
        </div>
        
        <div className="w-24">
          <Select
            value={valueType}
            onValueChange={(val: ValueType) => {
              onValueTypeChange(val);
              // Se mudou para PERCENT e o valor é maior que 100, limita a 100
              if (val === 'PERCENT' && value > 100) {
                onValueChange(100);
              }
            }}
            disabled={disabled}
          >
            <SelectTrigger className={error ? 'border-red-500' : ''}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED">R$</SelectItem>
              <SelectItem value="PERCENT">%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {valueType === 'PERCENT' && value > 0 && (
        <p className="text-xs text-gray-500">
          Valor percentual: {value.toFixed(2)}%
        </p>
      )}
      
      {valueType === 'FIXED' && value > 0 && (
        <p className="text-xs text-gray-500">
          Valor fixo: R$ {value.toFixed(2)}
        </p>
      )}
    </div>
  );
};

export default ValueTypeInput;
