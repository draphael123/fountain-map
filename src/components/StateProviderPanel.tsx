import { useEffect, useRef, useCallback } from 'react';
import { ProviderLicensingRow } from '../data/providerAuthority';

interface StateProviderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  stateId: string;
  stateName: string;
  row: ProviderLicensingRow | undefined;
}

export function StateProviderPanel({ isOpen, onClose, stateId, stateName, row }: StateProviderPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Get provider names from the row
  const providers = row ? Object.keys(row.providers).sort((a, b) => a.localeCompare(b)) : [];

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
          fixed inset-y-0 right-0 z-50 w-full sm:w-80 md:w-96
          transform transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          bg-white dark:bg-gray-800 shadow-xl
          flex flex-col
        `}
        role="dialog"
        aria-modal="true"
        aria-label={`Providers in ${stateName}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-fountain-dark text-white">
          <div>
            <h2 className="text-lg font-semibold">{stateName}</h2>
            <p className="text-sm text-gray-300">({stateId})</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-300 hover:bg-white/10 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {providers.length > 0 ? (
            <>
              {/* Count */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-fountain-dark dark:text-white">{providers.length}</span> provider{providers.length !== 1 ? 's' : ''} licensed
                </p>
              </div>

              {/* Provider List */}
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {providers.map((provider, idx) => (
                  <li
                    key={provider}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 text-xs font-medium flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {provider}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No providers licensed in this state
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Click outside or press Esc to close
          </p>
        </div>
      </div>
    </>
  );
}
