import { toast } from 'sonner';

/**
 * Error types for categorization
 */
export const ErrorType = {
  NETWORK: 'NETWORK',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  VALIDATION: 'VALIDATION',
  NOT_FOUND: 'NOT_FOUND',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
} as const;

export type ErrorType = (typeof ErrorType)[keyof typeof ErrorType];

/**
 * Custom error class with additional context
 */
export class AppError extends Error {
  type: ErrorType;
  statusCode?: number;
  originalError?: unknown;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN,
    statusCode?: number,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.statusCode = statusCode;
    this.originalError = originalError;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Determines error type from error object
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof AppError) {
    return error.type;
  }

  // Check for network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ErrorType.NETWORK;
  }

  // Check for axios errors
  if (typeof error === 'object' && error !== null && 'isAxiosError' in error) {
    const axiosError = error as { response?: { status?: number } };
    const status = axiosError.response?.status;

    if (!status) {
      return ErrorType.NETWORK;
    }

    if (status === 401) {
      return ErrorType.AUTHENTICATION;
    }

    if (status === 403) {
      return ErrorType.AUTHORIZATION;
    }

    if (status === 404) {
      return ErrorType.NOT_FOUND;
    }

    if (status >= 400 && status < 500) {
      return ErrorType.VALIDATION;
    }

    if (status >= 500) {
      return ErrorType.SERVER;
    }
  }

  return ErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyMessage(error: unknown): string {
  // AppError already has user-friendly message
  if (error instanceof AppError) {
    return error.message;
  }

  const errorType = getErrorType(error);

  switch (errorType) {
    case ErrorType.NETWORK:
      return 'Network error. Please check your internet connection and try again.';

    case ErrorType.AUTHENTICATION:
      return 'Your session has expired. Please log in again.';

    case ErrorType.AUTHORIZATION:
      return "You don't have permission to perform this action.";

    case ErrorType.NOT_FOUND:
      return 'The requested resource was not found.';

    case ErrorType.VALIDATION:
      // Try to extract validation message from error
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof error.response === 'object' &&
        error.response !== null &&
        'data' in error.response
      ) {
        const data = error.response.data as { message?: string };
        if (data.message) {
          return data.message;
        }
      }
      return 'Invalid input. Please check your data and try again.';

    case ErrorType.SERVER:
      return 'Server error. Please try again later.';

    case ErrorType.UNKNOWN:
    default:
      if (error instanceof Error) {
        // In development, show actual error message
        if (import.meta.env.DEV) {
          return error.message;
        }
      }
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Log error to console (and eventually to error tracking service)
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
  }

  // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, { extra: context });
  // }
}

/**
 * Handle error globally - log and show toast
 */
export function handleError(error: unknown, context?: Record<string, unknown>): void {
  logError(error, context);

  const message = getUserFriendlyMessage(error);
  const errorType = getErrorType(error);

  // Don't show toast for authentication errors (handled by AuthContext)
  if (errorType === ErrorType.AUTHENTICATION) {
    return;
  }

  // Show appropriate toast based on error type
  if (errorType === ErrorType.NETWORK) {
    toast.error(message, {
      duration: 5000,
      description: 'Please check your connection',
    });
  } else {
    toast.error(message);
  }
}

/**
 * Setup global error handlers
 */
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    handleError(event.reason, { type: 'unhandledrejection' });
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    event.preventDefault();
    handleError(event.error, {
      type: 'uncaught',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Detect when user goes offline
  window.addEventListener('offline', () => {
    toast.warning('You are offline', {
      description: 'Some features may not be available',
      duration: Infinity,
      id: 'offline-toast',
    });
  });

  // Detect when user comes back online
  window.addEventListener('online', () => {
    toast.dismiss('offline-toast');
    toast.success('You are back online');
  });
}
