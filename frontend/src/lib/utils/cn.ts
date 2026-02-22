/**
 * Utility function to combine class names
 * Simple replacement for clsx/tailwind-merge functionality
 */

export function cn(...inputs: (string | undefined | null | boolean)[]): string {
  return inputs.filter(Boolean).join(' ');
}
