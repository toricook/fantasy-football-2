import { useState, useEffect } from 'react';
import SleeperAPI from 'sleeper-api-client';

export type ApiStatus = 'connected' | 'disconnected' | 'checking';

export function useApiStatus() {
  const [status, setStatus] = useState<ApiStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    try {
      setStatus('checking');
      const sleeper = new SleeperAPI({ timeout: 5000 }); // 5 second timeout
      
      // Try a simple API call to test connectivity
      await sleeper.getNflState();
      
      setStatus('connected');
      setLastChecked(new Date());
    } catch (error) {
      console.error('API status check failed:', error);
      setStatus('disconnected');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    // Check immediately on mount
    checkApiStatus();

    // Check every 5 minutes
    const interval = setInterval(checkApiStatus, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    status,
    lastChecked,
    checkApiStatus, // Allow manual refresh
  };
}