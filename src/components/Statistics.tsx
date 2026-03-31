import { useMemo } from 'react';
import {
  SERVICE_INFO,
  SERVICE_AVAILABILITY,
  ServiceType,
  US_STATES,
  getServicesForState,
  ASYNC_TIERS,
} from '../data/serviceAvailability';

export function Statistics() {
  const stats = useMemo(() => {
    // Services to display (excluding Planning, including Async)
    const services: ServiceType[] = ['TRT', 'HRT', 'GLP', 'Async'];
    const totalStates = US_STATES.length;

    // Calculate coverage for each service
    const serviceCoverage = services.map(service => ({
      service,
      info: SERVICE_INFO[service],
      count: SERVICE_AVAILABILITY[service].length,
      percentage: Math.round((SERVICE_AVAILABILITY[service].length / totalStates) * 100),
    }));

    // Calculate states by number of services (excluding Planning from count)
    const statesByServiceCount = US_STATES.reduce((acc, state) => {
      const allServices = getServicesForState(state.id);
      // Count only TRT, HRT, GLP, Async (exclude Planning)
      const serviceCount = allServices.filter(s => s !== 'Planning').length;
      acc[serviceCount] = (acc[serviceCount] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // States with at least one service (excluding Planning)
    const statesWithAnyService = US_STATES.filter(state => {
      const services = getServicesForState(state.id).filter(s => s !== 'Planning');
      return services.length > 0;
    }).length;

    // States with all 4 services (TRT, HRT, GLP, Async)
    const statesWithAllServices = US_STATES.filter(state => {
      const services = getServicesForState(state.id).filter(s => s !== 'Planning');
      return services.length === 4;
    }).length;

    // Async tier stats
    const asyncTierStats = {
      tier1: ASYNC_TIERS.tier1.length,
      tier2: ASYNC_TIERS.tier2.length,
      total: SERVICE_AVAILABILITY.Async.length,
    };

    return {
      serviceCoverage,
      statesByServiceCount,
      statesWithAnyService,
      statesWithAllServices,
      totalStates,
      asyncTierStats,
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">
          Statistics Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          See how Fountain services are expanding across the United States
        </p>
      </div>

      {/* Overall Coverage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-bold text-fountain-trt">
            {Math.round((stats.statesWithAnyService / stats.totalStates) * 100)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">States with Service</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-bold text-fountain-dark dark:text-white">
            {stats.statesWithAnyService}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">States Covered</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-bold text-fountain-planning">
            {stats.statesWithAllServices}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Full Coverage</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="text-3xl font-bold text-gray-400">
            {stats.totalStates - stats.statesWithAnyService}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Coming Soon</div>
        </div>
      </div>

      {/* Service Coverage Bars */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-fountain-dark dark:text-white mb-4">Service Coverage</h3>
        <div className="space-y-4">
          {stats.serviceCoverage.map(({ service, info, count, percentage }) => (
            <div key={service}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fountain<span style={{ color: info.color }}>{info.name}</span>
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {count} states ({percentage}%)
                </span>
              </div>
              {service === 'Async' ? (
                // Special bar for Async showing Tier 1 and Tier 2
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.round((stats.asyncTierStats.tier1 / stats.totalStates) * 100)}%`,
                      backgroundColor: SERVICE_INFO.Async.tier1Color,
                    }}
                    title={`Tier 1: ${stats.asyncTierStats.tier1} states`}
                  />
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.round((stats.asyncTierStats.tier2 / stats.totalStates) * 100)}%`,
                      backgroundColor: SERVICE_INFO.Async.tier2Color,
                    }}
                    title={`Tier 2: ${stats.asyncTierStats.tier2} states`}
                  />
                </div>
              ) : (
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: info.color,
                    }}
                  />
                </div>
              )}
              {/* Async tier breakdown labels */}
              {service === 'Async' && (
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SERVICE_INFO.Async.tier1Color }} />
                    Tier 1: {stats.asyncTierStats.tier1}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: SERVICE_INFO.Async.tier2Color }} />
                    Tier 2: {stats.asyncTierStats.tier2}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* States by Service Count */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-fountain-dark dark:text-white mb-4">States by Number of Services</h3>
        <div className="grid grid-cols-5 gap-2">
          {[0, 1, 2, 3, 4].map(count => (
            <div 
              key={count}
              className={`text-center p-3 rounded-lg ${
                count === 0 
                  ? 'bg-gray-100 dark:bg-gray-700' 
                  : count === 4 
                    ? 'bg-gradient-to-br from-fountain-trt/20 to-fountain-planning/20' 
                    : 'bg-gray-50 dark:bg-gray-700/50'
              }`}
            >
              <div className="text-2xl font-bold text-fountain-dark dark:text-white">
                {stats.statesByServiceCount[count] || 0}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {count} service{count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




