import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  mobileBehavior?: 'modal' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  'aria-labelledby'?: string;
}

/**
 * Reusable Modal component with consistent behavior and accessibility
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  mobileBehavior = 'fullscreen',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  'aria-labelledby': ariaLabelledby,
}: ModalProps) {
  const modalId = ariaLabelledby || `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (closeOnEscape && event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  // Size classes for desktop
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  };

  // Responsive behavior classes
  const responsiveClasses = mobileBehavior === 'fullscreen'
    ? 'inset-0 flex items-center justify-center p-0 md:p-4'
    : 'inset-0 flex items-center justify-center p-4';

  const modalSizeClasses = mobileBehavior === 'fullscreen'
    ? `${sizeClasses[size]} w-full h-full md:h-auto md:max-h-[90vh] md:rounded-lg md:m-4`
    : sizeClasses[size];

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 bg-black/50 z-50 ${responsiveClasses}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={modalId}
    >
      <div
        className={`
          ${modalSizeClasses}
          bg-neutral-800 border border-neutral-700 shadow-xl
          ${mobileBehavior === 'fullscreen' ? 'w-full h-full' : ''}
          flex flex-col overflow-hidden
        `}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-800/95">
          <h2 id={modalId} className="text-lg font-semibold text-white truncate">
            {title}
          </h2>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0 ml-4"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}