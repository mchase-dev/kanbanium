import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ErrorFallback from '../../components/common/ErrorFallback';

describe('ErrorFallback', () => {
  it('should render error message', () => {
    render(<ErrorFallback />);

    expect(screen.getByText('Oops! Something went wrong')).toBeInTheDocument();
    expect(
      screen.getByText(/We encountered an unexpected error/)
    ).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<ErrorFallback />);

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to dashboard/i })).toBeInTheDocument();
  });

  it('should call resetError when Try Again is clicked', () => {
    const resetError = vi.fn();

    render(<ErrorFallback resetError={resetError} />);

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(resetError).toHaveBeenCalledTimes(1);
  });

  it('should redirect to home when Go to Dashboard is clicked', () => {
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<ErrorFallback />);

    const goHomeButton = screen.getByRole('button', { name: /go to dashboard/i });
    fireEvent.click(goHomeButton);

    expect(window.location.href).toBe('/');
  });

  it('should redirect to home when Try Again is clicked without resetError', () => {
    delete (window as any).location;
    window.location = { href: '' } as any;

    render(<ErrorFallback />);

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(window.location.href).toBe('/');
  });

  it('should show error details in development mode', () => {
    const error = new Error('Test error message');
    error.stack = 'Error: Test error message\n  at TestComponent';

    // Set dev mode
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = true;

    render(<ErrorFallback error={error} />);

    // Look for details element
    const details = screen.getByText(/Error details/);
    expect(details).toBeInTheDocument();

    // Click to expand
    fireEvent.click(details);

    expect(screen.getByText(/Test error message/)).toBeInTheDocument();

    // Restore
    (import.meta.env as any).DEV = originalEnv;
  });

  it('should not show error details in production mode', () => {
    const error = new Error('Test error message');

    // Set production mode
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = false;

    render(<ErrorFallback error={error} />);

    expect(screen.queryByText(/Error details/)).not.toBeInTheDocument();

    // Restore
    (import.meta.env as any).DEV = originalEnv;
  });
});
