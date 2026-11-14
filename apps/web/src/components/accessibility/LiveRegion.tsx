import React, { useEffect, useState } from 'react';

export interface LiveAnnouncement {
  id: string;
  message: string;
  priority: 'normal' | 'high' | 'low';
  timestamp: number;
}

export const LiveRegion: React.FC = () => {
  const [politeMessage, setPoliteMessage] = useState<string>('');
  const [assertiveMessage, setAssertiveMessage] = useState<string>('');

  useEffect(() => {
    const handleAnnouncement = (e: CustomEvent<LiveAnnouncement>) => {
      const { message, priority } = e.detail;
      if (priority === 'high') {
        setAssertiveMessage(message);
      } else {
        setPoliteMessage(message);
      }
    };

    window.addEventListener('senseweave:announce' as never, handleAnnouncement as never);
    return () => {
      window.removeEventListener('senseweave:announce' as never, handleAnnouncement as never);
    };
  }, []);

  return (
    <div className="sr-only" aria-hidden="false">
      {/* Polite live region for normal environmental updates */}
      <div role="status" aria-live="polite" aria-atomic="true">
        {politeMessage}
      </div>

      {/* Assertive live region for high-priority transitions and alerts */}
      <div role="alert" aria-live="assertive" aria-atomic="true">
        {assertiveMessage}
      </div>
    </div>
  );
};

export function announceToScreenReader(message: string, priority: 'normal' | 'high' | 'low' = 'normal') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<LiveAnnouncement>('senseweave:announce', {
        detail: {
          id: Math.random().toString(),
          message,
          priority,
          timestamp: Date.now(),
        },
      })
    );
  }
}
