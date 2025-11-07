import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import { useKeyboardShortcutContext } from '../../contexts/KeyboardShortcutContext';

interface GlobalKeyboardShortcutsProps {
  onCreateBoard?: () => void;
  onCreateTask?: () => void;
  onFocusSearch?: () => void;
}

/**
 * Component that registers global keyboard shortcuts
 * Should be rendered once at the app level
 */
export default function GlobalKeyboardShortcuts({
  onCreateBoard,
  onCreateTask,
  onFocusSearch,
}: GlobalKeyboardShortcutsProps) {
  const { toggleHelp, registerShortcut, unregisterShortcut } = useKeyboardShortcutContext();
  const location = useLocation();

  // Register help shortcut in context (always available)
  useEffect(() => {
    registerShortcut({
      id: 'help',
      key: '?',
      shiftKey: true,
      description: 'Show keyboard shortcuts',
      category: 'General',
    });

    return () => unregisterShortcut('help');
  }, [registerShortcut, unregisterShortcut]);

  // Help shortcut - always available
  useKeyboardShortcut(
    { key: '?', shiftKey: true },
    toggleHelp,
    [toggleHelp],
    true
  );

  // Create board shortcut - only on dashboard
  const isOnDashboard = location.pathname === '/dashboard';
  useEffect(() => {
    if (isOnDashboard && onCreateBoard) {
      registerShortcut({
        id: 'create-board',
        key: 'b',
        description: 'Create new board',
        category: 'Dashboard',
      });
    } else {
      unregisterShortcut('create-board');
    }
  }, [isOnDashboard, onCreateBoard, registerShortcut, unregisterShortcut]);

  useKeyboardShortcut(
    { key: 'b' },
    () => onCreateBoard?.(),
    [onCreateBoard],
    isOnDashboard && !!onCreateBoard
  );

  // Create task shortcut - only on board pages
  const isOnBoard = location.pathname.startsWith('/boards/');
  useEffect(() => {
    if (isOnBoard && onCreateTask) {
      registerShortcut({
        id: 'create-task',
        key: 'c',
        description: 'Create new task',
        category: 'Board',
      });
    } else {
      unregisterShortcut('create-task');
    }
  }, [isOnBoard, onCreateTask, registerShortcut, unregisterShortcut]);

  useKeyboardShortcut(
    { key: 'c' },
    () => onCreateTask?.(),
    [onCreateTask],
    isOnBoard && !!onCreateTask
  );

  // Focus search shortcut
  useEffect(() => {
    if (onFocusSearch) {
      registerShortcut({
        id: 'focus-search',
        key: '/',
        description: 'Focus search input',
        category: 'Navigation',
      });
    } else {
      unregisterShortcut('focus-search');
    }
  }, [onFocusSearch, registerShortcut, unregisterShortcut]);

  useKeyboardShortcut(
    { key: '/' },
    () => {
      // Focus search input
      onFocusSearch?.();
    },
    [onFocusSearch],
    !!onFocusSearch
  );

  // Escape key - handled by modals themselves, but we register it in the help
  useEffect(() => {
    registerShortcut({
      id: 'escape',
      key: 'Escape',
      description: 'Close modal or dialog',
      category: 'General',
    });

    return () => unregisterShortcut('escape');
  }, [registerShortcut, unregisterShortcut]);

  return null; // This component doesn't render anything
}
