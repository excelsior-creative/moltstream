'use client';

import { useEffect, useState } from 'react';

interface IntroControllerProps {
  children: React.ReactNode;
}

/**
 * Controls intro animations to only play once per session.
 * Uses sessionStorage to track if intro has played.
 * 
 * Behavior:
 * - First visit in session: animations play normally
 * - Subsequent visits (same tab/session): animations are instant (no delay)
 */
export function IntroController({ children }: IntroControllerProps) {
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if intro has already played this session
    const hasPlayed = sessionStorage.getItem('moltstream_intro_played');
    
    if (hasPlayed) {
      setShouldAnimate(false);
    } else {
      // Mark intro as played for this session
      sessionStorage.setItem('moltstream_intro_played', 'true');
    }
    
    setIsReady(true);
  }, []);

  // Don't render until we've checked sessionStorage (prevents flash)
  if (!isReady) {
    return null;
  }

  return (
    <div className={shouldAnimate ? '' : 'skip-intro-animations'}>
      {children}
    </div>
  );
}
