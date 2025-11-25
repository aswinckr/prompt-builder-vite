import React, { useEffect, useRef } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  message: string;
  variant?: ToastVariant;
  duration?: number;
  isVisible: boolean;
  onDismiss: (id: string) => void;
}

/**
 * Toast notification component with auto-dismiss and manual dismiss
 */
export function Toast({
  id,
  message,
  variant = 'info',
  duration = 5000,
  isVisible,
  onDismiss,
}: ToastProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible && duration > 0) {
      timeoutRef.current = setTimeout(() => {
        onDismiss(id);
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, duration, id, onDismiss]);

  const handleDismiss = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onDismiss(id);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          bg: 'bg-green-500/10 border-green-500/20',
          text: 'text-green-400',
          icon: CheckCircle,
          iconColor: 'text-green-400',
        };
      case 'error':
        return {
          bg: 'bg-red-500/10 border-red-500/20',
          text: 'text-red-400',
          icon: AlertCircle,
          iconColor: 'text-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/20',
          text: 'text-yellow-400',
          icon: AlertTriangle,
          iconColor: 'text-yellow-400',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500/10 border-blue-500/20',
          text: 'text-blue-400',
          icon: Info,
          iconColor: 'text-blue-400',
        };
    }
  };

  const styles = getVariantStyles();
  const Icon = styles.icon;

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`
        ${styles.bg} ${styles.text}
        border rounded-lg shadow-lg backdrop-blur-sm
        p-4 mb-3 min-w-[320px] max-w-md
        transform transition-all duration-300 ease-in-out
        animate-in slide-in-from-right-full
        flex items-start gap-3
      `}
      role="alert"
      aria-live="polite"
    >
      <Icon
        size={18}
        className={`${styles.iconColor} flex-shrink-0 mt-0.5`}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm font-medium leading-relaxed">
        {message}
      </p>
      <button
        onClick={handleDismiss}
        className={`
          ${styles.text} opacity-70 hover:opacity-100
          transition-opacity focus:outline-none focus:opacity-100
          flex-shrink-0 p-0.5 rounded hover:bg-white/5
          focus:ring-2 focus:ring-white/10
        `}
        aria-label="Dismiss notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}