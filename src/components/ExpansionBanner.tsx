import { useState, useEffect } from 'react';

// Banner expires on January 25, 2026 at 11:59 PM
const BANNER_EXPIRY = new Date('2026-01-25T23:59:59');

export function ExpansionBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Check if banner has expired
    const now = new Date();
    if (now > BANNER_EXPIRY) {
      setIsExpired(true);
    }
  }, []);

  if (isExpired || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-fountain-trt via-fountain-hrt to-fountain-trt text-white">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 justify-center">
            <span className="text-2xl animate-pulse">🎉</span>
            <p className="text-sm sm:text-base font-medium text-center">
              <span className="font-bold">New Expansion!</span>
              {' '}We're now open in <span className="font-bold underline">South Dakota</span> for TRT and HRT services!
            </p>
            <span className="text-2xl animate-pulse hidden sm:inline">🎉</span>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
