import React from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export function Checkbox({
  label,
  error,
  className = '',
  id,
  checked,
  ...props
}: CheckboxProps) {
  const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex items-start">
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div
          className={`
            w-5 h-5 border-2 rounded flex items-center justify-center transition-colors
            peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2
            ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
        >
          {checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
        </div>
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          className="ml-2 text-sm text-gray-700 cursor-pointer"
        >
          {label}
        </label>
      )}
      {error && <p className="ml-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
