import { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { PrintButton } from './PrintButton';
import { ColorblindToggle } from './ColorblindToggle';
import { DATA_LAST_UPDATED, UPDATE_NOTES } from '../data/dataMeta';

export type ViewMode = 'licensing' | 'rn-licensing' | 'offices';

const VIEW_TABS: { id: ViewMode; label: string; shortLabel: string; icon: string }[] = [
  { id: 'licensing', label: 'Licensing', shortLabel: 'Licensing', icon: '📋' },
  { id: 'rn-licensing', label: 'RN Licensing', shortLabel: 'RNs', icon: '👩‍⚕️' },
  { id: 'offices', label: 'Office Locations', shortLabel: 'Offices', icon: '🏢' },
];

interface HeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchClick?: () => void;
  onChangelogClick?: () => void;
}

export function Header({ viewMode, onViewModeChange, onSearchClick, onChangelogClick }: HeaderProps) {
  const [updateTooltipOpen, setUpdateTooltipOpen] = useState(false);
  const updateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (updateRef.current && !updateRef.current.contains(e.target as Node)) {
        setUpdateTooltipOpen(false);
      }
    };
    if (updateTooltipOpen) {
      document.addEventListener('mousedown', handle);
    }
    return () => document.removeEventListener('mousedown', handle);
  }, [updateTooltipOpen]);

  const renderTabButton = (t: (typeof VIEW_TABS)[0]) => (
    <button
      key={t.id}
      type="button"
      onClick={() => onViewModeChange(t.id)}
      className={`
        px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
        ${viewMode === t.id ? 'bg-white text-fountain-dark' : 'text-gray-300 hover:bg-white/10'}
      `}
    >
      <span className="sm:hidden">{t.icon} {t.shortLabel}</span>
      <span className="hidden sm:inline">{t.icon} {t.label}</span>
    </button>
  );

  return (
    <header className="bg-fountain-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex items-center justify-center">
              <img src="/fountain-logo.png" alt="Fountain Vitality" className="h-8 sm:h-10 w-auto" />
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
              {/* Last Updated Badge */}
              <div className="relative" ref={updateRef}>
                <button
                  type="button"
                  onClick={() => setUpdateTooltipOpen((o) => !o)}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-gray-300 hover:bg-white/20 transition-colors"
                  title="View update details"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden sm:inline">Updated:</span>
                  <span>{DATA_LAST_UPDATED}</span>
                </button>
                {updateTooltipOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-lg bg-white text-fountain-dark shadow-xl border border-gray-200 z-[100] p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-fountain-trt" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="font-semibold text-sm">Latest Update</span>
                      <span className="text-xs text-gray-500">({DATA_LAST_UPDATED})</span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {UPDATE_NOTES.map((note, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-fountain-trt mt-0.5">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {onChangelogClick && (
                <button
                  type="button"
                  onClick={onChangelogClick}
                  className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/10 transition-colors"
                  title="View changelog"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <span className="hidden sm:inline">What's New</span>
                </button>
              )}
              {onSearchClick && (
                <button
                  type="button"
                  onClick={onSearchClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
                  title="Search state (/)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">Search state</span>
                  <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-white/10 rounded">/</kbd>
                </button>
              )}
              <ColorblindToggle />
              <PrintButton />
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="py-3 border-b border-white/10">
          {/* Desktop: all tabs in one row */}
          <div className="hidden sm:flex justify-center gap-1 sm:gap-2 flex-wrap">
            {VIEW_TABS.map((t) => renderTabButton(t))}
          </div>

          {/* Mobile: horizontally scrollable tabs */}
          <div className="sm:hidden">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
              <div className="flex justify-start gap-1 min-w-max">
                {VIEW_TABS.map((t) => renderTabButton(t))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
