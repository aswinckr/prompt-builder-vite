import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Drawer } from './ui/drawer';
import { SimplifiedConversationHistory } from './SimplifiedConversationHistory';
import { MotionHighlight } from './ui/shadcn-io/motion-highlight';

interface HamburgerHistoryMenuProps {
  // Optional prop to customize positioning
  className?: string;
}

export function HamburgerHistoryMenu({ className = '' }: HamburgerHistoryMenuProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      {/* Hamburger Menu Button with MotionHighlight */}
      <div className={`absolute top-4 left-4 z-30 ${className}`}>
        <MotionHighlight defaultValue="menu" className="flex">
          <button
            data-value="menu"
            onClick={openDrawer}
            className="flex items-center justify-center w-10 h-10 bg-neutral-200 hover:bg-neutral-300 rounded-full text-neutral-900 hover:text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
            aria-label="Open conversation history"
            title="Conversation History"
          >
            <Menu className="w-5 h-5" />
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