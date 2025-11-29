import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  mobileBehavior?: 'modal' | 'fullscreen';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  'aria-labelledby'?: string;
}

/**
 * Reusable Modal component with consistent behavior and accessibility
 * Now built on top of Shadcn Dialog for modern styling
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
  // Map size to Shadcn Dialog max-width classes
  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-lg';
      case 'xl':
        return 'max-w-xl';
      case '2xl':
        return 'max-w-2xl';
      case '3xl':
        return 'max-w-3xl';
      case 'full':
        return 'max-w-full mx-4';
      default:
        return 'max-w-md';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`${getSizeClass()} ${mobileBehavior === 'fullscreen' ? 'h-full md:h-auto' : ''} max-h-[90vh] flex flex-col [[data-radix-dialog-close]]:hidden [data-state=open]:hidden [&_.absolute.right-4.top-4]:hidden [&_.rounded-sm.opacity-70]:hidden`}
        hideCloseButton={true}
        onPointerDownOutside={(e) => {
          if (!closeOnOverlayClick) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (!closeOnEscape) {
            e.preventDefault();
          }
        }}
        aria-labelledby={ariaLabelledby}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 flex-shrink-0">
          <DialogTitle
            id={ariaLabelledby || `modal-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="text-lg font-semibold truncate"
          >
            {title}
          </DialogTitle>
          {showCloseButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-muted"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}