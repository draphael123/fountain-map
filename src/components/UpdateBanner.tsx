import { useState, useEffect } from 'react';

interface UpdateInfo {
  lastUpdated: string;
  notes: string[];
}

export function UpdateBanner() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user already dismissed this update
    const dismissedUpdate = localStorage.getItem('dismissedUpdate');

    fetch('/update-info.json')
      .then((res) => res.ok ? res.json() : null)
      .then((data: UpdateInfo | null) => {
        if (!data?.lastUpdated || !Array.isArray(data?.notes)) return;

        // Parse the update date and check if it's within 24 hours
        const updateDate = new Date(data.lastUpdated);
        const now = new Date();
        const hoursSinceUpdate = (now.getTime() - updateDate.getTime()) / (1000 * 60 * 60);

        // Show banner if update was within last 24 hours and not dismissed
        if (hoursSinceUpdate >= 0 && hoursSinceUpdate <= 24) {
          if (dismissedUpdate !== data.lastUpdated) {
            setUpdateInfo(data);
            // Small delay for entrance animation
            setTimeout(() => setIsVisible(true), 100);
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // After animation, fully remove
    setTimeout(() => {
      setDismissed(true);
      if (updateInfo) {
        localStorage.setItem('dismissedUpdate', updateInfo.lastUpdated);
      }
    }, 300);
  };

  if (!updateInfo || dismissed) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="bg-gradient-to-r from-fountain-trt via-fountain-hrt to-fountain-glp text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-start sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="font-semibold text-sm sm:text-base">
                  New Update!
                </span>
                <span className="text-white/80 text-xs sm:text-sm">
                  ({updateInfo.lastUpdated})
                </span>
              </div>
              <ul className="text-white/90 text-xs sm:text-sm space-y-0.5 ml-7">
                {updateInfo.notes.map((note, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-white/60 mt-0.5">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss update notification"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
