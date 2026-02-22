'use client';

import React, { createContext, useContext } from 'react';

interface RadioGroupContextType {
  value: string;
  onChange: (value: string) => void;
  name: string;
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined);

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  name?: string;
  children: React.ReactNode;
  className?: string;
}

export function RadioGroup({
  value: controlledValue,
  onValueChange,
  defaultValue = '',
  name = 'radio-group',
  children,
  className = '',
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const onChange = onValueChange || setUncontrolledValue;

  return (
    <RadioGroupContext.Provider value={{ value, onChange, name }}>
      <div className={`space-y-2 ${className}`}>{children}</div>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function RadioGroupItem({
  value,
  id,
  disabled = false,
  children,
  className = '',
}: RadioGroupItemProps) {
  const context = useContext(RadioGroupContext);
  if (!context) throw new Error('RadioGroupItem must be used within RadioGroup');

  const isChecked = context.value === value;
  const itemId = id || `${context.name}-${value}`;

  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="radio"
        id={itemId}
        name={context.name}
        value={value}
        checked={isChecked}
        onChange={() => !disabled && context.onChange(value)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors
          ${isChecked ? 'border-blue-600 bg-white' : 'border-gray-300 bg-white'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
        `}
      >
        {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
      </div>
      {children && (
        <label
          htmlFor={itemId}
          className={`ml-2 text-sm text-gray-700 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {children}
        </label>
      )}
    </div>
  );
}
