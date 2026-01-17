import { useMemo } from 'react';
import { SERVICE_INFO, getStateName, ServiceType } from '../data/serviceAvailability';

// Recent expansions data - Update this when new states are added
// Format: { service: ServiceType, states: string[], date: string }
const RECENT_EXPANSIONS: { service: Exclude<ServiceType, 'Planning'>; states: string[]; date: string }[] = [
  { service: 'GLP', states: ['KY', 'NH'], date: 'January 2026' },
  { service: 'TRT', states: ['ME', 'VT'], date: 'December 2025' },
  { service: 'HRT', states: ['ME', 'VT'], date: 'December 2025' },
];

export function ExpansionBanner() {
  // Get most recent expansion
  const latestExpansion = useMemo(() => {
    return RECENT_EXPANSIONS[0];
  }, []);

  if (!latestExpansion) return null;

  const serviceInfo = SERVICE_INFO[latestExpansion.service];
  const stateNames = latestExpansion.states.map(id => getStateName(id));

  return (
    <div className="max-w-4xl mx-auto mb-6 px-4">
      <div 
        className="relative overflow-hidden rounded-xl border-2 p-4 sm:p-5"
        style={{ 
          backgroundColor: `${serviceInfo.color}08`,
          borderColor: `${serviceInfo.color}30`,
        }}
      >
        {/* Animated background gradient */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: `linear-gradient(90deg, transparent, ${serviceInfo.color}, transparent)`,
            animation: 'shimmer 3s infinite',
          }}
        />
        
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Animated celebration icon */}
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce"
              style={{ backgroundColor: `${serviceInfo.color}20` }}
            >
              🎉
            </div>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  New Expansion
                </span>
                <span 
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: serviceInfo.color, color: 'white' }}
                >
                  {latestExpansion.date}
                </span>
              </div>
              <p className="mt-1 text-lg font-bold text-fountain-dark dark:text-white">
                <span style={{ color: serviceInfo.color }}>{serviceInfo.name}</span>
                {' '}now available in{' '}
                <span style={{ color: serviceInfo.color }}>
                  {stateNames.length === 1 
                    ? stateNames[0]
                    : stateNames.slice(0, -1).join(', ') + ' & ' + stateNames[stateNames.length - 1]
                  }
                </span>!
              </p>
            </div>
          </div>

          <a
            href={`https://www.fountain${serviceInfo.name.toLowerCase()}.com/get-started`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
            style={{ backgroundColor: serviceInfo.color }}
          >
            Start Now
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

