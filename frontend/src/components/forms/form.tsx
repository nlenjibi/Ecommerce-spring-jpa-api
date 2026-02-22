import React from 'react';
import { cn } from '@/lib/utils';

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  className?: string;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('space-y-4', className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);
Form.displayName = 'Form';

interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
  error?: string;
  label?: string;
  required?: boolean;
  description?: string;
}

export function FormField({
  children,
  className,
  error,
  label,
  required = false,
  description,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export function FormActions({ children, className }: FormActionsProps) {
  return (
    <div className={cn('flex items-center justify-end space-x-3 pt-4', className)}>
      {children}
    </div>
  );
}

export { Form, FormField, FormActions };
