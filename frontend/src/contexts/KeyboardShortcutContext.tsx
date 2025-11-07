import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { KeyboardShortcutConfig } from '../hooks/useKeyboardShortcut';

export interface ShortcutRegistration extends KeyboardShortcutConfig {
  id: string;
  category?: string;
  description: string;
}

interface KeyboardShortcutContextValue {
  shortcuts: ShortcutRegistration[];
  registerShortcut: (shortcut: ShortcutRegistration) => void;
  unregisterShortcut: (id: string) => void;
  isHelpVisible: boolean;
  showHelp: () => void;
  hideHelp: () => void;
  toggleHelp: () => void;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue | undefined>(undefined);

interface KeyboardShortcutProviderProps {
  children: ReactNode;
}

export function KeyboardShortcutProvider({ children }: KeyboardShortcutProviderProps) {
  const [shortcuts, setShortcuts] = useState<ShortcutRegistration[]>([]);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const registerShortcut = useCallback((shortcut: ShortcutRegistration) => {
    setShortcuts((prev) => {
      // Remove existing shortcut with same ID
      const filtered = prev.filter((s) => s.id !== shortcut.id);
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((id: string) => {
    setShortcuts((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const showHelp = useCallback(() => {
    setIsHelpVisible(true);
  }, []);

  const hideHelp = useCallback(() => {
    setIsHelpVisible(false);
  }, []);

  const toggleHelp = useCallback(() => {
    setIsHelpVisible((prev) => !prev);
  }, []);

  return (
    <KeyboardShortcutContext.Provider
      value={{
        shortcuts,
        registerShortcut,
        unregisterShortcut,
        isHelpVisible,
        showHelp,
        hideHelp,
        toggleHelp,
      }}
    >
      {children}
    </KeyboardShortcutContext.Provider>
  );
}

export function useKeyboardShortcutContext() {
  const context = useContext(KeyboardShortcutContext);
  if (context === undefined) {
    throw new Error('useKeyboardShortcutContext must be used within a KeyboardShortcutProvider');
  }
  return context;
}

/**
 * Hook to register a shortcut in the global context
 */
export function useRegisterShortcut(shortcut: ShortcutRegistration, enabled: boolean = true) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcutContext();

  // Register on mount, unregister on unmount
  if (enabled) {
    registerShortcut(shortcut);
  }

  return () => {
    unregisterShortcut(shortcut.id);
  };
}

/**
 * Format keyboard shortcut for display
 */
export function formatShortcut(config: KeyboardShortcutConfig): string {
  const parts: string[] = [];

  // Detect OS for better modifier display
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  if (config.ctrlKey) {
    parts.push(isMac ? '⌃' : 'Ctrl');
  }
  if (config.altKey) {
    parts.push(isMac ? '⌥' : 'Alt');
  }
  if (config.shiftKey) {
    parts.push(isMac ? '⇧' : 'Shift');
  }
  if (config.metaKey) {
    parts.push(isMac ? '⌘' : 'Win');
  }

  // Format key name
  let keyName = config.key;
  if (keyName === ' ') keyName = 'Space';
  if (keyName === 'Escape') keyName = 'Esc';
  if (keyName === 'ArrowUp') keyName = '↑';
  if (keyName === 'ArrowDown') keyName = '↓';
  if (keyName === 'ArrowLeft') keyName = '←';
  if (keyName === 'ArrowRight') keyName = '→';

  parts.push(keyName.toUpperCase());

  return parts.join(isMac ? '' : '+');
}
