import { useState, useMemo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
  GeographyObject,
} from 'react-simple-maps';
import { 
  ServiceType, 
  SERVICE_INFO, 
  SERVICE_AVAILABILITY,
  isServiceAvailable, 
  getStateName,
  getServicesForState,
  US_STATES,
} from '../data/serviceAvailability';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

// State FIPS codes to state abbreviations mapping
const FIPS_TO_STATE: Record<string, string> = {
  '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
  '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
  '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
  '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
  '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
  '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
  '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
  '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
  '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
  '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
  '56': 'WY',
};

// State label coordinates [longitude, latitude]
const STATE_CENTERS: Record<string, [number, number]> = {
  'AL': [-86.9, 32.8],
  'AK': [-153.5, 64.2],
  'AZ': [-111.7, 34.2],
  'AR': [-92.4, 34.9],
  'CA': [-119.5, 37.2],
  'CO': [-105.5, 39.0],
  'CT': [-72.7, 41.6],
  'DE': [-75.5, 39.0],
  'DC': [-77.0, 38.9],
  'FL': [-81.7, 28.1],
  'GA': [-83.4, 32.6],
  'HI': [-157.5, 20.8],
  'ID': [-114.5, 44.4],
  'IL': [-89.2, 40.0],
  'IN': [-86.2, 39.9],
  'IA': [-93.5, 42.0],
  'KS': [-98.4, 38.5],
  'KY': [-85.3, 37.8],
  'LA': [-91.9, 31.0],
  'ME': [-69.0, 45.4],
  'MD': [-76.6, 39.0],
  'MA': [-71.8, 42.2],
  'MI': [-84.7, 43.3],
  'MN': [-94.3, 46.3],
  'MS': [-89.7, 32.7],
  'MO': [-92.5, 38.4],
  'MT': [-109.6, 47.0],
  'NE': [-99.8, 41.5],
  'NV': [-117.0, 39.5],
  'NH': [-71.5, 43.7],
  'NJ': [-74.4, 40.1],
  'NM': [-106.0, 34.5],
  'NY': [-75.5, 43.0],
  'NC': [-79.4, 35.5],
  'ND': [-100.5, 47.4],
  'OH': [-82.8, 40.2],
  'OK': [-97.5, 35.5],
  'OR': [-120.5, 44.0],
  'PA': [-77.6, 40.9],
  'RI': [-71.5, 41.7],
  'SC': [-80.9, 33.9],
  'SD': [-100.2, 44.4],
  'TN': [-86.3, 35.8],
  'TX': [-99.5, 31.5],
  'UT': [-111.7, 39.3],
  'VT': [-72.6, 44.0],
  'VA': [-78.8, 37.5],
  'WA': [-120.5, 47.4],
  'WV': [-80.6, 38.9],
  'WI': [-89.8, 44.6],
  'WY': [-107.5, 43.0],
};

// Small states that need offset annotations
const SMALL_STATES: Record<string, { dx: number; dy: number }> = {
  'VT': { dx: 45, dy: -10 },
  'NH': { dx: 40, dy: 5 },
  'MA': { dx: 50, dy: 0 },
  'RI': { dx: 40, dy: 5 },
  'CT': { dx: 40, dy: 10 },
  'NJ': { dx: 35, dy: 5 },
  'DE': { dx: 40, dy: 0 },
  'MD': { dx: 50, dy: 15 },
  'DC': { dx: 45, dy: 25 },
};

interface TooltipInfo {
  x: number;
  y: number;
  stateId: string;
  stateName: string;
  isAvailable: boolean;
}

interface USMapProps {
  selectedService: ServiceType;
}

