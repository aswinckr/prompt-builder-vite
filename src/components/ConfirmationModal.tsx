import React, { useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { Trash2, AlertTriangle, Info } from 'lucide-react';

export type ConfirmationType = 'delete' | 'warning' | 'default' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmationType;
  isLoading?: boolean;
}

/**
 * ConfirmationModal component based on existing Modal.tsx
 * Provides confirmation dialogs with customizable buttons and icons
 */
export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default',
  isLoading = false,
}: ConfirmationModalProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      // Small delay to ensure modal is fully rendered
      setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isLoading) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      onConfirm();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  const getIconAndColors = () => {
    switch (type) {
      case 'delete':
        return {
          icon: Trash2,
          iconColor: 'text-red-400',
          buttonColor: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/20',
          buttonBorder: 'border-red-500/20',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-400',
          buttonColor: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500/20',
          buttonBorder: 'border-yellow-500/20',
        };
      case 'info':
        return {
          icon: Info,
          iconColor: 'text-blue-400',
          buttonColor: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/20',
          buttonBorder: 'border-blue-500/20',
        };
      case 'default':
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-neutral-400',
          buttonColor: 'bg-neutral-600 hover:bg-neutral-500 focus:ring-neutral-500/20',
          buttonBorder: 'border-neutral-500/20',
        };
    }
  };

  const { icon: Icon, iconColor, buttonColor, buttonBorder } = getIconAndColors();

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      mobileBehavior="modal"
      closeOnEscape={!isLoading}
      closeOnOverlayClick={!isLoading}
    >
      <div
        className="p-6"
        onKeyDown={handleKeyDown}
      >
        {/* Icon and Message */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`flex-shrink-0 ${iconColor}`}>
            <Icon size={24} aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-neutral-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-neutral-300 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button
            ref={confirmButtonRef}
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white ${buttonColor} rounded-lg transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
            aria-label={confirmText}
          >
            {isLoading && (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {confirmText}
          </button>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-xs text-neutral-500 text-center">
          Press <kbd className="px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300">Enter</kbd> to confirm,
          <kbd className="px-1.5 py-0.5 bg-neutral-700 rounded text-neutral-300 ml-1">Esc</kbd> to cancel
        </div>
      </div>
    </Modal>
  );
}