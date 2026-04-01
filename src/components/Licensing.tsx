import { useState } from 'react';
import { CSRMap } from './CSRMap';

type LicensingMapType = 'csr';

interface MapInfo {
  id: LicensingMapType;
  name: string;
  description: string;
}

const LICENSING_MAPS: MapInfo[] = [
  {
    id: 'csr',
    name: 'CSR',
    description: 'Customer Service Representative licensing requirements',
  },
  // Add more maps here as needed
];

export function Licensing() {
  const [activeMap, setActiveMap] = useState<LicensingMapType>('csr');

  return (
    <div className="w-full px-4">
      {/* Section Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-bold text-fountain-dark dark:text-white mb-2">
          Licensing Maps
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          State-by-state licensing requirements for the licensing team
        </p>
      </div>

      {/* Map Selector - Only show if there are multiple maps */}
      {LICENSING_MAPS.length > 1 && (
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {LICENSING_MAPS.map(map => (
            <button
              key={map.id}
              onClick={() => setActiveMap(map.id)}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeMap === map.id
                  ? 'bg-fountain-dark text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {map.name}
            </button>
          ))}
        </div>
      )}

      {/* Active Map */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 sm:p-6 lg:p-8">
        {activeMap === 'csr' && <CSRMap />}
      </div>
    </div>
  );
}
