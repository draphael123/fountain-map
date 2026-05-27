import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  GeographyObject,
} from 'react-simple-maps';
import { getStateName, US_STATES } from '../data/serviceAvailability';
import { useTheme } from '../context/ThemeContext';
import { loadProviderLicensingData, buildProviderCountMap, ProviderLicensingData } from '../data/providerAuthority';

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

// Capacity color scale (gradient from light to dark)
const CAPACITY_RANGES = [
  { min: 0, max: 0, color: '#E5E7EB', label: 'No providers' },
  { min: 1, max: 2, color: '#BFDBFE', label: '1-2 providers' },
  { min: 3, max: 5, color: '#60A5FA', label: '3-5 providers' },
  { min: 6, max: 10, color: '#2563EB', label: '6-10 providers' },
  { min: 11, max: Infinity, color: '#1E3A8A', label: '11+ providers' },
];

// Colorblind-safe alternative (yellow to dark orange)
const CAPACITY_RANGES_COLORBLIND = [
  { min: 0, max: 0, color: '#F3F4F6', label: 'No providers' },
  { min: 1, max: 2, color: '#FDE68A', label: '1-2 providers' },
  { min: 3, max: 5, color: '#FDBA74', label: '3-5 providers' },
  { min: 6, max: 10, color: '#F97316', label: '6-10 providers' },
  { min: 11, max: Infinity, color: '#C2410C', label: '11+ providers' },
];

function getCapacityColor(count: number, colorblindMode: boolean): string {
  const ranges = colorblindMode ? CAPACITY_RANGES_COLORBLIND : CAPACITY_RANGES;
  const range = ranges.find(r => count >= r.min && count <= r.max);
  return range?.color || '#E5E7EB';
}

interface TooltipInfo {
  x: number;
  y: number;
  stateId: string;
  stateName: string;
  providerCount: number;
  providers: string[];
}

interface CapacityMapProps {
  onCheckState?: (stateId: string) => void;
}

export function CapacityMap({ onCheckState }: CapacityMapProps) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  const [providerData, setProviderData] = useState<ProviderLicensingData | null>(null);
  const [loading, setLoading] = useState(true);
  const { colorblindMode } = useTheme();

  const ranges = colorblindMode ? CAPACITY_RANGES_COLORBLIND : CAPACITY_RANGES;

  // Load provider data
  useEffect(() => {
    loadProviderLicensingData()
      .then(data => {
        setProviderData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Responsive check
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const fn = () => setIsMobile(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);

  // Build provider count map
  const providerCountMap = useMemo(() => {
    if (!providerData) return {};
    return buildProviderCountMap(providerData);
  }, [providerData]);

  // Get providers for a state
  const getProvidersInState = useCallback((stateId: string): string[] => {
    if (!providerData) return [];
    const row = providerData.rows.find(r => r.stateId === stateId);
    return row ? Object.keys(row.providers) : [];
  }, [providerData]);

  // Statistics
  const stats = useMemo(() => {
    const counts = { 0: 0, low: 0, medium: 0, high: 0, veryHigh: 0 };
    let total = 0;
    let max = 0;
    let maxState = '';

    US_STATES.forEach(state => {
      const count = providerCountMap[state.id] || 0;
      total += count;
      if (count > max) {
        max = count;
        maxState = state.name;
      }
      if (count === 0) counts[0]++;
      else if (count <= 2) counts.low++;
      else if (count <= 5) counts.medium++;
      else if (count <= 10) counts.high++;
      else counts.veryHigh++;
    });

    return {
      counts,
      total,
      average: (total / US_STATES.length).toFixed(1),
      max,
      maxState,
    };
  }, [providerCountMap]);

  const createMouseEnterHandler = useCallback((geo: GeographyObject) => {
    return (event: React.MouseEvent<SVGPathElement>) => {
      const stateId = FIPS_TO_STATE[geo.id] || geo.id;
      const stateName = getStateName(stateId);
      const providerCount = providerCountMap[stateId] || 0;
      const providers = getProvidersInState(stateId);

      setTooltip({
        x: event.clientX,
        y: event.clientY,
        stateId,
        stateName,
        providerCount,
        providers,
      });
    };
  }, [providerCountMap, getProvidersInState]);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGPathElement>) => {
    setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fountain-dark dark:border-teal-400" />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Title */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">
          Provider Capacity Map
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          States colored by number of licensed providers
        </p>
      </div>

      {/* Quick Stats */}
      <div className="max-w-4xl mx-auto mb-6 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-fountain-dark dark:text-white">{stats.total}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total Providers</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-fountain-dark dark:text-white">{stats.average}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Avg per State</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-fountain-dark dark:text-white">{stats.max}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Max ({stats.maxState.split(' ')[0]})</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.counts[0]}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">No Coverage</div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 touch-manipulation">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{ scale: isMobile ? 750 : 1000 }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  const stateId = FIPS_TO_STATE[geo.id] || geo.id;
                  const providerCount = providerCountMap[stateId] || 0;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={getCapacityColor(providerCount, colorblindMode)}
                      stroke="#ffffff"
                      strokeWidth={isMobile ? 1.25 : 0.75}
                      style={{
                        default: { outline: 'none', transition: 'fill 0.3s ease' },
                        hover: { outline: 'none', cursor: 'pointer', filter: 'brightness(1.1)' },
                        pressed: { outline: 'none' },
                      }}
                      onMouseEnter={createMouseEnterHandler(geo)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={handleMouseMove}
                      onClick={() => onCheckState?.(stateId)}
                    />
                  );
                })}
              </>
            )}
          </Geographies>

          {/* Provider Count Labels */}
          {Object.entries(STATE_CENTERS).map(([stateId, coords]) => {
            const count = providerCountMap[stateId] || 0;
            return (
              <Marker key={stateId} coordinates={coords}>
                <text
                  textAnchor="middle"
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: isMobile ? 10 : 9,
                    fontWeight: 700,
                    fill: count >= 6 ? '#FFFFFF' : count > 0 ? '#1E293B' : '#9CA3AF',
                    pointerEvents: 'none',
                    textShadow: count >= 6 ? '0 1px 2px rgba(0,0,0,0.5)' : '0 0 3px rgba(255,255,255,0.8)',
                  }}
                  dy={4}
                >
                  {count}
                </text>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="mt-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-3 px-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            {ranges.map((range, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded shadow-sm"
                  style={{ backgroundColor: range.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {range.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}
        >
          <div className="bg-fountain-dark text-white px-4 py-3 rounded-lg shadow-xl min-w-[200px] max-w-[280px]">
            <div className="font-semibold text-base mb-1">{tooltip.stateName}</div>
            <div className="text-xs text-gray-300 mb-2">({tooltip.stateId})</div>
            <div className="text-sm mb-2">
              <span
                className="font-bold text-lg"
                style={{ color: getCapacityColor(tooltip.providerCount, colorblindMode) }}
              >
                {tooltip.providerCount}
              </span> provider{tooltip.providerCount !== 1 ? 's' : ''} licensed
            </div>
            {tooltip.providers.length > 0 && (
              <div className="border-t border-white/20 pt-2 mt-2">
                <div className="text-xs text-gray-400 mb-1">Providers:</div>
                <div className="text-xs text-gray-200 max-h-24 overflow-y-auto">
                  {tooltip.providers.slice(0, 8).join(', ')}
                  {tooltip.providers.length > 8 && ` +${tooltip.providers.length - 8} more`}
                </div>
              </div>
            )}
            {onCheckState && (
              <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-400">
                Click for full details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
