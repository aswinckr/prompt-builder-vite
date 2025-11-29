import React from 'react';
import { X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from '../../lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | 'wide';
  description?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  side = 'left',
  size = 'md',
  description
}: DrawerProps) {
  // Map size to Sheet content width/height classes
  const getSizeClass = () => {
    if (side === 'left' || side === 'right') {
      switch (size) {
        case 'sm':
          return 'w-80';
        case 'md':
          return 'w-96';
        case 'lg':
          return 'w-[28rem]';
        case 'xl':
          return 'w-[32rem]';
        case 'full':
          return 'w-full max-w-md';
        case 'wide':
          return '';
        default:
          return 'w-96';
      }
    } else {
      switch (size) {
        case 'sm':
          return 'h-64';
        case 'md':
          return 'h-80';
        case 'lg':
          return 'h-96';
        case 'xl':
          return 'h-[28rem]';
        case 'full':
          return 'h-screen';
        default:
          return 'h-80';
      }
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={side}
        className={cn(getSizeClass(), className, 'bg-neutral-900', {
          'w-full sm:!w-[40vw] sm:!max-w-none': size === 'wide' && (side === 'left' || side === 'right')
        })}
      >
        <div className="flex items-center justify-between">
          {(title || description) && (
            <SheetHeader className="flex-1">
              {title && <SheetTitle className="text-white">{title}</SheetTitle>}
              {description && <SheetDescription>{description}</SheetDescription>}
            </SheetHeader>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 overflow-y-auto h-full">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}