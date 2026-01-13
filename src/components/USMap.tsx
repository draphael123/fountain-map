import { useState, useMemo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  GeographyObject,
} from 'react-simple-maps';
import { 
  ServiceType, 
  SERVICE_INFO, 
  isServiceAvailable, 
  getStateName,
  getServicesForState,
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

  // Count active states
  const activeStateCount = useMemo(() => {
    return Object.keys(FIPS_TO_STATE).filter(fips => {
      const stateId = FIPS_TO_STATE[fips];
      return isServiceAvailable(stateId, selectedService);
    }).length;
  }, [selectedService]);

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

      {/* Map container */}
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000,
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
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
              })
            }
          </Geographies>
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

