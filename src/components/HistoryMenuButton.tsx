import React, { useState, ReactNode } from 'react';
import { Drawer } from './ui/drawer';
import { SimplifiedConversationHistory } from './SimplifiedConversationHistory';
import { Button } from '@/components/ui/button';
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
          <Button
            variant="ghost"
            size="icon"
            data-value={defaultValue}
            onClick={openDrawer}
            className={`h-9 w-9 hover:bg-purple-700 hover:text-white dark:hover:bg-purple-800 dark:hover:text-white ${className}`}
            aria-label="Open conversation history"
            title="Conversation History"
            data-testid={dataTestId}
          >
            {icon}
          </Button>
        </MotionHighlight>
      </div>

      {/* Conversation History Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        title="Conversation History"
        side="left"
        size="wide"
      >
        <SimplifiedConversationHistory
          className="flex flex-col bg-sidebar"
        />
      </Drawer>
    </>
  );
}