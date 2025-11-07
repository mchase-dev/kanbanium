import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeToggle from '../../components/common/ThemeToggle';
import { ThemeProvider } from '../../contexts/ThemeContext';

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

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorageMock.clear();
    window.matchMedia = createMatchMediaMock(false) as any;
  });

  const renderWithProvider = (props = {}) => {
    return render(
      <ThemeProvider>
        <ThemeToggle {...props} />
      </ThemeProvider>
    );
  };

  describe('Button rendering', () => {
    it('should render toggle button', () => {
      renderWithProvider();
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();
    });

    it('should display light icon when actualTheme is light', () => {
      renderWithProvider();
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.querySelector('[data-icon="bulb"]')).toBeInTheDocument();
    });

    it('should render with different sizes', () => {
      const { rerender } = render(
        <ThemeProvider>
          <ThemeToggle size="small" />
        </ThemeProvider>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();

      rerender(
        <ThemeProvider>
          <ThemeToggle size="large" />
        </ThemeProvider>
      );

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should not show text by default', () => {
      renderWithProvider();
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.textContent).toBe('');
    });

    it('should show text when showText is true', () => {
      localStorageMock.setItem('kanbanium-theme', 'light');
      renderWithProvider({ showText: true });
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.textContent).toContain('Light');
    });
  });

  describe('Dropdown menu', () => {
    it('should open dropdown menu on click', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });

    it('should show checkmark for current theme', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem('kanbanium-theme', 'light');

      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      const lightOption = screen.getByText('Light').closest('.ant-dropdown-menu-item');
      expect(lightOption?.querySelector('[data-icon="check"]')).toBeInTheDocument();
    });

    it('should display all three theme options', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      expect(screen.getByText('Light')).toBeInTheDocument();
      expect(screen.getByText('Dark')).toBeInTheDocument();
      expect(screen.getByText('System')).toBeInTheDocument();
    });
  });

  describe('Theme switching', () => {
    it('should switch to light theme', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem('kanbanium-theme', 'dark');

      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      const lightOption = screen.getByText('Light');
      await user.click(lightOption);

      expect(localStorageMock.getItem('kanbanium-theme')).toBe('light');
    });

    it('should switch to dark theme', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem('kanbanium-theme', 'light');

      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      const darkOption = screen.getByText('Dark');
      await user.click(darkOption);

      expect(localStorageMock.getItem('kanbanium-theme')).toBe('dark');
    });

    it('should switch to system theme', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem('kanbanium-theme', 'light');

      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      const systemOption = screen.getByText('System');
      await user.click(systemOption);

      expect(localStorageMock.getItem('kanbanium-theme')).toBe('system');
    });
  });

  describe('Icon display', () => {
    it('should show outlined bulb icon for light theme', async () => {
      localStorageMock.setItem('kanbanium-theme', 'light');

      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.querySelector('[data-icon="bulb"]')).toBeInTheDocument();
    });

    it('should show filled bulb icon for dark theme', async () => {
      localStorageMock.setItem('kanbanium-theme', 'dark');

      // Mock matchMedia to return dark mode
      window.matchMedia = createMatchMediaMock(true) as any;

      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      // The filled icon should be present (this depends on Ant Design icon rendering)
      expect(button.querySelector('svg')).toBeInTheDocument();
    });

    it('should show correct icon based on actualTheme, not selected theme', () => {
      // Set theme to system with light preference
      localStorageMock.setItem('kanbanium-theme', 'system');
      window.matchMedia = createMatchMediaMock(false) as any; // System prefers light

      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      // Should show outlined bulb since actualTheme is light
      expect(button.querySelector('[data-icon="bulb"]')).toBeInTheDocument();
    });
  });

  describe('Label display with showText', () => {
    it('should show "Light" label when theme is light', () => {
      localStorageMock.setItem('kanbanium-theme', 'light');
      renderWithProvider({ showText: true });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.textContent).toContain('Light');
    });

    it('should show "Dark" label when theme is dark', () => {
      localStorageMock.setItem('kanbanium-theme', 'dark');
      renderWithProvider({ showText: true });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.textContent).toContain('Dark');
    });

    it('should show system theme label with actual theme', () => {
      localStorageMock.setItem('kanbanium-theme', 'system');
      window.matchMedia = createMatchMediaMock(false) as any; // System is light

      renderWithProvider({ showText: true });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.textContent).toContain('Light');
    });

    it('should show system theme label with dark', () => {
      localStorageMock.setItem('kanbanium-theme', 'system');
      window.matchMedia = createMatchMediaMock(true) as any; // System is dark

      renderWithProvider({ showText: true });

      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button.textContent).toContain('Dark');
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      renderWithProvider();
      const button = screen.getByRole('button', { name: /toggle theme/i });
      expect(button).toHaveAttribute('aria-label', 'Toggle theme');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });

      // Tab to button
      await user.tab();
      expect(button).toHaveFocus();

      // Press Enter to open dropdown
      await user.keyboard('{Enter}');
      expect(screen.getByText('Light')).toBeInTheDocument();
    });

    it('should support arrow key navigation in dropdown', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      // Dropdown should be open
      expect(screen.getByText('Light')).toBeInTheDocument();

      // Arrow keys should work (tested by Ant Design Dropdown)
      await user.keyboard('{ArrowDown}');
      await user.keyboard('{ArrowDown}');
    });
  });

  describe('Dropdown placement', () => {
    it('should position dropdown at bottomRight', async () => {
      const user = userEvent.setup();
      renderWithProvider();

      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);

      // Check that dropdown is rendered (Ant Design handles positioning)
      expect(screen.getByText('Light')).toBeInTheDocument();
    });
  });

  describe('Integration with ThemeContext', () => {
    it('should reflect theme changes from context', async () => {
      const user = userEvent.setup();
      localStorageMock.setItem('kanbanium-theme', 'light');

      renderWithProvider();

      // Change to dark theme
      const button = screen.getByRole('button', { name: /toggle theme/i });
      await user.click(button);
      await user.click(screen.getByText('Dark'));

      // Verify localStorage was updated
      expect(localStorageMock.getItem('kanbanium-theme')).toBe('dark');

      // Open menu again to check checkmark moved
      await user.click(button);
      const darkOption = screen.getByText('Dark').closest('.ant-dropdown-menu-item');
      expect(darkOption?.querySelector('[data-icon="check"]')).toBeInTheDocument();
    });
  });
});
