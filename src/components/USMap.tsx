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
  onCheckState: (stateId: string) => void;
}

export function USMap({ selectedService, onCheckState }: USMapProps) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
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

  // Handle state click - open Check My State modal
  const handleStateClick = useCallback((stateId: string) => {
    onCheckState(stateId);
  }, [onCheckState]);

  // Sorted states list with availability
  const sortedStates = useMemo(() => {
    return [...US_STATES].sort((a, b) => a.name.localeCompare(b.name)).map(state => ({
      ...state,
      isAvailable: isServiceAvailable(state.id, selectedService),
    }));
  }, [selectedService]);

  // Filtered states for search
  const filteredSearchStates = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return US_STATES.filter(
      state => 
        state.name.toLowerCase().includes(query) || 
        state.id.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [searchQuery]);

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
          <span className="service-color-transition" style={{ color: activeColor }}>{serviceInfo.name}</span>
          <span>Active States</span>
        </h2>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          {serviceInfo.fullName} • {serviceInfo.shortDescription}
        </p>
        <p className="text-gray-500 mt-1 text-sm">
          Available in <span className="font-semibold service-color-transition" style={{ color: activeColor }}>{activeStateCount}</span> states
        </p>
      </div>

      {/* State Search & Check My State */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 px-4">
        {/* State Search */}
        <div className="relative w-full sm:w-72">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search for a state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-fountain-trt focus:outline-none transition-colors"
          />
          
          {/* Search Results Dropdown */}
          {isSearchFocused && filteredSearchStates.length > 0 && (
            <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
              {filteredSearchStates.map(state => {
                const available = isServiceAvailable(state.id, selectedService);
                const allServices = getServicesForState(state.id);
                return (
                  <button
                    key={state.id}
                    onClick={() => {
                      onCheckState(state.id);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div>
                      <span className="font-medium text-fountain-dark">{state.name}</span>
                      <span className="text-gray-400 ml-2">({state.id})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {allServices.length > 0 ? (
                        <div className="flex gap-1">
                          {allServices.map(service => (
                            <span
                              key={service}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: SERVICE_INFO[service].color }}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Coming soon</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded ${available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {available ? 'Available' : 'Soon'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Check My State Button */}
        <button
          onClick={() => onCheckState('')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-fountain-trt text-fountain-dark rounded-xl font-semibold hover:bg-teal-300 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Check My State
        </button>
      </div>

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
                          transition: 'fill 0.4s ease',
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
                      onClick={() => handleStateClick(stateId)}
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
                    transition: 'fill 0.4s ease',
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
            className="w-5 h-5 rounded shadow-sm service-bg-transition"
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

      {/* Service Description Section */}
      <div className="max-w-3xl mx-auto mt-8 sm:mt-12 px-4">
        <div 
          className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm service-border-transition"
          style={{ borderColor: `${activeColor}30` }}
        >
          <div className="flex items-start gap-4">
            <div 
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center service-bg-transition"
              style={{ backgroundColor: `${activeColor}15` }}
            >
              <svg 
                className="w-6 h-6 service-color-transition" 
                fill="none" 
                stroke={activeColor} 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold text-fountain-dark mb-2">
                About Fountain<span className="service-color-transition" style={{ color: activeColor }}>{serviceInfo.name}</span>
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                {serviceInfo.longDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* States List - Always Visible for Ctrl+F Search */}
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-bold text-fountain-dark">Complete States List</h3>
            <p className="text-sm text-gray-500 mt-1">
              Use Ctrl+F (Cmd+F on Mac) to quickly find your state • {activeStates.length} available • {inactiveStates.length} coming soon
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-0">
            {/* Available States */}
            <div className="p-4 md:border-r border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <span 
                  className="w-3 h-3 rounded-full service-bg-transition"
                  style={{ backgroundColor: activeColor }}
                />
                <span className="font-bold text-sm service-color-transition" style={{ color: activeColor }}>
                  Available States ({activeStates.length})
                </span>
              </div>
              <div className="space-y-1">
                {activeStates.map(state => (
                  <div 
                    key={state.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => onCheckState(state.id)}
                  >
                    <span className="text-sm font-medium text-gray-700">{state.name}</span>
                    <span 
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${activeColor}15`, color: activeColor }}
                    >
                      {state.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coming Soon States */}
            <div className="p-4 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <span 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: inactiveColor }}
                />
                <span className="font-bold text-sm text-gray-500">
                  Coming Soon ({inactiveStates.length})
                </span>
              </div>
              <div className="space-y-1">
                {inactiveStates.map(state => (
                  <div 
                    key={state.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => onCheckState(state.id)}
                  >
                    <span className="text-sm text-gray-500">{state.name}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-gray-200 text-gray-500">
                      {state.id}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
            
            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-400">
              Click for full details →
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
