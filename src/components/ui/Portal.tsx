import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Portal component that renders children outside the normal DOM hierarchy
 * Useful for modals, tooltips, and other elements that need to escape overflow constraints
 */
export function Portal({ children, className }: PortalProps) {
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Create the portal container if it doesn't exist
    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.setAttribute('data-portal', 'true');
      if (className) {
        portalRef.current.className = className;
      }
      document.body.appendChild(portalRef.current);
    }
    setIsReady(true);

    // Cleanup when component unmounts
    return () => {
      if (portalRef.current && portalRef.current.parentNode) {
        portalRef.current.parentNode.removeChild(portalRef.current);
        portalRef.current = null;
      }
      setIsReady(false);
    };
  }, [className]);

  if (!isReady || !portalRef.current) {
    return null;
  }

  return createPortal(children, portalRef.current);
}