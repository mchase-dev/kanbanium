import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AppError,
  ErrorType,
  getErrorType,
  getUserFriendlyMessage,
  logError,
  handleError,
} from '../../lib/error-handler';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    warning: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe('AppError', () => {
  it('should create an AppError with correct properties', () => {
    const error = new AppError('Test message', ErrorType.VALIDATION, 400);

    expect(error.message).toBe('Test message');
    expect(error.type).toBe(ErrorType.VALIDATION);
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AppError');
  });

  it('should default to UNKNOWN error type', () => {
    const error = new AppError('Test message');

    expect(error.type).toBe(ErrorType.UNKNOWN);
    expect(error.statusCode).toBeUndefined();
  });

  it('should store original error', () => {
    const originalError = new Error('Original');
    const error = new AppError('Wrapped', ErrorType.SERVER, 500, originalError);

    expect(error.originalError).toBe(originalError);
  });
});

describe('getErrorType', () => {
  it('should return type from AppError', () => {
    const error = new AppError('Test', ErrorType.AUTHENTICATION);
    expect(getErrorType(error)).toBe(ErrorType.AUTHENTICATION);
  });

  it('should detect network errors from TypeError', () => {
    const error = new TypeError('fetch failed');
    expect(getErrorType(error)).toBe(ErrorType.NETWORK);
  });

  it('should detect authentication errors (401)', () => {
    const error = { isAxiosError: true, response: { status: 401 } };
    expect(getErrorType(error)).toBe(ErrorType.AUTHENTICATION);
  });

  it('should detect authorization errors (403)', () => {
    const error = { isAxiosError: true, response: { status: 403 } };
    expect(getErrorType(error)).toBe(ErrorType.AUTHORIZATION);
  });

  it('should detect not found errors (404)', () => {
    const error = { isAxiosError: true, response: { status: 404 } };
    expect(getErrorType(error)).toBe(ErrorType.NOT_FOUND);
  });

  it('should detect validation errors (4xx)', () => {
    const error = { isAxiosError: true, response: { status: 422 } };
    expect(getErrorType(error)).toBe(ErrorType.VALIDATION);
  });

  it('should detect server errors (5xx)', () => {
    const error = { isAxiosError: true, response: { status: 500 } };
    expect(getErrorType(error)).toBe(ErrorType.SERVER);
  });

  it('should detect network errors from axios without response', () => {
    const error = { isAxiosError: true };
    expect(getErrorType(error)).toBe(ErrorType.NETWORK);
  });

  it('should return UNKNOWN for unrecognized errors', () => {
    const error = new Error('Unknown error');
    expect(getErrorType(error)).toBe(ErrorType.UNKNOWN);
  });
});

describe('getUserFriendlyMessage', () => {
  it('should return message from AppError', () => {
    const error = new AppError('Custom message', ErrorType.VALIDATION);
    expect(getUserFriendlyMessage(error)).toBe('Custom message');
  });

  it('should return network error message', () => {
    const error = new TypeError('fetch failed');
    const message = getUserFriendlyMessage(error);
    expect(message).toContain('Network error');
    expect(message).toContain('internet connection');
  });

  it('should return authentication error message', () => {
    const error = { isAxiosError: true, response: { status: 401 } };
    const message = getUserFriendlyMessage(error);
    expect(message).toContain('session has expired');
  });

  it('should return authorization error message', () => {
    const error = { isAxiosError: true, response: { status: 403 } };
    const message = getUserFriendlyMessage(error);
    expect(message).toContain('permission');
  });

  it('should return not found error message', () => {
    const error = { isAxiosError: true, response: { status: 404 } };
    const message = getUserFriendlyMessage(error);
    expect(message).toContain('not found');
  });

  it('should extract validation message from response', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'Email is required' },
      },
    };
    const message = getUserFriendlyMessage(error);
    expect(message).toBe('Email is required');
  });

  it('should return server error message', () => {
    const error = { isAxiosError: true, response: { status: 500 } };
    const message = getUserFriendlyMessage(error);
    expect(message).toContain('Server error');
  });

  it('should return generic message for unknown errors in production', () => {
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = false;

    const error = new Error('Detailed error');
    const message = getUserFriendlyMessage(error);
    expect(message).toBe('An unexpected error occurred. Please try again.');

    (import.meta.env as any).DEV = originalEnv;
  });

  it('should return actual error message in development', () => {
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = true;

    const error = new Error('Detailed error');
    const message = getUserFriendlyMessage(error);
    expect(message).toBe('Detailed error');

    (import.meta.env as any).DEV = originalEnv;
  });
});

describe('logError', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should log error in development mode', () => {
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = true;

    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test error');
    const context = { userId: '123' };

    logError(error, context);

    expect(consoleSpy).toHaveBeenCalledWith('Error:', error);
    expect(consoleSpy).toHaveBeenCalledWith('Context:', context);

    (import.meta.env as any).DEV = originalEnv;
  });

  it('should not log to console in production', () => {
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = false;

    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test error');

    logError(error);

    expect(consoleSpy).not.toHaveBeenCalled();

    (import.meta.env as any).DEV = originalEnv;
  });
});

describe('handleError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should show error toast for non-authentication errors', () => {
    const error = new AppError('Validation failed', ErrorType.VALIDATION);

    handleError(error);

    expect(toast.error).toHaveBeenCalledWith('Validation failed');
  });

  it('should not show toast for authentication errors', () => {
    const error = new AppError('Session expired', ErrorType.AUTHENTICATION);

    handleError(error);

    expect(toast.error).not.toHaveBeenCalled();
  });

  it('should show toast with description for network errors', () => {
    const error = new AppError('Network error', ErrorType.NETWORK);

    handleError(error);

    expect(toast.error).toHaveBeenCalledWith('Network error', {
      duration: 5000,
      description: 'Please check your connection',
    });
  });

  it('should log error with context', () => {
    const originalEnv = import.meta.env.DEV;
    (import.meta.env as any).DEV = true;

    const consoleSpy = vi.spyOn(console, 'error');
    const error = new Error('Test');
    const context = { page: 'dashboard' };

    handleError(error, context);

    expect(consoleSpy).toHaveBeenCalledWith('Error:', error);
    expect(consoleSpy).toHaveBeenCalledWith('Context:', context);

    (import.meta.env as any).DEV = originalEnv;
  });
});
