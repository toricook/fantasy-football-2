import { useState, useEffect, useCallback } from 'react';

// Generic state interface for API operations
interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

// Configuration options for the useApi hook
interface UseApiOptions {
  immediate?: boolean; // Whether to run immediately on mount
}

/**
 * Custom hook for handling async API calls with loading states
 * 
 * @param apiFunction - The async function to call
 * @param dependencies - Dependency array for the useCallback (similar to useEffect)
 * @param options - Configuration options for the hook behavior
 * @returns Object containing data, loading state, error, and execution functions
 */
export function useApi<T>(
  apiFunction: () => Promise<T>,
  dependencies: React.DependencyList = [],
  options: UseApiOptions = { immediate: true }
) {
  // Initialize state with loading true if immediate execution is enabled
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: options.immediate ?? true,
    error: null,
  });

  // Memoized function to execute the API call
  const execute = useCallback(async () => {
    // Set loading state and clear any previous errors
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Execute the API function and update state with result
      const result = await apiFunction();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      // Handle errors - extract message if it's an Error instance
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw err; // Re-throw if the caller wants to handle it
    }
  }, dependencies);

  // Execute immediately on mount if immediate option is enabled
  useEffect(() => {
    if (options.immediate) {
      execute();
    }
  }, [execute, options.immediate]);

  return {
    ...state,
    execute, // Manual trigger
    refetch: execute, // Alias for clarity
  };
}