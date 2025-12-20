import { useCallback, useEffect, useRef,useState } from 'react';

import { TOAST_DURATION_MS } from '../utils/constants';

interface UseToastOptions {
  duration?: number;
}

interface UseToastReturn {
  message: string | null;
  show: (msg: string) => void;
  hide: () => void;
}

/**
 * Hook for managing toast notifications with auto-dismiss
 * @param options - Optional configuration
 * @returns Toast state and controls
 */
export function useToast(options?: UseToastOptions): UseToastReturn {
  const duration = options?.duration ?? TOAST_DURATION_MS;
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    setMessage(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const show = useCallback((msg: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setMessage(msg);
    timeoutRef.current = setTimeout(() => {
      setMessage(null);
      timeoutRef.current = null;
    }, duration);
  }, [duration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { message, show, hide };
}
