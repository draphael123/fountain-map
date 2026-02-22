import { REGIONS, SERVICE_AVAILABILITY, SERVICE_INFO } from '../data/serviceAvailability';
import type { ServiceType } from '../data/serviceAvailability';

const SERVICES: ServiceType[] = ['TRT', 'HRT', 'GLP'];

function isServiceAvailable(stateId: string, service: ServiceType): boolean {
  return SERVICE_AVAILABILITY[service].includes(stateId);
}

export function RegionalSummary() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 no-print">
      <h3 className="text-base sm:text-lg font-bold text-fountain-dark dark:text-white mb-4">
        Regional Coverage Summary
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {Object.entries(REGIONS).map(([key, region]) => (
          <div
            key={key}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 sm:p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: region.color }}
              />
              <span className="font-semibold text-fountain-dark dark:text-white text-sm sm:text-base truncate">
                {region.name}
              </span>
            </div>
            <div className="space-y-2">
              {SERVICES.map((service) => {
                const available = region.states.filter((s) => isServiceAvailable(s, service)).length;
                const total = region.states.length;
                const pct = Math.round((available / total) * 100);
                const info = SERVICE_INFO[service];
                return (
                  <div
                    key={service}
                    className="flex items-center justify-between text-xs sm:text-sm"
                  >
                    <span
                      className="font-medium"
                      style={{ color: info.color }}
                    >
                      {service}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {available}/{total}
                      <span className="ml-1 text-gray-500 dark:text-gray-500">({pct}%)</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
