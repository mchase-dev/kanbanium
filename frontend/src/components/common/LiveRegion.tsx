import { useEffect, useState } from 'react';
import VisuallyHidden from './VisuallyHidden';

interface LiveRegionProps {
  message: string;
  politeness?: 'polite' | 'assertive';
  clearDelay?: number;
}

/**
 * Component for screen reader announcements of dynamic content changes
 * Uses ARIA live regions to announce updates to assistive technologies
 */
export default function LiveRegion({
  message,
  politeness = 'polite',
  clearDelay = 5000,
}: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState(message);

  useEffect(() => {
    setAnnouncement(message);

    if (clearDelay > 0) {
      const timer = setTimeout(() => {
        setAnnouncement('');
      }, clearDelay);

      return () => clearTimeout(timer);
    }
  }, [message, clearDelay]);

  return (
    <VisuallyHidden
      as="div"
      aria-live={politeness}
      aria-atomic="true"
      role={politeness === 'assertive' ? 'alert' : 'status'}
    >
      {announcement}
    </VisuallyHidden>
  );
}

/**
 * Hook for announcing messages to screen readers
 */
export function useAnnouncer() {
  const [announcement, setAnnouncement] = useState<{
    message: string;
    politeness: 'polite' | 'assertive';
    key: number;
  }>({ message: '', politeness: 'polite', key: 0 });

  const announce = (message: string, politeness: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement({
      message,
      politeness,
      key: Date.now(), // Force re-render with new key
    });
  };

  const LiveRegionComponent = announcement.message ? (
    <LiveRegion
      key={announcement.key}
      message={announcement.message}
      politeness={announcement.politeness}
    />
  ) : null;

  return { announce, LiveRegionComponent };
}
