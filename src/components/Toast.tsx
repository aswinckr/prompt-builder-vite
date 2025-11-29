import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import {
  Toast as ShadcnToast,
  ToastClose,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast";

/**
 * Toast notification variant types
 * @typedef {'success' | 'error' | 'warning' | 'info'} ToastVariant
 */
export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

/**
 * Props for the Toast component
 * @interface ToastProps
 * @property {string} id - Unique identifier for the toast instance
 * @property {string} message - The message to display in the toast
 * @property {ToastVariant} [variant='info'] - Visual variant of the toast
 * @property {number} [duration=5000] - Auto-dismiss duration in milliseconds (0 to disable)
 * @property {boolean} isVisible - Whether the toast should be visible
 * @property {(id: string) => void} onDismiss - Callback function when toast is dismissed
 *
 * @example
 * ```tsx
 * <Toast
 *   id="unique-toast-id"
 *   message="Operation completed successfully!"
 *   variant="success"
 *   duration={3000}
 *   isVisible={true}
 *   onDismiss={(id) => console.log('Toast dismissed:', id)}
 * />
 * ```
 */
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
 * Now using Shadcn Toast for modern styling
 */
export const Toast = React.memo(function Toast({
  id,
  message,
  variant = 'info',
  duration = 5000,
  isVisible,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, id, onDismiss]);

  const getVariantProps = () => {
    switch (variant) {
      case 'success':
        return {
          title: "Success",
          icon: CheckCircle,
          className: "border-green-500/20 text-green-400",
        };
      case 'error':
        return {
          title: "Error",
          icon: AlertCircle,
          className: "border-destructive/20 text-destructive",
        };
      case 'warning':
        return {
          title: "Warning",
          icon: AlertTriangle,
          className: "border-yellow-500/20 text-yellow-400",
        };
      case 'info':
      default:
        return {
          title: "Info",
          icon: Info,
          className: "border-blue-500/20 text-blue-400",
        };
    }
  };

  if (!isVisible) {
    return null;
  }

  const { icon: Icon, className } = getVariantProps();

  return (
    <ShadcnToast className={className} open={isVisible} onOpenChange={(open) => !open && onDismiss(id)}>
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 mt-0.5" />
        <div className="flex-1">
          <ToastDescription>{message}</ToastDescription>
        </div>
        <ToastClose onClick={() => onDismiss(id)} />
      </div>
    </ShadcnToast>
  );
});