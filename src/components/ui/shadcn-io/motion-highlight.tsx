import React, { useEffect, useRef, useState } from 'react';

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
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const updateHighlight = (targetElement: HTMLElement) => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const targetRect = targetElement.getBoundingClientRect();

    const left = targetRect.left - containerRect.left;
    const width = targetRect.width;

    setHighlightStyle({
      left: `${left}px`,
      width: `${width}px`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    });
  };

  const handleChildClick = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    const tabElement = target.closest('[data-value]') as HTMLElement;

    if (tabElement) {
      const value = tabElement.getAttribute('data-value');
      if (value) {
        setActiveValue(value);
        updateHighlight(tabElement);
        onValueChange?.(value);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleChildClick(event as any);
    }
  };

  useEffect(() => {
    if (containerRef.current && activeValue) {
      const activeElement = containerRef.current.querySelector(`[data-value="${activeValue}"]`) as HTMLElement;
      if (activeElement) {
        // Small delay to ensure DOM is ready
        setTimeout(() => updateHighlight(activeElement), 0);
      }
    }
  }, [activeValue]);

  // Set initial active tab if defaultValue is provided
  useEffect(() => {
    if (defaultValue && !activeValue && containerRef.current) {
      const defaultElement = containerRef.current.querySelector(`[data-value="${defaultValue}"]`) as HTMLElement;
      if (defaultElement) {
        setActiveValue(defaultValue);
        updateHighlight(defaultElement);
      }
    }
  }, [defaultValue, activeValue]);

  // Clone children and add props
  const childrenWithProps = React.Children.map(children, (child) => {
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

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onClick={handleChildClick}
      role="tablist"
    >
      <div
        ref={highlightRef}
        className="absolute top-0 h-full bg-neutral-900 rounded-full shadow-sm"
        style={highlightStyle}
      />
      <div className="relative z-10 flex">
        {childrenWithProps}
      </div>
    </div>
  );
}