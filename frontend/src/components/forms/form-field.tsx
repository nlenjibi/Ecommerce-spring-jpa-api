import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup } from '@/components/ui/radio-group';

interface FormFieldProps {
  id: string;
  label?: string;
  error?: string;
  description?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'tel';
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  value?: string | number | boolean;
  onChange?: (value: any) => void;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export function FormField({
  id,
  label,
  error,
  description,
  required = false,
  type = 'text',
  placeholder,
  options,
  value,
  onChange,
  className,
  disabled = false,
  icon,
}: FormFieldProps) {
  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            id={id}
            placeholder={placeholder}
            value={value as string}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={cn(error && 'border-red-500')}
          />
        );
      case 'select':
        return (
          <Select
            value={value as string}
            onValueChange={onChange}
            disabled={disabled}
          >
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
        );
      case 'checkbox':
        return (
          <Checkbox
            id={id}
            checked={value as boolean}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        );
      case 'radio':
        return (
          <RadioGroup
            value={value as string}
            onValueChange={onChange}
            disabled={disabled}
          >
            {options?.map((option) => (
              <RadioGroupItem key={option.value} value={option.value}>
                {option.label}
              </RadioGroupItem>
            ))}
          </RadioGroup>
        );
      default:
        return (
          <div className="relative">
            <Input
              id={id}
              type={type}
              placeholder={placeholder}
              value={value as string}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={disabled}
              className={cn(error && 'border-red-500', icon && 'pl-10')}
            />
            {icon && (
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                {icon}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className={cn(disabled && 'cursor-not-allowed opacity-70')}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderInput()}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}

export default FormField;
