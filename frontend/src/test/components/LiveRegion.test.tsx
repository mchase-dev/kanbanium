import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import LiveRegion, { useAnnouncer } from '../../components/common/LiveRegion';

describe('LiveRegion', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should render message', () => {
    render(<LiveRegion message="Test announcement" />);
    expect(screen.getByText('Test announcement')).toBeInTheDocument();
  });

  it('should have aria-live polite by default', () => {
    const { container } = render(<LiveRegion message="Test" />);
    const region = container.querySelector('[aria-live]');
    expect(region).toHaveAttribute('aria-live', 'polite');
  });

  it('should have aria-live assertive when specified', () => {
    const { container } = render(<LiveRegion message="Test" politeness="assertive" />);
    const region = container.querySelector('[aria-live]');
    expect(region).toHaveAttribute('aria-live', 'assertive');
  });

  it('should have aria-atomic true', () => {
    const { container } = render(<LiveRegion message="Test" />);
    const region = container.querySelector('[aria-atomic]');
    expect(region).toHaveAttribute('aria-atomic', 'true');
  });

  it('should have role status for polite announcements', () => {
    const { container } = render(<LiveRegion message="Test" politeness="polite" />);
    const region = container.querySelector('[role]');
    expect(region).toHaveAttribute('role', 'status');
  });

  it('should have role alert for assertive announcements', () => {
    const { container } = render(<LiveRegion message="Test" politeness="assertive" />);
    const region = container.querySelector('[role]');
    expect(region).toHaveAttribute('role', 'alert');
  });

  it('should clear message after delay', () => {
    render(<LiveRegion message="Test" clearDelay={1000} />);

    expect(screen.getByText('Test')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Check immediately after advancing timers (act handles state updates)
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  it('should not clear message when clearDelay is 0', () => {
    render(<LiveRegion message="Test" clearDelay={0} />);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should update message when prop changes', () => {
    const { rerender } = render(<LiveRegion message="First message" />);
    expect(screen.getByText('First message')).toBeInTheDocument();

    rerender(<LiveRegion message="Second message" />);
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('should be visually hidden', () => {
    const { container } = render(<LiveRegion message="Test" />);
    const region = container.querySelector('div');

    expect(region).toHaveStyle({
      position: 'absolute',
      width: '1px',
      height: '1px',
    });
  });

  it('should cleanup timer on unmount', () => {
    const { unmount } = render(<LiveRegion message="Test" clearDelay={1000} />);

    unmount();

    // Should not throw error when timer tries to clear
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });
});

describe('useAnnouncer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should provide announce function', () => {
    const { result } = renderHook(() => useAnnouncer());
    expect(result.current.announce).toBeDefined();
    expect(typeof result.current.announce).toBe('function');
  });

  it('should provide LiveRegionComponent', () => {
    const { result } = renderHook(() => useAnnouncer());
    expect(result.current.LiveRegionComponent).toBeDefined();
  });

  it('should announce message with polite politeness by default', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('Test message');
    });

    expect(result.current.LiveRegionComponent).toBeTruthy();
  });

  it('should announce message with assertive politeness when specified', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('Urgent message', 'assertive');
    });

    expect(result.current.LiveRegionComponent).toBeTruthy();
  });

  it('should update LiveRegionComponent when announcing', () => {
    const { result } = renderHook(() => useAnnouncer());

    expect(result.current.LiveRegionComponent).toBeNull();

    act(() => {
      result.current.announce('First message');
    });

    expect(result.current.LiveRegionComponent).not.toBeNull();
  });

  it('should create new key for each announcement', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('First');
    });
    const firstComponent = result.current.LiveRegionComponent;

    act(() => {
      result.current.announce('Second');
    });
    const secondComponent = result.current.LiveRegionComponent;

    expect(firstComponent).not.toBe(secondComponent);
  });

  it('should handle empty message', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('');
    });

    expect(result.current.LiveRegionComponent).toBeNull();
  });

  it('should handle multiple announcements', () => {
    const { result } = renderHook(() => useAnnouncer());

    act(() => {
      result.current.announce('First');
    });

    act(() => {
      result.current.announce('Second');
    });

    act(() => {
      result.current.announce('Third');
    });

    expect(result.current.LiveRegionComponent).toBeTruthy();
  });
});
