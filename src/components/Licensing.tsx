import { useState, useEffect } from 'react';
import { CSRMap } from './CSRMap';
import { ProviderAuthorityMap } from './ProviderAuthorityMap';
import { StateRulesMap } from './StateRulesMap';
import { StateCSRefillMap } from './StateCSRefillMap';

export type LicensingMapType =
  | 'csr'
  | 'provider-authority'
  | 'state-rules'
  | 'cs-refill';

interface MapInfo {
  id: LicensingMapType;
  name: string;
  description: string;
}

export const LICENSING_MAPS: MapInfo[] = [
  {
    id: 'csr',
    name: 'CSR',
    description: 'Customer Service Representative licensing requirements',
  },
  {
    id: 'provider-authority',
    name: 'Provider authority',
    description: 'Where providers are licensed by state',
  },
  {
    id: 'state-rules',
    name: 'State rules',
    description: 'Compact, operational, steps, DEA CSR, CPA',
  },
  {
    id: 'cs-refill',
    name: 'CS refills',
    description: 'Controlled substance prescription & refill notes',
  },
];

interface LicensingProps {
  initialMap?: LicensingMapType;
  onMapChange?: (map: LicensingMapType) => void;
}

export function Licensing({ initialMap, onMapChange }: LicensingProps) {
  const [activeMap, setActiveMap] = useState<LicensingMapType>(initialMap || 'csr');

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

  return (
    <div className="w-full px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-fountain-dark dark:text-white mb-2">
          Licensing Maps
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          State-by-state licensing tools for the licensing team
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-8 max-w-6xl mx-auto">
        {LICENSING_MAPS.map((map) => (
          <button
            key={map.id}
            type="button"
            onClick={() => handleMapChange(map.id)}
            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left ${
              activeMap === map.id
                ? 'bg-fountain-dark text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <span className="block">{map.name}</span>
            <span
              className={`block text-xs font-normal mt-0.5 ${
                activeMap === map.id ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {map.description}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
        {activeMap === 'csr' && <CSRMap />}
        {activeMap === 'provider-authority' && <ProviderAuthorityMap showTitle={false} />}
        {activeMap === 'state-rules' && <StateRulesMap />}
        {activeMap === 'cs-refill' && <StateCSRefillMap />}
      </div>
    </div>
  );
}