export function USMap({ selectedService }: USMapProps) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const serviceInfo = SERVICE_INFO[selectedService];
  const activeColor = serviceInfo.color;
  const inactiveColor = '#D1D5DB';

  const createMouseEnterHandler = useCallback((geo: GeographyObject) => {
    return (event: React.MouseEvent<SVGPathElement>) => {
      const stateId = FIPS_TO_STATE[geo.id] || geo.id;
      const stateName = getStateName(stateId);
      const available = isServiceAvailable(stateId, selectedService);
      
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        stateId,
        stateName,
        isAvailable: available,
      });
    };
  }, [selectedService]);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGPathElement>) => {
    setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
  }, []);

  // Sorted states list with availability
  const sortedStates = useMemo(() => {
    return [...US_STATES].sort((a, b) => a.name.localeCompare(b.name)).map(state => ({
      ...state,
      isAvailable: isServiceAvailable(state.id, selectedService),
    }));
  }, [selectedService]);

  // Count active states
  const activeStateCount = useMemo(() => {
    return SERVICE_AVAILABILITY[selectedService].length;
  }, [selectedService]);

  // Get active and inactive states for the dropdown
  const { activeStates, inactiveStates } = useMemo(() => {
    const active = sortedStates.filter(s => s.isAvailable);
    const inactive = sortedStates.filter(s => !s.isAvailable);
    return { activeStates: active, inactiveStates: inactive };
  }, [sortedStates]);

  return (
    <div className="relative w-full">
      {/* Map title */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-fountain-dark flex items-center justify-center gap-2 flex-wrap">
          <span>Fountain</span>
          <span style={{ color: activeColor }}>{serviceInfo.name}</span>
          <span>Active States</span>
        </h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          {serviceInfo.fullName} • {serviceInfo.description}
        </p>
        <p className="text-gray-500 mt-1 text-sm">
          Available in <span className="font-semibold" style={{ color: activeColor }}>{activeStateCount}</span> states
        </p>
      </div>

      {/* States Dropdown */}
      <div className="flex justify-center mb-6 px-4">
        <div className="relative w-full max-w-sm">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:border-gray-300 transition-colors"
            style={{ borderColor: isDropdownOpen ? activeColor : undefined }}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium text-fountain-dark">View States List</span>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown Content */}
          {isDropdownOpen && (
            <div className="absolute z-40 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
              {/* Available States */}
              <div className="p-3 border-b border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: activeColor }}
                  />
                  <span className="font-semibold text-sm text-fountain-dark">
                    Available ({activeStates.length})
                  </span>
                </div>
              </div>
              <div className="p-2">
                {activeStates.map(state => (
                  <div 
                    key={state.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-700">{state.name}</span>
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${activeColor}20`, color: activeColor }}
                    >
                      {state.id}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coming Soon States */}
              <div className="p-3 border-b border-t border-gray-100 sticky top-0 bg-white">
                <div className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: inactiveColor }}
                  />
                  <span className="font-semibold text-sm text-gray-500">
                    Coming Soon ({inactiveStates.length})
                  </span>
                </div>
              </div>
              <div className="p-2">
                {inactiveStates.map(state => (
                  <div 
                    key={state.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50"
                  >
                    <span className="text-sm text-gray-500">{state.name}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                      {state.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Map container */}
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000,
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => (
              <>
                {/* Render states */}
                {geographies.map((geo) => {
                  const stateId = FIPS_TO_STATE[geo.id] || geo.id;
                  const isAvailable = isServiceAvailable(stateId, selectedService);
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isAvailable ? activeColor : inactiveColor}
                      stroke="#ffffff"
                      strokeWidth={0.75}
                      style={{
                        default: {
                          outline: 'none',
                          transition: 'all 0.3s ease',
                        },
                        hover: {
                          fill: isAvailable ? activeColor : '#9CA3AF',
                          outline: 'none',
                          cursor: 'pointer',
                          filter: 'brightness(1.15)',
                        },
                        pressed: {
                          fill: isAvailable ? activeColor : '#9CA3AF',
                          outline: 'none',
                        },
                      }}
                      onMouseEnter={createMouseEnterHandler(geo)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={handleMouseMove}
                    />
                  );
                })}
              </>
            )}
          </Geographies>

          {/* State Labels - Regular states */}
          {Object.entries(STATE_CENTERS).map(([stateId, coords]) => {
            if (SMALL_STATES[stateId]) return null; // Skip small states, they use annotations
            if (stateId === 'AK' || stateId === 'HI') return null; // Skip AK/HI for now
            
            const isAvailable = isServiceAvailable(stateId, selectedService);
            
            return (
              <Marker key={stateId} coordinates={coords}>
                <text
                  textAnchor="middle"
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: stateId === 'DC' ? 6 : 10,
                    fontWeight: 600,
                    fill: isAvailable ? '#1E293B' : '#6B7280',
                    pointerEvents: 'none',
                    textShadow: '0 0 3px rgba(255,255,255,0.8)',
                  }}
                  dy={4}
                >
                  {stateId}
                </text>
              </Marker>
            );
          })}

          {/* Small state annotations with lines */}
          {Object.entries(SMALL_STATES).map(([stateId, offset]) => {
            const coords = STATE_CENTERS[stateId];
            if (!coords) return null;
            
            const isAvailable = isServiceAvailable(stateId, selectedService);
            
            return (
              <Annotation
                key={stateId}
                subject={coords}
                dx={offset.dx}
                dy={offset.dy}
                connectorProps={{
                  stroke: '#94A3B8',
                  strokeWidth: 1,
                  strokeLinecap: 'round',
                }}
              >
                <text
                  textAnchor="start"
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: 9,
                    fontWeight: 600,
                    fill: isAvailable ? activeColor : '#9CA3AF',
                  }}
                  dy={4}
                >
                  {stateId}
                </text>
              </Annotation>
            );
          })}
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 sm:mt-6 flex-wrap px-4">
        <div className="flex items-center gap-2">
          <div 
            className="w-5 h-5 rounded shadow-sm"
            style={{ backgroundColor: activeColor }}
          />
          <span className="text-sm text-gray-700">Service Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            className="w-5 h-5 rounded shadow-sm"
            style={{ backgroundColor: inactiveColor }}
          />
          <span className="text-sm text-gray-700">Coming Soon</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x + 15,
            top: tooltip.y - 10,
          }}
        >
          <div className="bg-fountain-dark text-white px-4 py-3 rounded-lg shadow-xl min-w-[180px]">
            <div className="font-semibold text-base mb-1">
              {tooltip.stateName}
            </div>
            <div className="text-xs text-gray-300 mb-2">
              ({tooltip.stateId})
            </div>
            <div 
              className={`
                inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium
                ${tooltip.isAvailable 
                  ? 'bg-green-500/20 text-green-300' 
                  : 'bg-gray-500/20 text-gray-300'
                }
              `}
            >
              <span 
                className={`w-2 h-2 rounded-full ${tooltip.isAvailable ? 'bg-green-400' : 'bg-gray-400'}`}
              />
              {tooltip.isAvailable ? 'Available' : 'Coming Soon'}
            </div>
            
            {/* Show other available services */}
            {tooltip.isAvailable && (
              <div className="mt-2 pt-2 border-t border-white/10">
                <div className="text-xs text-gray-400 mb-1">All services in {tooltip.stateId}:</div>
                <div className="flex flex-wrap gap-1">
                  {getServicesForState(tooltip.stateId).map(service => (
                    <span 
                      key={service}
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{ 
                        backgroundColor: `${SERVICE_INFO[service].color}30`,
                        color: SERVICE_INFO[service].color,
                      }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
