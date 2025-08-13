"use client";

import { Badge } from "@/components/ui/badge";
import { useApiStatus, type ApiStatus } from "@/hooks/useApiStatus";

const statusConfig = {
  connected: {
    color: 'bg-green-500',
    text: 'API Connected',
    variant: 'outline' as const,
  },
  disconnected: {
    color: 'bg-red-500',
    text: 'API Offline',
    variant: 'destructive' as const,
  },
  checking: {
    color: 'bg-yellow-500',
    text: 'Checking...',
    variant: 'outline' as const,
  },
} satisfies Record<ApiStatus, { color: string; text: string; variant: 'outline' | 'destructive' }>;

export function ApiStatus() {
  const { status, lastChecked, checkApiStatus } = useApiStatus();
  const config = statusConfig[status];

  const formatLastChecked = (date: Date | null) => {
    if (!date) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={config.variant} 
        className="text-xs cursor-pointer hover:opacity-80 transition-opacity"
        onClick={checkApiStatus}
        title={`Last checked: ${formatLastChecked(lastChecked)}. Click to refresh.`}
      >
        <div className={`w-2 h-2 ${config.color} rounded-full mr-1.5 ${
          status === 'checking' ? 'animate-pulse' : ''
        }`}></div>
        {config.text}
      </Badge>
    </div>
  );
}