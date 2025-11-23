import React, { useState } from 'react';

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
  isOpen?: boolean;
}

// Common emoji icons for folders (removed duplicates)
const FOLDER_ICONS = [
  '📁', '📂', '📃', '📄', '📋', '📌', '📍', '🏷️',
  '💼', '🗂️', '🗃️', '🗄️', '🪪', '📏', '📐', '🔖',
  '🏛️', '🏢', '🏬', '🏭', '🏪', '🏦', '🏨', '💻',
  '⌨️', '🖥️', '🖨️', '📱', '📞', '☎️', '📟', '🎯',
  '🎲', '🎪', '🎭', '🎨', '🖌️', '🖍️', '📝', '✏️',
  '🔍', '🔎', '💡', '🔦', '🏮', '🪔', '💭', '📚',
  '📖', '📒', '📔', '📕', '📗', '📘', '📙', '📓',
  '📜', '📑', '📎'
];

export function IconPicker({ selectedIcon, onIconSelect, isOpen = true }: IconPickerProps) {
  const [hoveredIcon, setHoveredIcon] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent, icon: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onIconSelect(icon);
    }
  };

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const grid = e.currentTarget;
    const items = Array.from(grid.querySelectorAll('[data-icon-item]')) as HTMLElement[];
    const currentIndex = items.findIndex(item => item === document.activeElement);

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex]?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        const prevIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
        items[prevIndex]?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const downIndex = currentIndex + 8;
        items[downIndex % items.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const upIndex = currentIndex - 8 < 0 ? items.length - (8 - (currentIndex % 8)) : currentIndex - 8;
        items[upIndex]?.focus();
        break;
    }
  };

  return (
    <div className="p-4">
      <div className="mb-3">
        <label className="block text-sm font-medium text-neutral-300 mb-2">
          Choose an icon
        </label>
        <p className="text-xs text-neutral-500">
          Select an emoji to represent your folder
        </p>
      </div>

      <div
        className="grid grid-cols-8 gap-2 max-h-64 overflow-y-auto"
        onKeyDown={handleGridKeyDown}
        role="grid"
        aria-label="Folder icon selection"
      >
        {FOLDER_ICONS.map((icon) => (
          <button
            key={icon}
            data-icon-item
            type="button"
            onClick={() => onIconSelect(icon)}
            onKeyDown={(e) => handleKeyDown(e, icon)}
            onMouseEnter={() => setHoveredIcon(icon)}
            onMouseLeave={() => setHoveredIcon(null)}
            className={`
              relative w-10 h-10 rounded-lg flex items-center justify-center text-lg
              transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500
              ${selectedIcon === icon
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : hoveredIcon === icon
                ? 'bg-neutral-700 text-white scale-110'
                : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }
            `}
            aria-label={`Select ${icon} icon`}
            aria-pressed={selectedIcon === icon}
          >
            <span>{icon}</span>
            {selectedIcon === icon && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-neutral-900"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}