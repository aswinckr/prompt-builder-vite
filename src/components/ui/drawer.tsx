import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { cn } from '../../lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  side = 'left',
  size = 'md'
}: DrawerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return side === 'left' || side === 'right' ? 'w-80' : 'h-64';
      case 'md':
        return side === 'left' || side === 'right' ? 'w-96' : 'h-80';
      case 'lg':
        return side === 'left' || side === 'right' ? 'w-[28rem]' : 'h-96';
      case 'xl':
        return side === 'left' || side === 'right' ? 'w-[32rem]' : 'h-[28rem]';
      case 'full':
        return side === 'left' || side === 'right' ? 'w-screen max-w-md' : 'h-screen';
      default:
        return side === 'left' || side === 'right' ? 'w-96' : 'h-80';
    }
  };

  const getSideClasses = () => {
    switch (side) {
      case 'left':
        return 'left-0 top-0 h-full data-[state=open]:animate-slideInFromLeft data-[state=closed]:animate-slideOutToLeft';
      case 'right':
        return 'right-0 top-0 h-full data-[state=open]:animate-slideInFromRight data-[state=closed]:animate-slideOutToRight';
      case 'top':
        return 'top-0 left-0 w-full data-[state=open]:animate-slideInFromTop data-[state=closed]:animate-slideOutToTop';
      case 'bottom':
        return 'bottom-0 left-0 w-full data-[state=open]:animate-slideInFromBottom data-[state=closed]:animate-slideOutToBottom';
      default:
        return 'left-0 top-0 h-full data-[state=open]:animate-slideInFromLeft data-[state=closed]:animate-slideOutToLeft';
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 data-[state=open]:animate-fadeIn data-[state=closed]:animate-fadeOut" />
        <Dialog.Content
          className={cn(
            'fixed z-50 bg-neutral-900 border border-neutral-700 shadow-2xl',
            'focus:outline-none',
            getSizeClasses(),
            getSideClasses(),
            className
          )}
        >
          {/* Header */}
          {(title || side === 'left' || side === 'right') && (
            <div className="flex items-center justify-between p-4 border-b border-neutral-700">
              {title && (
                <Dialog.Title className="text-lg font-semibold text-white">
                  {title}
                </Dialog.Title>
              )}
              <Dialog.Close className="text-neutral-400 hover:text-white transition-colors">
                <Cross2Icon className="w-5 h-5" />
              </Dialog.Close>
            </div>
          )}

          {/* Content */}
          <div className={cn(
            'overflow-y-auto',
            side === 'left' || side === 'right' ? 'h-full' : 'max-h-[80vh]',
            title ? 'h-[calc(100%-4rem)]' : 'h-full'
          )}>
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  @keyframes slideInFromLeft {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
  }

  @keyframes slideOutToLeft {
    from { transform: translateX(0); }
    to { transform: translateX(-100%); }
  }

  @keyframes slideInFromRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  @keyframes slideOutToRight {
    from { transform: translateX(0); }
    to { transform: translateX(100%); }
  }

  @keyframes slideInFromTop {
    from { transform: translateY(-100%); }
    to { transform: translateY(0); }
  }

  @keyframes slideOutToTop {
    from { transform: translateY(0); }
    to { transform: translateY(-100%); }
  }

  @keyframes slideInFromBottom {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  @keyframes slideOutToBottom {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }

  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }

  .animate-fadeOut {
    animation: fadeOut 0.2s ease-out;
  }

  .animate-slideInFromLeft {
    animation: slideInFromLeft 0.3s ease-out;
  }

  .animate-slideOutToLeft {
    animation: slideOutToLeft 0.3s ease-out;
  }

  .animate-slideInFromRight {
    animation: slideInFromRight 0.3s ease-out;
  }

  .animate-slideOutToRight {
    animation: slideOutToRight 0.3s ease-out;
  }

  .animate-slideInFromTop {
    animation: slideInFromTop 0.3s ease-out;
  }

  .animate-slideOutToTop {
    animation: slideOutToTop 0.3s ease-out;
  }

  .animate-slideInFromBottom {
    animation: slideInFromBottom 0.3s ease-out;
  }

  .animate-slideOutToBottom {
    animation: slideOutToBottom 0.3s ease-out;
  }
`;
if (!document.head.querySelector('style[data-drawer-animations]')) {
  style.setAttribute('data-drawer-animations', 'true');
  document.head.appendChild(style);
}