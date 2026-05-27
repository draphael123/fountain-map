import { useState, useEffect, useRef, useCallback } from 'react';

interface ChangelogEntry {
  date: string;
  type: 'service' | 'provider' | 'feature' | 'data';
  title: string;
  description: string;
  states?: string[];
  services?: string[];
}

interface ChangelogData {
  lastUpdated: string;
  entries: ChangelogEntry[];
}

interface ChangelogPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  service: { icon: '🏥', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' },
  provider: { icon: '👨‍⚕️', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
  feature: { icon: '✨', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  data: { icon: '📊', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function groupByMonth(entries: ChangelogEntry[]): Record<string, ChangelogEntry[]> {
  const grouped: Record<string, ChangelogEntry[]> = {};
  entries.forEach(entry => {
    const date = new Date(entry.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(entry);
  });
  return grouped;
}

function getMonthLabel(key: string): string {
  const [year, month] = key.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function ChangelogPanel({ isOpen, onClose }: ChangelogPanelProps) {
  const [data, setData] = useState<ChangelogData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch changelog data
  useEffect(() => {
    if (isOpen && !data) {
      setLoading(true);
      setError(null);
      fetch('/changelog.json')
        .then(res => {
          if (!res.ok) throw new Error('Failed to load changelog');
          return res.json();
        })
        .then((json: ChangelogData) => {
          setData(json);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [isOpen, data]);

  // Handle click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClickOutside]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const groupedEntries = data ? groupByMonth(data.entries) : {};

  return (
    <>
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/30 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={`
          fixed inset-y-0 right-0 z-50 w-full sm:w-96
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          bg-white dark:bg-gray-800 shadow-xl
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-label="Changelog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-fountain-dark dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-fountain-dark dark:text-white">What's New</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close changelog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fountain-dark dark:border-teal-400" />
            </div>
          )}

          {error && (
            <div className="py-8 text-center">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={() => setData(null)}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                Try again
              </button>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-6">
              {Object.entries(groupedEntries)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([monthKey, entries]) => (
                  <div key={monthKey}>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {getMonthLabel(monthKey)}
                    </h3>
                    <div className="space-y-3">
                      {entries.map((entry, idx) => {
                        const typeInfo = TYPE_ICONS[entry.type] || TYPE_ICONS.feature;
                        return (
                          <div
                            key={`${entry.date}-${idx}`}
                            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
                          >
                            <div className="flex items-start gap-3">
                              <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${typeInfo.color}`}>
                                {typeInfo.icon}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-fountain-dark dark:text-white text-sm">
                                    {entry.title}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                                  {entry.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {formatDate(entry.date)}
                                  </span>
                                  {entry.states && entry.states.length > 0 && entry.states[0] !== 'All' && (
                                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                                      {entry.states.join(', ')}
                                    </span>
                                  )}
                                  {entry.services && entry.services.length > 0 && (
                                    <span className="text-xs px-1.5 py-0.5 bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 rounded">
                                      {entry.services.join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Data sourced from Provider Compliance Dashboard
          </p>
        </div>
      </div>
    </>
  );
}
