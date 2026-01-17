import { useMemo } from 'react';
import { SERVICE_AVAILABILITY, SERVICE_INFO, US_STATES } from '../data/serviceAvailability';

export function CoverageProgress() {
  const stats = useMemo(() => {
    const totalStates = US_STATES.length; // 51 including DC
    
    // Count unique states with ANY service (excluding Planning)
    const statesWithService = new Set<string>();
    (['TRT', 'HRT', 'GLP'] as const).forEach(service => {
      SERVICE_AVAILABILITY[service].forEach(state => statesWithService.add(state));
    });
    
    // Count states with ALL 3 services
    const statesWithAllServices = US_STATES.filter(state => 
      SERVICE_AVAILABILITY.TRT.includes(state.id) &&
      SERVICE_AVAILABILITY.HRT.includes(state.id) &&
      SERVICE_AVAILABILITY.GLP.includes(state.id)
    ).length;

    // Individual service counts
    const serviceCounts = {
      TRT: SERVICE_AVAILABILITY.TRT.length,
      HRT: SERVICE_AVAILABILITY.HRT.length,
      GLP: SERVICE_AVAILABILITY.GLP.length,
    };

    return {
      totalStates,
      statesWithAnyService: statesWithService.size,
      statesWithAllServices,
      serviceCounts,
      overallPercentage: Math.round((statesWithService.size / totalStates) * 100),
    };
  }, []);

  // Animation for the progress ring
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (stats.overallPercentage / 100) * circumference;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gradient-to-br from-fountain-dark to-gray-800 rounded-3xl p-6 sm:p-8 text-white overflow-hidden relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Coverage Progress
            </h2>
            <p className="text-gray-300 text-sm sm:text-base">
              Expanding access to wellness services across America
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Progress Ring */}
            <div className="flex justify-center">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#2DD4BF"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 0 6px rgba(45, 212, 191, 0.5))',
                    }}
                  />
                </svg>
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold">{stats.statesWithAnyService}</span>
                  <span className="text-sm text-gray-300">of {stats.totalStates} states</span>
                  <span className="text-xs text-fountain-trt mt-1">{stats.overallPercentage}% coverage</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="space-y-4">
              {/* States with all services */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">States with all 3 services</span>
                  <span className="text-2xl font-bold">{stats.statesWithAllServices}</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-fountain-trt via-fountain-hrt to-fountain-glp rounded-full transition-all duration-700"
                    style={{ width: `${(stats.statesWithAllServices / stats.totalStates) * 100}%` }}
                  />
                </div>
              </div>

              {/* Individual service bars */}
              {(['TRT', 'HRT', 'GLP'] as const).map(service => {
                const count = stats.serviceCounts[service];
                const percentage = Math.round((count / stats.totalStates) * 100);
                const info = SERVICE_INFO[service];
                
                return (
                  <div key={service} className="flex items-center gap-4">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${info.color}30` }}
                    >
                      <span className="text-sm font-bold" style={{ color: info.color }}>
                        {service}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">{info.fullName}</span>
                        <span className="text-sm font-semibold">{count} states</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: info.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

