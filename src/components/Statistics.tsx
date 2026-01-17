import { useMemo } from 'react';
import { 
  SERVICE_INFO, 
  SERVICE_AVAILABILITY, 
  ServiceType,
  US_STATES,
  getServicesForState,
} from '../data/serviceAvailability';

export function Statistics() {
  const stats = useMemo(() => {
    const services: ServiceType[] = ['TRT', 'HRT', 'GLP', 'Planning'];
    const totalStates = US_STATES.length;
    
    // Calculate coverage for each service
    const serviceCoverage = services.map(service => ({
      service,
      info: SERVICE_INFO[service],
      count: SERVICE_AVAILABILITY[service].length,
      percentage: Math.round((SERVICE_AVAILABILITY[service].length / totalStates) * 100),
    }));

    // Calculate states by number of services
    const statesByServiceCount = US_STATES.reduce((acc, state) => {
      const serviceCount = getServicesForState(state.id).length;
      acc[serviceCount] = (acc[serviceCount] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    // States with at least one service
    const statesWithAnyService = US_STATES.filter(
      state => getServicesForState(state.id).length > 0
    ).length;

    // States with all services
    const statesWithAllServices = US_STATES.filter(
      state => getServicesForState(state.id).length === 4
    ).length;

    return {
      serviceCoverage,
      statesByServiceCount,
      statesWithAnyService,
      statesWithAllServices,
      totalStates,
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-fountain-dark dark:text-white">
          Coverage Statistics
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          See how Fountain services are expanding across the United States
        </p>
      </div>

      {/* Overall Coverage */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
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
              <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: info.color,
                  }}
                />
              </div>
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



