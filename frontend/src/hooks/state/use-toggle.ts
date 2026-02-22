'use client';

import { useState, useCallback } from 'react';

/**
 * Toggle Hook
 * 
 * Simple hook for managing boolean state with toggle functionality.
 */

/**
 * useToggle Hook
 * 
 * Manage boolean state with convenient toggle, setTrue, and setFalse functions.
 * 
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, toggle, setTrue, setFalse, setValue]
 * 
 * @example
 * const [isOpen, toggle, open, close] = useToggle();
 * 
 * <button onClick={toggle}>Toggle</button>
 * <button onClick={open}>Open</button>
 * <button onClick={close}>Close</button>
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, () => void, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse, setValue];
}

/**
 * useBooleanState Hook
 * 
 * Alias for useToggle with different naming convention.
 * 
 * @param initialValue - Initial boolean value
 * @returns Object with value and control functions
 * 
 * @example
 * const modal = useBooleanState(false);
 * 
 * <button onClick={modal.toggle}>Toggle Modal</button>
 * <Modal isOpen={modal.value} onClose={modal.setFalse} />
 */
export function useBooleanState(initialValue: boolean = false) {
  const [value, toggle, setTrue, setFalse, setValue] = useToggle(initialValue);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
    setValue,
    on: setTrue,
    off: setFalse,
  };
}

/**
 * useDisclosure Hook
 * 
 * Common pattern for modal/drawer/popover state management.
 * 
 * @param initialValue - Initial open state
 * @returns Object with isOpen state and control functions
 * 
 * @example
 * const disclosure = useDisclosure();
 * 
 * <button onClick={disclosure.onOpen}>Open</button>
 * <Modal 
 *   isOpen={disclosure.isOpen} 
 *   onClose={disclosure.onClose}
 * />
 */
export function useDisclosure(initialValue: boolean = false) {
  const [isOpen, toggle, onOpen, onClose, setIsOpen] = useToggle(initialValue);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle: toggle,
    setIsOpen,
  };
}

/**
 * useControlledToggle Hook
 * 
 * Toggle with controlled state support.
 * 
 * @param controlled - Whether state is controlled externally
 * @param value - Controlled value
 * @param onChange - Controlled onChange handler
 * @param defaultValue - Default value for uncontrolled mode
 * @returns Tuple of [value, toggle]
 * 
 * @example
 * // Uncontrolled
 * const [isOpen, toggle] = useControlledToggle(false);
 * 
 * // Controlled
 * const [isOpen, toggle] = useControlledToggle(true, controlled, onChange);
 */
export function useControlledToggle(
  controlled: boolean,
  value?: boolean,
  onChange?: (value: boolean) => void,
  defaultValue: boolean = false
): [boolean, () => void] {
  const [internalValue, setInternalValue] = useState(defaultValue);

  const currentValue = controlled ? (value ?? false) : internalValue;

  const toggle = useCallback(() => {
    const newValue = !currentValue;
    
    if (controlled) {
      onChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
  }, [controlled, currentValue, onChange]);

  return [currentValue, toggle];
}
