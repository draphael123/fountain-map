import { useMemo } from 'react';
import { SERVICE_INFO, SERVICE_AVAILABILITY, US_STATES, ServiceType } from '../data/serviceAvailability';

export function ServiceComparison() {
  const services: Exclude<ServiceType, 'Planning'>[] = ['TRT', 'HRT', 'GLP'];

  // Calculate coverage statistics
  const stats = useMemo(() => {
    const totalStates = US_STATES.length;
    
    // States with all 3 services
    const statesWithAll = US_STATES.filter(state => 
      services.every(service => SERVICE_AVAILABILITY[service].includes(state.id))
    );
    
    // States with at least one service
    const statesWithAny = US_STATES.filter(state => 
      services.some(service => SERVICE_AVAILABILITY[service].includes(state.id))
    );
    
    // States with no services
    const statesWithNone = US_STATES.filter(state => 
      !services.some(service => SERVICE_AVAILABILITY[service].includes(state.id))
    );

    // Per-service breakdown
    const serviceStats = services.map(service => ({
      service,
      count: SERVICE_AVAILABILITY[service].length,
      percentage: Math.round((SERVICE_AVAILABILITY[service].length / totalStates) * 100),
      states: SERVICE_AVAILABILITY[service]
        .map(id => US_STATES.find(s => s.id === id)!)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }));

    return {
      totalStates,
      statesWithAll,
      statesWithAny,
      statesWithNone,
      serviceStats,
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-fountain-dark dark:text-white mb-3">
          State Coverage Comparison
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Compare service availability across all 50 states + DC
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 text-center">
          <div className="text-3xl font-bold text-fountain-dark dark:text-white">{stats.totalStates}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total States</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-5 border border-green-200 dark:border-green-800 text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.statesWithAll.length}</div>
          <div className="text-sm text-green-700 dark:text-green-300 mt-1">All 3 Services</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800 text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.statesWithAny.length}</div>
          <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">At Least 1 Service</div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-5 border border-gray-200 dark:border-gray-600 text-center">
          <div className="text-3xl font-bold text-gray-600 dark:text-gray-300">{stats.statesWithNone.length}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Coming Soon</div>
        </div>
      </div>

      {/* Service Coverage Bars */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <h3 className="text-lg font-bold text-fountain-dark dark:text-white mb-6">Coverage by Service</h3>
        <div className="space-y-6">
          {stats.serviceStats.map(({ service, count, percentage }) => {
            const info = SERVICE_INFO[service];
            return (
              <div key={service}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${info.color}20` }}
                    >
                      <span className="text-sm font-bold" style={{ color: info.color }}>
                        {service}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-fountain-dark dark:text-white">
                        {info.fullName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold" style={{ color: info.color }}>{count}</span>
                    <span className="text-gray-400 ml-1">/ {stats.totalStates}</span>
                    <span className="ml-3 text-sm font-medium px-2 py-1 rounded-full" style={{ backgroundColor: `${info.color}15`, color: info.color }}>
                      {percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${percentage}%`, backgroundColor: info.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* State Lists by Service */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {stats.serviceStats.map(({ service, states }) => {
          const info = SERVICE_INFO[service];
          return (
            <div 
              key={service}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div 
                className="px-5 py-4 border-b border-gray-100 dark:border-gray-700"
                style={{ backgroundColor: `${info.color}08` }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold" style={{ color: info.color }}>
                    {info.name} States
                  </h3>
                  <span 
                    className="text-sm font-medium px-2 py-1 rounded-full"
                    style={{ backgroundColor: `${info.color}15`, color: info.color }}
                  >
                    {states.length} states
                  </span>
                </div>
              </div>
              <div className="p-4 max-h-80 overflow-y-auto">
                <div className="grid grid-cols-2 gap-1">
                  {states.map(state => (
                    <div 
                      key={state.id}
                      className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-300 truncate">{state.name}</span>
                      <span 
                        className="text-xs font-bold ml-1"
                        style={{ color: info.color }}
                      >
                        {state.id}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* States with All Services */}
      <div className="mt-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-green-800 dark:text-green-200">
              States with All 3 Services
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Full coverage: TRT, HRT, and GLP-1
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.statesWithAll
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(state => (
              <span 
                key={state.id}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg text-sm font-medium text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700"
              >
                {state.name}
              </span>
            ))}
        </div>
      </div>

    </div>
  );
}
