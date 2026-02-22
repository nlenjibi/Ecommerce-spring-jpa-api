'use client';

import { useEffect, useCallback, useRef } from 'react';

/**
 * Keypress Hook
 * 
 * Listen for keyboard events and execute callbacks.
 * Supports key combinations, modifiers, and custom handlers.
 */

type KeyHandler = (event: KeyboardEvent) => void;

interface UseKeypressOptions {
  /** Event type to listen for (default: 'keydown') */
  event?: 'keydown' | 'keyup' | 'keypress';
  /** Target element (default: window) */
  target?: HTMLElement | Window | null;
  /** Prevent default behavior (default: false) */
  preventDefault?: boolean;
  /** Only trigger when these modifiers are pressed */
  modifiers?: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
}

/**
 * useKeypress Hook
 * 
 * Execute a callback when specific keys are pressed.
 * 
 * @param keys - Key or array of keys to listen for
 * @param handler - Callback to execute
 * @param options - Configuration options
 * 
 * @example
 * useKeypress('Escape', () => closeModal());
 * 
 * useKeypress(['Meta', 'k'], () => openSearch(), {
 *   preventDefault: true
 * });
 */
export function useKeypress(
  keys: string | string[],
  handler: KeyHandler,
  options: UseKeypressOptions = {}
) {
  const {
    event = 'keydown',
    target = typeof window !== 'undefined' ? window : null,
    preventDefault = false,
    modifiers,
  } = options;

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  const handleKeyEvent = useCallback(
    (e: KeyboardEvent) => {
      const pressedKeys = Array.isArray(keys) ? keys : [keys];
      const keyPressed = pressedKeys.some((key) => e.key === key);

      if (!keyPressed) return;

      // Check modifiers if specified
      if (modifiers) {
        const modifierMatch =
          (!modifiers.ctrl || e.ctrlKey) &&
          (!modifiers.shift || e.shiftKey) &&
          (!modifiers.alt || e.altKey) &&
          (!modifiers.meta || e.metaKey);

        if (!modifierMatch) return;
      }

      if (preventDefault) {
        e.preventDefault();
      }

      handlerRef.current(e);
    },
    [keys, preventDefault, modifiers]
  );

  useEffect(() => {
    const targetElement = target || window;
    if (!targetElement) return;

    targetElement.addEventListener(event, handleKeyEvent as any);

    return () => {
      targetElement.removeEventListener(event, handleKeyEvent as any);
    };
  }, [event, target, handleKeyEvent]);
}

/**
 * useEscapeKey Hook
 * 
 * Convenience hook for handling Escape key.
 * 
 * @param handler - Callback when Escape is pressed
 * @param enabled - Whether the listener is enabled (default: true)
 * 
 * @example
 * useEscapeKey(() => setIsOpen(false));
 */
export function useEscapeKey(handler: KeyHandler, enabled: boolean = true) {
  useKeypress('Escape', handler, {
    preventDefault: true,
  });
}

/**
 * useEnterKey Hook
 * 
 * Convenience hook for handling Enter key.
 * 
 * @param handler - Callback when Enter is pressed
 * 
 * @example
 * useEnterKey(() => submitForm());
 */
export function useEnterKey(handler: KeyHandler) {
  useKeypress('Enter', handler);
}

/**
 * useArrowKeys Hook
 * 
 * Handle arrow key navigation.
 * 
 * @param handlers - Object with handlers for each direction
 * @param options - Configuration options
 * 
 * @example
 * useArrowKeys({
 *   up: () => selectPrevious(),
 *   down: () => selectNext(),
 *   left: () => goBack(),
 *   right: () => goForward()
 * });
 */
export function useArrowKeys(
  handlers: {
    up?: KeyHandler;
    down?: KeyHandler;
    left?: KeyHandler;
    right?: KeyHandler;
  },
  options: Omit<UseKeypressOptions, 'modifiers'> = {}
) {
  const handleArrowKey = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          handlers.up?.(e);
          break;
        case 'ArrowDown':
          handlers.down?.(e);
          break;
        case 'ArrowLeft':
          handlers.left?.(e);
          break;
        case 'ArrowRight':
          handlers.right?.(e);
          break;
      }
    },
    [handlers]
  );

  useKeypress(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], handleArrowKey, {
    preventDefault: true,
    ...options,
  });
}

/**
 * useHotkeys Hook
 * 
 * Register multiple keyboard shortcuts.
 * 
 * @param hotkeys - Object mapping keys to handlers
 * @param options - Configuration options
 * 
 * @example
 * useHotkeys({
 *   'Meta+k': () => openSearch(),
 *   'Meta+/': () => showHelp(),
 *   'Escape': () => closeModal()
 * });
 */
export function useHotkeys(
  hotkeys: Record<string, KeyHandler>,
  options: Omit<UseKeypressOptions, 'modifiers'> = {}
) {
  const handleHotkey = useCallback(
    (e: KeyboardEvent) => {
      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.altKey) modifiers.push('Alt');
      if (e.metaKey) modifiers.push('Meta');

      const keyCombo = [...modifiers, e.key].join('+');
      const handler = hotkeys[keyCombo] || hotkeys[e.key];

      if (handler) {
        e.preventDefault();
        handler(e);
      }
    },
    [hotkeys]
  );

  useEffect(() => {
    const targetElement = options.target || window;
    if (!targetElement) return;

    const event = options.event || 'keydown';
    targetElement.addEventListener(event, handleHotkey as any);

    return () => {
      targetElement.removeEventListener(event, handleHotkey as any);
    };
  }, [handleHotkey, options.target, options.event]);
}

/**
 * useCommandPalette Hook
 * 
 * Open command palette with Cmd+K or Ctrl+K.
 * 
 * @param onOpen - Callback when palette should open
 * 
 * @example
 * useCommandPalette(() => setCommandPaletteOpen(true));
 */
export function useCommandPalette(onOpen: () => void) {
  useKeypress('k', onOpen, {
    preventDefault: true,
    modifiers: { meta: true },
  });

  // Also support Ctrl+K on Windows/Linux
  useKeypress('k', onOpen, {
    preventDefault: true,
    modifiers: { ctrl: true },
  });
}
