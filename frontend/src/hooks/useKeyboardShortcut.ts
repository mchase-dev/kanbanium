import { useEffect, useCallback } from 'react';

export interface KeyboardShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description?: string;
  preventDefault?: boolean;
}

/**
 * Hook to register a keyboard shortcut
 * @param config - Keyboard shortcut configuration
 * @param callback - Function to call when shortcut is triggered
 * @param deps - Dependencies array for the callback
 * @param enabled - Whether the shortcut is enabled (default: true)
 */
export function useKeyboardShortcut(
  config: KeyboardShortcutConfig,
  callback: () => void,
  deps: React.DependencyList = [],
  enabled: boolean = true
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore shortcuts when typing in input elements (unless explicitly allowed)
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Allow '/' in search and 'Esc' even in inputs
      if (isInput && config.key !== '/' && config.key !== 'Escape') {
        return;
      }

      // Check if all modifiers match
      const modifiersMatch =
        (config.ctrlKey === undefined || event.ctrlKey === config.ctrlKey) &&
        (config.shiftKey === undefined || event.shiftKey === config.shiftKey) &&
        (config.altKey === undefined || event.altKey === config.altKey) &&
        (config.metaKey === undefined || event.metaKey === config.metaKey);

      // Check if key matches (case-insensitive)
      const keyMatches = event.key.toLowerCase() === config.key.toLowerCase();

      if (modifiersMatch && keyMatches) {
        if (config.preventDefault !== false) {
          event.preventDefault();
        }
        callback();
      }
    },
    [config, callback, enabled, ...deps]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Hook to register multiple keyboard shortcuts at once
 */
export function useKeyboardShortcuts(
  shortcuts: Array<{
    config: KeyboardShortcutConfig;
    callback: () => void;
    enabled?: boolean;
  }>,
  deps: React.DependencyList = []
) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      for (const { config, callback, enabled = true } of shortcuts) {
        if (!enabled) continue;

        // Skip if in input (except for special keys)
        if (isInput && config.key !== '/' && config.key !== 'Escape') {
          continue;
        }

        // Check modifiers
        const modifiersMatch =
          (config.ctrlKey === undefined || event.ctrlKey === config.ctrlKey) &&
          (config.shiftKey === undefined || event.shiftKey === config.shiftKey) &&
          (config.altKey === undefined || event.altKey === config.altKey) &&
          (config.metaKey === undefined || event.metaKey === config.metaKey);

        // Check key
        const keyMatches = event.key.toLowerCase() === config.key.toLowerCase();

        if (modifiersMatch && keyMatches) {
          if (config.preventDefault !== false) {
            event.preventDefault();
          }
          callback();
          break; // Only trigger first matching shortcut
        }
      }
    },
    [shortcuts, ...deps]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
