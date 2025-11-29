import React, { useState, ReactNode } from 'react';
import { Drawer } from './ui/drawer';
import { SimplifiedConversationHistory } from './SimplifiedConversationHistory';
import { MotionHighlight } from './ui/shadcn-io/motion-highlight';

interface HistoryMenuButtonProps {
  icon: ReactNode;
  defaultValue?: string;
  containerClassName?: string;
  className?: string;
  'data-testid'?: string;
}

export function HistoryMenuButton({
  icon,
  defaultValue = 'history',
  containerClassName = '',
  className = '',
  'data-testid': dataTestId,
}: HistoryMenuButtonProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      {/* History Button with MotionHighlight */}
      <div className={`z-20 ${containerClassName}`}>
        <MotionHighlight defaultValue={defaultValue} className="flex">
          <button
            data-value={defaultValue}
            onClick={openDrawer}
            className={`flex items-center justify-center w-10 h-10 bg-neutral-200 hover:bg-neutral-300 rounded-full text-neutral-900 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 ${className}`}
            aria-label="Open conversation history"
            title="Conversation History"
            data-testid={dataTestId}
          >
            {icon}
          </button>
        </MotionHighlight>
      </div>

      {/* Conversation History Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title="Conversation History"
        side="left"
        size="md"
      >
        <SimplifiedConversationHistory
          title="Conversation History"
          className="flex flex-col bg-neutral-900"
        />
      </Drawer>
    </>
  );
}