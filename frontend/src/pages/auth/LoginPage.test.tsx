import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';

// Mock react-router-dom
const mockNavigate = vi.fn();
let mockLocation = '/login';

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  Navigate: ({ to }: any) => {
    mockNavigate(to);
    return <div data-testid="navigate">{`Redirecting to ${to}`}</div>;
  },
  useLocation: () => ({ pathname: mockLocation }),
  useNavigate: () => mockNavigate,
}));

// Mock AuthContext
let mockIsAuthenticated = false;
const mockLogin = vi.fn();

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: mockIsAuthenticated,
    login: mockLogin,
  }),
}));

// Mock AuthLayout
vi.mock('../../layouts/AuthLayout', () => ({
  AuthLayout: ({ children }: any) => <div data-testid="auth-layout">{children}</div>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockIsAuthenticated = false;
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  it('renders login form with title', () => {
    render(<LoginPage />);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders email/username input field', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/email or username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email or username/i)).toBeInTheDocument();
  });

  it('renders password input field', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
  });

  it('renders sign in button', () => {
    render(<LoginPage />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders sign up link', () => {
    render(<LoginPage />);
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    const signUpLink = screen.getByRole('link', { name: /sign up/i });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toHaveAttribute('href', '/register');
  });

  it('renders inside AuthLayout', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('auth-layout')).toBeInTheDocument();
  });

  it('shows validation error when email is empty', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter your email or username/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows validation error when password is empty', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email or username/i);
    await user.type(emailInput, 'test@example.com');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows validation error when password is less than 6 characters', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email or username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '12345');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login function with correct values on valid submission', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email or username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolveLogin: any;
    mockLogin.mockImplementation(
      () => new Promise((resolve) => (resolveLogin = resolve))
    );

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email or username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveClass('ant-btn-loading');
    });

    resolveLogin();
  });

  it('handles login errors gracefully', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText(/enter your email or username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });

    // Button should not be loading anymore after error
    await waitFor(() => {
      expect(submitButton).not.toHaveClass('ant-btn-loading');
    });
  });

  it('redirects to dashboard when already authenticated', () => {
    mockIsAuthenticated = true;

    render(<LoginPage />);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument();
  });

  it('does not show login form when authenticated', () => {
    mockIsAuthenticated = true;

    render(<LoginPage />);

    expect(screen.queryByPlaceholderText(/enter your email or username/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/enter your password/i)).not.toBeInTheDocument();
  });
});
