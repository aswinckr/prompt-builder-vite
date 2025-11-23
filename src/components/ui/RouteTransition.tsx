import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface RouteTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function RouteTransition({ children, className = '' }: RouteTransitionProps) {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [currentKey, setCurrentKey] = useState(location.key);

  useEffect(() => {
    if (location.key !== currentKey) {
      // Start transition
      setIsTransitioning(true);

      // After fade out, switch content
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setCurrentKey(location.key);

        // Start fade in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 30);
      }, 80);

      return () => clearTimeout(timeout);
    }
  }, [children, location.key, currentKey]);

  return (
    <div className={`relative h-full ${className}`}>
      <div
        className={`
          absolute inset-0 transition-opacity duration-120 ease-in-out
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}
        style={{
          willChange: 'opacity',
          backfaceVisibility: 'hidden',
        }}
      >
        {displayChildren}
      </div>
    </div>
  );
}