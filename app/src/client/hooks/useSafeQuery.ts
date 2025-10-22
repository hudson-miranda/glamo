import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { useSalonContext } from './useSalonContext';
import { useToast } from './useToast';

/**
 * Normalized API error shape for consistent handling
 */
export interface ApiError {
  message: string;
  code?: string;
  field?: string;
  statusCode?: number;
}

/**
 * Extended query options with additional metadata
 */
interface SafeQueryOptions<TData, TError = ApiError> extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  operationName?: string;
  showErrorToast?: boolean;
  onError?: (error: TError) => void;
}

/**
 * Normalizes various error formats to ApiError
 */
function normalizeError(error: unknown): ApiError {
  if (!error) {
    return {
      message: 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }

  // If it's already an ApiError
  if (typeof error === 'object' && 'message' in error) {
    return error as ApiError;
  }

  // If it's an Error object
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'ERROR',
    };
  }

  // If it's a string
  if (typeof error === 'string') {
    return {
      message: error,
      code: 'STRING_ERROR',
    };
  }

  // For any other type
  return {
    message: JSON.stringify(error),
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Safe wrapper around React Query's useQuery that:
 * - Attaches metadata (operationName, route, salonId) to errors
 * - Normalizes API errors to a typed shape
 * - Optionally shows error toasts
 * - Logs errors to console with context
 * 
 * @example
 * const { data, isLoading, error } = useSafeQuery(
 *   ['clients', salonId],
 *   () => listClients({ salonId }),
 *   {
 *     operationName: 'listClients',
 *     showErrorToast: true,
 *   }
 * );
 */
export function useSafeQuery<TData = unknown, TError = ApiError>(
  queryKey: unknown[],
  queryFn: () => Promise<TData>,
  options?: SafeQueryOptions<TData, TError>
): UseQueryResult<TData, ApiError> {
  const location = useLocation();
  const { activeSalonId } = useSalonContext();
  const { toast } = useToast();
  
  const {
    operationName,
    showErrorToast = true,
    onError: customOnError,
    ...queryOptions
  } = options || {};

  return useQuery<TData, ApiError>({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        // Normalize the error
        const normalizedError = normalizeError(error);
        
        // Attach metadata
        const enrichedError: ApiError = {
          ...normalizedError,
          // Add metadata to help with debugging
          ...(operationName && { code: `${normalizedError.code || 'ERROR'}_${operationName}` }),
        };

        // Log to console with context
        console.error('useSafeQuery error:', {
          error: enrichedError,
          operationName,
          route: location.pathname,
          salonId: activeSalonId,
          queryKey,
        });

        // TODO: Send to error tracking service (Sentry, etc.)
        // Example: Sentry.captureException(error, {
        //   tags: { operationName, route: location.pathname },
        //   extra: { salonId: activeSalonId, queryKey },
        // });

        throw enrichedError;
      }
    },
    onError: (error: ApiError) => {
      // Show toast notification if enabled
      if (showErrorToast) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'An unexpected error occurred',
        });
      }

      // Call custom error handler if provided
      if (customOnError) {
        customOnError(error as TError);
      }
    },
    ...queryOptions,
  } as any); // Type assertion needed due to TError generic complexity
}

/**
 * Hook specifically for operations that require a salon context
 * Automatically handles the case where no salon is selected
 */
export function useSalonQuery<TData = unknown>(
  queryKey: unknown[],
  queryFn: (salonId: string) => Promise<TData>,
  options?: SafeQueryOptions<TData>
): UseQueryResult<TData, ApiError> {
  const { activeSalonId } = useSalonContext();

  return useSafeQuery(
    queryKey,
    () => {
      if (!activeSalonId) {
        throw new Error('No salon selected. Please select a salon to continue.');
      }
      return queryFn(activeSalonId);
    },
    {
      ...options,
      enabled: !!activeSalonId && (options?.enabled !== false),
    }
  );
}
