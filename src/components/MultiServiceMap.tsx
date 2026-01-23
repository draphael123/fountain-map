import { useMemo, useCallback, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  GeographyObject,
} from 'react-simple-maps';
import { 
  SERVICE_INFO, 
  getServicesForState,
  getStateName,
  US_STATES,
} from '../data/serviceAvailability';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

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

const STATE_CENTERS: Record<string, [number, number]> = {
  'AL': [-86.9, 32.8], 'AZ': [-111.7, 34.2], 'AR': [-92.4, 34.9],
  'CA': [-119.5, 37.2], 'CO': [-105.5, 39.0], 'FL': [-81.7, 28.1],
  'GA': [-83.4, 32.6], 'ID': [-114.5, 44.4], 'IL': [-89.2, 40.0],
  'IN': [-86.2, 39.9], 'IA': [-93.5, 42.0], 'KS': [-98.4, 38.5],
  'KY': [-85.3, 37.8], 'LA': [-91.9, 31.0], 'ME': [-69.0, 45.4],
  'MI': [-84.7, 43.3], 'MN': [-94.3, 46.3], 'MS': [-89.7, 32.7],
  'MO': [-92.5, 38.4], 'MT': [-109.6, 47.0], 'NE': [-99.8, 41.5],
  'NV': [-117.0, 39.5], 'NM': [-106.0, 34.5], 'NY': [-75.5, 43.0],
  'NC': [-79.4, 35.5], 'ND': [-100.5, 47.4], 'OH': [-82.8, 40.2],
  'OK': [-97.5, 35.5], 'OR': [-120.5, 44.0], 'PA': [-77.6, 40.9],
  'SC': [-80.9, 33.9], 'SD': [-100.2, 44.4], 'TN': [-86.3, 35.8],
  'TX': [-99.5, 31.5], 'UT': [-111.7, 39.3], 'VA': [-78.8, 37.5],
  'WA': [-120.5, 47.4], 'WV': [-80.6, 38.9], 'WI': [-89.8, 44.6],
  'WY': [-107.5, 43.0],
};

// Color scale based on number of services
const SERVICE_COUNT_COLORS: Record<number, string> = {
  0: '#E5E7EB', // Gray - no services
  1: '#FDE68A', // Yellow - 1 service
  2: '#93C5FD', // Light blue - 2 services
  3: '#86EFAC', // Light green - 3 services
  4: '#2DD4BF', // Teal - all 4 services
};

interface TooltipInfo {
  x: number;
  y: number;
  stateId: string;
  stateName: string;
  serviceCount: number;
  services: string[];
}

interface MultiServiceMapProps {
  onCheckState: (stateId: string) => void;
}

export function MultiServiceMap({ onCheckState }: MultiServiceMapProps) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);

  const createMouseEnterHandler = useCallback((geo: GeographyObject) => {
    return (event: React.MouseEvent<SVGPathElement>) => {
      const stateId = FIPS_TO_STATE[geo.id] || geo.id;
      const stateName = getStateName(stateId);
      const services = getServicesForState(stateId);
      
      setTooltip({
        x: event.clientX,
        y: event.clientY,
        stateId,
        stateName,
        serviceCount: services.length,
        services: services.map(s => SERVICE_INFO[s].name),
      });
    };
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGPathElement>) => {
    setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
  }, []);

  // Statistics
  const stats = useMemo(() => {
    const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    US_STATES.forEach(state => {
      const count = getServicesForState(state.id).length;
      counts[count as keyof typeof counts]++;
    });
    return counts;
  }, []);

  return (
    <div className="relative w-full">
      {/* Title */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">
          Multi-Service Coverage Map
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          States colored by number of available Fountain services
        </p>
      </div>

      {/* Map */}
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: 1000 }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  const stateId = FIPS_TO_STATE[geo.id] || geo.id;
                  const serviceCount = getServicesForState(stateId).length;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={SERVICE_COUNT_COLORS[serviceCount]}
                      stroke="#ffffff"
                      strokeWidth={0.75}
                      style={{
                        default: { outline: 'none', transition: 'fill 0.3s ease' },
                        hover: { outline: 'none', cursor: 'pointer', filter: 'brightness(1.1)' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={createMouseEnterHandler(geo)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={handleMouseMove}
                      onClick={() => onCheckState(stateId)}
                    />
                  );
                })}
              </>
            )}
          </Geographies>

          {/* State Labels */}
          {Object.entries(STATE_CENTERS).map(([stateId, coords]) => {
            const serviceCount = getServicesForState(stateId).length;
            return (
              <Marker key={stateId} coordinates={coords}>
                <text
                  textAnchor="middle"
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: 10,
                    fontWeight: 600,
                    fill: serviceCount >= 3 ? '#1E293B' : '#6B7280',
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
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-6 px-4">
        {[0, 1, 2, 3, 4].map(count => (
          <div key={count} className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded shadow-sm"
              style={{ backgroundColor: SERVICE_COUNT_COLORS[count] }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {count} service{count !== 1 ? 's' : ''} ({stats[count as keyof typeof stats]})
            </span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}
        >
          <div className="bg-fountain-dark text-white px-4 py-3 rounded-lg shadow-xl min-w-[180px]">
            <div className="font-semibold text-base mb-1">{tooltip.stateName}</div>
            <div className="text-xs text-gray-300 mb-2">({tooltip.stateId})</div>
            <div className="text-sm">
              <span className="font-bold" style={{ color: SERVICE_COUNT_COLORS[tooltip.serviceCount] }}>
                {tooltip.serviceCount}
              </span> service{tooltip.serviceCount !== 1 ? 's' : ''} available
            </div>
            {tooltip.services.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tooltip.services.map(service => (
                  <span key={service} className="text-xs px-1.5 py-0.5 bg-white/20 rounded">
                    {service}
                  </span>
                ))}
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




