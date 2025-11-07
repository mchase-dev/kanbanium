import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../contexts/ThemeContext';
import type { ReactNode } from 'react';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock matchMedia
const createMatchMediaMock = (matches: boolean) => {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
};

describe('ThemeContext', () => {
  let matchMediaMock: ReturnType<typeof createMatchMediaMock>;

  beforeEach(() => {
    localStorageMock.clear();
    // Default to light mode
    matchMediaMock = createMatchMediaMock(false);
    window.matchMedia = matchMediaMock as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider>{children}</ThemeProvider>
  );

  describe('useTheme hook', () => {
    it('should throw error when used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const consoleError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('useTheme must be used within a ThemeProvider');

      console.error = consoleError;
    });

    it('should return theme context value', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('actualTheme');
      expect(result.current).toHaveProperty('setTheme');
      expect(result.current).toHaveProperty('toggleTheme');
    });
  });

  describe('Theme initialization', () => {
    it('should default to system theme when no localStorage value', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('system');
      expect(result.current.actualTheme).toBe('light');
    });

    it('should load theme from localStorage', () => {
      localStorageMock.setItem('kanbanium-theme', 'dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('dark');
      expect(result.current.actualTheme).toBe('dark');
    });

    it('should handle invalid localStorage values', () => {
      localStorageMock.setItem('kanbanium-theme', 'invalid');

      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current.theme).toBe('system');
    });
  });

  describe('setTheme', () => {
    it('should update theme to light', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.actualTheme).toBe('light');
      expect(localStorageMock.getItem('kanbanium-theme')).toBe('light');
    });

    it('should update theme to dark', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.actualTheme).toBe('dark');
      expect(localStorageMock.getItem('kanbanium-theme')).toBe('dark');
    });

    it('should update theme to system', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.theme).toBe('system');
      expect(result.current.actualTheme).toBe('light'); // Based on mock
      expect(localStorageMock.getItem('kanbanium-theme')).toBe('system');
    });

    it('should persist theme changes to localStorage', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(localStorageMock.getItem('kanbanium-theme')).toBe('dark');

      act(() => {
        result.current.setTheme('light');
      });

      expect(localStorageMock.getItem('kanbanium-theme')).toBe('light');
    });
  });

  describe('toggleTheme', () => {
    it('should toggle from light to dark', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.actualTheme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('light');
      expect(result.current.actualTheme).toBe('light');
    });

    it('should toggle from system (light) to dark', () => {
      matchMediaMock = createMatchMediaMock(false); // System is light
      window.matchMedia = matchMediaMock as any;

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.actualTheme).toBe('light');

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.actualTheme).toBe('dark');
    });
  });

  describe('System theme detection', () => {
    it('should detect system light theme', () => {
      matchMediaMock = createMatchMediaMock(false);
      window.matchMedia = matchMediaMock as any;

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.actualTheme).toBe('light');
    });

    it('should detect system dark theme', () => {
      matchMediaMock = createMatchMediaMock(true);
      window.matchMedia = matchMediaMock as any;

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.actualTheme).toBe('dark');
    });

    it('should listen for system theme changes', async () => {
      let mediaQueryListener: ((e: MediaQueryListEvent) => void) | null = null;

      matchMediaMock = vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn((event, listener) => {
          if (event === 'change') {
            mediaQueryListener = listener;
          }
        }),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      window.matchMedia = matchMediaMock as any;

      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('system');
      });

      expect(result.current.actualTheme).toBe('light');

      // Simulate system theme change to dark
      if (mediaQueryListener) {
        act(() => {
          mediaQueryListener!({ matches: true } as MediaQueryListEvent);
        });

        await waitFor(() => {
          expect(result.current.actualTheme).toBe('dark');
        });
      }
    });

    it('should not listen for system changes when theme is not system', () => {
      // Set theme to light before rendering to avoid initial system theme mount
      localStorageMock.setItem('kanbanium-theme', 'light');

      const addEventListener = vi.fn();
      matchMediaMock = vi.fn(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener,
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      window.matchMedia = matchMediaMock as any;

      const { result } = renderHook(() => useTheme(), { wrapper });

      // Theme is already light, no system listener should be added
      expect(result.current.theme).toBe('light');
      expect(addEventListener).not.toHaveBeenCalled();
    });
  });

  describe('Document attribute updates', () => {
    it('should set data-theme attribute on document', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('should set colorScheme style on document', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.style.colorScheme).toBe('dark');
    });

    it('should update document attributes when theme changes', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      act(() => {
        result.current.setTheme('light');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(document.documentElement.style.colorScheme).toBe('light');

      act(() => {
        result.current.setTheme('dark');
      });

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      expect(document.documentElement.style.colorScheme).toBe('dark');
    });
  });
});
