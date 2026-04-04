import { useState, useEffect, useCallback } from 'react';
import { CSRMap } from './CSRMap';
import { ProviderAuthorityMap } from './ProviderAuthorityMap';
import { StateRulesMap } from './StateRulesMap';
import { StateCSRefillMap } from './StateCSRefillMap';
import { DATA_LAST_UPDATED } from '../data/dataMeta';

export type LicensingMapType =
  | 'csr'
  | 'provider-authority'
  | 'state-rules'
  | 'cs-refill';

export interface LicensingMapInfo {
  id: LicensingMapType;
  name: string;
  description: string;
  /** Distinct emoji for quick scanning */
  icon: string;
}

export const LICENSING_MAPS: LicensingMapInfo[] = [
  {
    id: 'csr',
    name: 'CSR',
    description: 'DEA Customer Service Representative rules',
    icon: '📋',
  },
  {
    id: 'provider-authority',
    name: 'Provider authority',
    description: 'Who holds licenses in each state',
    icon: '👤',
  },
  {
    id: 'state-rules',
    name: 'State rules',
    description: 'Compact, ops, steps, DEA CSR, CPA',
    icon: '⚖️',
  },
  {
    id: 'cs-refill',
    name: 'CS refills',
    description: 'Controlled Rx & refill limits',
    icon: '💊',
  },
];

interface LicensingProps {
  initialMap?: LicensingMapType;
  onMapChange?: (map: LicensingMapType) => void;
}

export function Licensing({ initialMap, onMapChange }: LicensingProps) {
  const [activeMap, setActiveMap] = useState<LicensingMapType>(initialMap || 'csr');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialMap && initialMap !== activeMap) {
      setActiveMap(initialMap);
    }
  }, [initialMap]);

  const handleMapChange = (map: LicensingMapType) => {
    setActiveMap(map);
    onMapChange?.(map);
    if (map !== 'csr') {
      const url = new URL(window.location.href);
      url.searchParams.delete('csrCategory');
      url.searchParams.delete('csrProvider');
      window.history.replaceState({}, '', url.toString());
    }
  };

  const copyPageLink = useCallback(() => {
    void navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }, []);

  return (
    <div className="w-full px-4">
      <div className="text-center mb-6 max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3">
          <h1 className="text-3xl lg:text-4xl font-bold text-fountain-dark dark:text-white">Licensing Maps</h1>
          <button
            type="button"
            onClick={copyPageLink}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 text-fountain-dark dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {copied ? 'Copied!' : 'Copy page link'}
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          State-by-state licensing tools for the licensing team. Press{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-xs font-mono">/</kbd> anytime to open{' '}
          <strong className="font-medium text-fountain-dark dark:text-white">Check My State</strong> (search by state).
        </p>
      </div>

      <details className="max-w-3xl mx-auto mb-6 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/90 dark:bg-gray-800/50 px-4 py-3 text-sm text-left text-gray-700 dark:text-gray-300">
        <summary className="cursor-pointer font-semibold text-fountain-dark dark:text-white list-none flex items-center justify-between gap-2">
          <span>Which map should I use?</span>
          <span className="text-gray-400 text-xs" aria-hidden>
            ▼
          </span>
        </summary>
        <ul className="mt-3 space-y-2 list-disc pl-5">
          <li>
            <strong className="text-fountain-dark dark:text-white">CSR</strong> — DEA CSR registration requirements (controlled
            substance prescribing) by state; use filters and exports for audits.
          </li>
          <li>
            <strong className="text-fountain-dark dark:text-white">Provider authority</strong> — Where selected clinicians are
            licensed; good for coverage and staffing questions.
          </li>
          <li>
            <strong className="text-fountain-dark dark:text-white">State rules</strong> — High-level operational checklist:
            compact, live ops, required steps, DEA CSR / CPA flags.
          </li>
          <li>
            <strong className="text-fountain-dark dark:text-white">CS refills</strong> — Prescription duration, refills, and
            related CS dispensing notes by state.
          </li>
        </ul>
      </details>

      <div className="sticky top-0 z-30 -mx-4 px-4 py-3 mb-4 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200/80 dark:border-gray-600/80 rounded-xl shadow-sm">
        <p className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
          Licensing tools
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 max-w-6xl mx-auto">
          {LICENSING_MAPS.map((map) => (
            <button
              key={map.id}
              type="button"
              onClick={() => handleMapChange(map.id)}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
                activeMap === map.id
                  ? 'bg-fountain-dark text-white shadow-lg ring-2 ring-teal-400/50'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="text-2xl leading-none flex-shrink-0" aria-hidden>
                {map.icon}
              </span>
              <span className="min-w-0">
                <span className="block">{map.name}</span>
                <span
                  className={`block text-xs font-normal mt-1 ${
                    activeMap === map.id ? 'text-white/85' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {map.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
        {activeMap === 'csr' && <CSRMap />}
        {activeMap === 'provider-authority' && <ProviderAuthorityMap showTitle={false} />}
        {activeMap === 'state-rules' && <StateRulesMap />}
        {activeMap === 'cs-refill' && <StateCSRefillMap />}
      </div>

      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
        Data last updated (service + licensing snapshots): <strong className="text-gray-700 dark:text-gray-300">{DATA_LAST_UPDATED}</strong>.
        Internal reference only — verify against boards, DEA, and counsel before operational decisions.
      </p>
    </div>
  );
}
