'use client';

import { useForm as useReactHookForm, UseFormProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

interface UseFormOptions<TFieldValues extends FieldValues = FieldValues>
  extends Omit<UseFormProps<TFieldValues>, 'resolver'> {
  schema?: ZodSchema<TFieldValues>;
}

export function useForm<TFieldValues extends FieldValues = FieldValues>({
  schema,
  ...options
}: UseFormOptions<TFieldValues> = {}) {
  return useReactHookForm<TFieldValues>({
    ...options,
    resolver: schema ? zodResolver(schema) : undefined,
  });
}
