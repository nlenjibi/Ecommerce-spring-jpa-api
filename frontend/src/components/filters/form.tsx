'use client';

import React, { createContext, useContext } from 'react';
import { UseFormReturn, FieldPath, FieldValues } from 'react-hook-form';

interface FormContextType<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProps<TFieldValues extends FieldValues = FieldValues> {
  form: UseFormReturn<TFieldValues>;
  onSubmit: (data: TFieldValues) => void | Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function Form<TFieldValues extends FieldValues = FieldValues>({
  form,
  onSubmit,
  children,
  className = '',
}: FormProps<TFieldValues>) {
  return (
    <FormContext.Provider value={{ form: form as UseFormReturn<FieldValues> }}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

interface FormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: FieldPath<TFieldValues>;
  children: (field: any) => React.ReactNode;
}

export function FormField<TFieldValues extends FieldValues = FieldValues>({
  name,
  children,
}: FormFieldProps<TFieldValues>) {
  const context = useContext(FormContext);
  if (!context) throw new Error('FormField must be used within Form');

  const field = context.form.register(name as string);
  const fieldState = context.form.getFieldState(name as string);

  return (
    <FormFieldContext.Provider value={{ name: name as string, error: fieldState.error }}>
      {children({ ...field, error: fieldState.error })}
    </FormFieldContext.Provider>
  );
}

interface FormFieldContextType {
  name: string;
  error?: any;
}

const FormFieldContext = createContext<FormFieldContextType | undefined>(undefined);

interface FormItemProps {
  children: React.ReactNode;
  className?: string;
}

export function FormItem({ children, className = '' }: FormItemProps) {
  return <div className={`space-y-2 ${className}`}>{children}</div>;
}

interface FormLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export function FormLabel({ children, required, className = '' }: FormLabelProps) {
  const context = useContext(FormFieldContext);
  
  return (
    <label
      htmlFor={context?.name}
      className={`block text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

interface FormControlProps {
  children: React.ReactNode;
}

export function FormControl({ children }: FormControlProps) {
  const context = useContext(FormFieldContext);
  
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      id: context?.name,
      name: context?.name,
      'aria-invalid': !!context?.error,
    });
  }
  
  return <>{children}</>;
}

interface FormMessageProps {
  children?: React.ReactNode;
}

export function FormMessage({ children }: FormMessageProps) {
  const context = useContext(FormFieldContext);
  const message = context?.error?.message || children;
  
  if (!message) return null;
  
  return <p className="text-sm text-red-500">{String(message)}</p>;
}

interface FormDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function FormDescription({ children, className = '' }: FormDescriptionProps) {
  return <p className={`text-sm text-gray-500 ${className}`}>{children}</p>;
}
