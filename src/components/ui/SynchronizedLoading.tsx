import React from 'react';
import { Loader2 } from 'lucide-react';

interface SynchronizedLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  message?: string;
}

export function SynchronizedLoading({
  isLoading,
  children,
  className = '',
  message = 'Loading...'
}: SynchronizedLoadingProps) {
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <div className="text-center">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
          <p className="mt-3 text-neutral-400 text-sm animate-pulse">{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}