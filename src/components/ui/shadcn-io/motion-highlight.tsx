import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';

interface MotionHighlightProps {
  children: React.ReactNode;
  defaultValue?: string;
  className?: string;
  onValueChange?: (value: string) => void;
}

export function MotionHighlight({
  children,
  defaultValue,
  className = '',
  onValueChange
}: MotionHighlightProps) {
  const [activeValue, setActiveValue] = useState<string | null>(defaultValue || null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({
    transition: 'left 0.2s cubic-bezier(0.4, 0, 0.2, 1), width 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.15s ease-out',
    opacity: 0,
    transform: 'translateZ(0)', // Hardware acceleration
    willChange: 'left, width, opacity',
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const updateHighlight = useCallback((targetElement: HTMLElement) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const left = targetRect.left - containerRect.left;
    const width = targetRect.width;

    setHighlightStyle(prev => ({
      ...prev,
      left: `${left}px`,
      width: `${width}px`,
      opacity: 1,
      transform: 'translateZ(0)', // Hardware acceleration
    }));
  }, []);

  const handleChildClick = useCallback((event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const tabElement = target.closest('[data-value]') as HTMLElement;

    if (tabElement) {
      const value = tabElement.getAttribute('data-value');
      if (value && value !== activeValue) {
        setActiveValue(value);
        updateHighlight(tabElement);
        onValueChange?.(value);
      }
    }
  }, [activeValue, updateHighlight, onValueChange]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleChildClick(event as any);
    }
  }, [handleChildClick]);

  // Use useLayoutEffect for synchronous DOM updates to prevent flicker
  useLayoutEffect(() => {
    if (containerRef.current && activeValue) {
      const activeElement = containerRef.current.querySelector(`[data-value="${activeValue}"]`) as HTMLElement;
      if (activeElement) {
        updateHighlight(activeElement);
      }
    }
  }, [activeValue, updateHighlight]);

  // Update when defaultValue changes (for programmatic navigation)
  useLayoutEffect(() => {
    if (containerRef.current && defaultValue && defaultValue !== activeValue) {
      const defaultElement = containerRef.current.querySelector(`[data-value="${defaultValue}"]`) as HTMLElement;
      if (defaultElement) {
        setActiveValue(defaultValue);
        updateHighlight(defaultElement);
      }
    }
  }, [defaultValue, activeValue, updateHighlight]);

  // Memoize children with props to prevent unnecessary re-renders
  const childrenWithProps = React.useMemo(() => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        const value = child.props['data-value'];
        const isActive = activeValue && value === activeValue;

        return React.cloneElement(child, {
          'data-active': isActive,
          onClick: (e: React.MouseEvent) => {
            handleChildClick(e);
            child.props.onClick?.(e);
          },
          onKeyDown: (e: React.KeyboardEvent) => {
            handleKeyDown(e);
            child.props.onKeyDown?.(e);
          },
          tabIndex: isActive ? 0 : -1,
        });
      }
      return child;
    });
  }, [children, activeValue, handleChildClick, handleKeyDown]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      role="tablist"
    >
      <div
        ref={highlightRef}
        className="absolute top-0 h-full bg-neutral-900 rounded-full shadow-sm"
        style={{
          ...highlightStyle,
          backfaceVisibility: 'hidden',
          WebkitFontSmoothing: 'antialiased',
        }}
      />
      <div className="relative z-10 flex">
        {childrenWithProps}
      </div>
    </div>
  );
}