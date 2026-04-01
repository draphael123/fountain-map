import { useState, useMemo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
} from 'react-simple-maps';
import { getStateName } from '../data/serviceAvailability';
import {
  CSRCategory,
  CSR_DATA,
  CSR_COLORS,
  CSR_CATEGORY_INFO,
  getProviderType,
  getCategoriesForState,
} from '../data/csrLicensing';

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
  'AL': [-86.9, 32.8], 'AK': [-153.5, 64.2], 'AZ': [-111.7, 34.2],
  'AR': [-92.4, 34.9], 'CA': [-119.5, 37.2], 'CO': [-105.5, 39.0],
  'CT': [-72.7, 41.6], 'DE': [-75.5, 39.0], 'DC': [-77.0, 38.9],
  'FL': [-81.7, 28.1], 'GA': [-83.4, 32.6], 'HI': [-157.5, 20.8],
  'ID': [-114.5, 44.4], 'IL': [-89.2, 40.0], 'IN': [-86.2, 39.9],
  'IA': [-93.5, 42.0], 'KS': [-98.4, 38.5], 'KY': [-85.3, 37.8],
  'LA': [-91.9, 31.0], 'ME': [-69.0, 45.4], 'MD': [-76.6, 39.0],
  'MA': [-71.8, 42.2], 'MI': [-84.7, 43.3], 'MN': [-94.3, 46.3],
  'MS': [-89.7, 32.7], 'MO': [-92.5, 38.4], 'MT': [-109.6, 47.0],
  'NE': [-99.8, 41.5], 'NV': [-117.0, 39.5], 'NH': [-71.5, 43.7],
  'NJ': [-74.4, 40.1], 'NM': [-106.0, 34.5], 'NY': [-75.5, 43.0],
  'NC': [-79.4, 35.5], 'ND': [-100.5, 47.4], 'OH': [-82.8, 40.2],
  'OK': [-97.5, 35.5], 'OR': [-120.5, 44.0], 'PA': [-77.6, 40.9],
  'RI': [-71.5, 41.7], 'SC': [-80.9, 33.9], 'SD': [-100.2, 44.4],
  'TN': [-86.3, 35.8], 'TX': [-99.5, 31.5], 'UT': [-111.7, 39.3],
  'VT': [-72.6, 44.0], 'VA': [-78.8, 37.5], 'WA': [-120.5, 47.4],
  'WV': [-80.6, 38.9], 'WI': [-89.8, 44.6], 'WY': [-107.5, 43.0],
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
  categories: CSRCategory[];
}

type FilterOption = 'all' | CSRCategory;

export function CSRMap() {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const [isMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);

  // Get color for a state based on its categories
  const getStateColor = useCallback((stateId: string): string => {
    const categories = getCategoriesForState(stateId);

    if (activeFilter !== 'all') {
      if (!categories.includes(activeFilter)) {
        return CSR_COLORS.inactive;
      }
      return CSR_COLORS[activeFilter];
    }

    // Show primary category color (priority: controlled > nonControlled > tbd)
    if (categories.includes('controlled')) return CSR_COLORS.controlled;
    if (categories.includes('nonControlled')) return CSR_COLORS.nonControlled;
    if (categories.includes('tbd')) return CSR_COLORS.tbd;
    return CSR_COLORS.inactive;
  }, [activeFilter]);

  // Check if state should be highlighted
  const isStateHighlighted = useCallback((stateId: string): boolean => {
    const categories = getCategoriesForState(stateId);
    if (activeFilter === 'all') {
      return categories.length > 0;
    }
    return categories.includes(activeFilter);
  }, [activeFilter]);

  const handleMouseEnter = useCallback((event: React.MouseEvent<SVGPathElement>, stateId: string) => {
    const categories = getCategoriesForState(stateId);
    if (categories.length === 0) return;

    setTooltip({
      x: event.clientX,
      y: event.clientY,
      stateId,
      stateName: getStateName(stateId),
      categories,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGPathElement>) => {
    setTooltip(prev => prev ? { ...prev, x: event.clientX, y: event.clientY } : null);
  }, []);

  // Stats
  const stats = useMemo(() => ({
    controlled: CSR_DATA.controlled.length,
    nonControlled: CSR_DATA.nonControlled.length,
    tbd: CSR_DATA.tbd.length,
  }), []);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">
          CSR Licensing Map
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customer Service Representative licensing requirements by state
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-6 px-4">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            activeFilter === 'all'
              ? 'bg-fountain-dark text-white shadow-lg'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          All Categories
        </button>
        {(['controlled', 'nonControlled', 'tbd'] as CSRCategory[]).map(category => (
          <button
            key={category}
            onClick={() => setActiveFilter(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              activeFilter === category
                ? 'text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={{
              backgroundColor: activeFilter === category ? CSR_COLORS[category] : undefined,
            }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: CSR_COLORS[category] }}
            />
            {CSR_CATEGORY_INFO[category].name}
            <span className="text-xs opacity-75">({stats[category]})</span>
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 px-4">
        {(['controlled', 'nonControlled', 'tbd'] as CSRCategory[]).map(category => (
          <div key={category} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: CSR_COLORS[category] }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {CSR_CATEGORY_INFO[category].name}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: CSR_COLORS.inactive }}
          />
          <span className="text-sm text-gray-500">No CSR Requirements</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full max-w-5xl mx-auto px-2 sm:px-4">
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: isMobile ? 750 : 1000,
          }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) => (
              <>
                {geographies.map((geo) => {
                  const stateId = FIPS_TO_STATE[geo.id] || geo.id;
                  const fillColor = getStateColor(stateId);
                  const highlighted = isStateHighlighted(stateId);

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fillColor}
                      stroke="#ffffff"
                      strokeWidth={isMobile ? 1.25 : 0.75}
                      style={{
                        default: {
                          outline: 'none',
                          transition: 'fill 0.3s ease',
                        },
                        hover: {
                          fill: highlighted ? fillColor : '#9CA3AF',
                          outline: 'none',
                          cursor: highlighted ? 'pointer' : 'default',
                          filter: highlighted ? 'brightness(1.1)' : 'none',
                        },
                        pressed: {
                          outline: 'none',
                        },
                      }}
                      onMouseEnter={(e) => handleMouseEnter(e, stateId)}
                      onMouseLeave={handleMouseLeave}
                      onMouseMove={handleMouseMove}
                    />
                  );
                })}
              </>
            )}
          </Geographies>

          {/* State Labels */}
          {Object.entries(STATE_CENTERS).map(([stateId, coords]) => {
            if (SMALL_STATES[stateId]) return null;
            if (stateId === 'AK' || stateId === 'HI') return null;

            const highlighted = isStateHighlighted(stateId);

            return (
              <Marker key={stateId} coordinates={coords}>
                <text
                  textAnchor="middle"
                  style={{
                    fontFamily: 'Outfit, system-ui, sans-serif',
                    fontSize: stateId === 'DC' ? (isMobile ? 7 : 6) : (isMobile ? 11 : 10),
                    fontWeight: 600,
                    fill: highlighted ? '#1E293B' : '#6B7280',
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

          {/* Small state annotations */}
          {Object.entries(SMALL_STATES).map(([stateId, offset]) => {
            const coords = STATE_CENTERS[stateId];
            if (!coords) return null;

            const highlighted = isStateHighlighted(stateId);
            const color = getStateColor(stateId);

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
                    fontSize: isMobile ? 10 : 9,
                    fontWeight: 600,
                    fill: highlighted ? color : '#9CA3AF',
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

      {/* States List */}
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-bold text-fountain-dark dark:text-white">
              CSR Requirements by Category
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {/* Controlled States */}
            <div className="p-4 md:border-r border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CSR_COLORS.controlled }}
                />
                <span className="font-bold text-sm" style={{ color: CSR_COLORS.controlled }}>
                  Controlled ({stats.controlled})
                </span>
              </div>
              <div className="space-y-2">
                {CSR_DATA.controlled.map(({ stateId, providerType }) => (
                  <div
                    key={stateId}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {getStateName(stateId)}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{ backgroundColor: CSR_COLORS.controlled, color: 'white' }}
                    >
                      {providerType}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Controlled States */}
            <div className="p-4 md:border-r border-gray-100 dark:border-gray-700 bg-blue-50/30 dark:bg-blue-900/10">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CSR_COLORS.nonControlled }}
                />
                <span className="font-bold text-sm" style={{ color: CSR_COLORS.nonControlled }}>
                  Non-Controlled ({stats.nonControlled})
                </span>
              </div>
              <div className="space-y-2">
                {CSR_DATA.nonControlled.map(({ stateId, providerType }) => (
                  <div
                    key={stateId}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {getStateName(stateId)}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{ backgroundColor: CSR_COLORS.nonControlled, color: 'white' }}
                    >
                      {providerType}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* TBD States */}
            <div className="p-4 bg-amber-50/30 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CSR_COLORS.tbd }}
                />
                <span className="font-bold text-sm" style={{ color: CSR_COLORS.tbd }}>
                  States TBD ({stats.tbd})
                </span>
              </div>
              <div className="space-y-2">
                {CSR_DATA.tbd.map(stateId => (
                  <div
                    key={stateId}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20"
                  >
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {getStateName(stateId)}
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-1 rounded"
                      style={{ backgroundColor: CSR_COLORS.tbd, color: 'white' }}
                    >
                      TBD
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
          <div className="bg-fountain-dark text-white px-4 py-3 rounded-lg shadow-xl min-w-[200px]">
            <div className="font-semibold text-base mb-1">
              {tooltip.stateName}
            </div>
            <div className="text-xs text-gray-300 mb-2">
              ({tooltip.stateId})
            </div>

            {tooltip.categories.map(category => {
              const providerType = getProviderType(tooltip.stateId, category);
              return (
                <div
                  key={category}
                  className="flex items-center justify-between py-1"
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: CSR_COLORS[category] }}
                  >
                    {CSR_CATEGORY_INFO[category].name}
                  </span>
                  {providerType && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{ backgroundColor: CSR_COLORS[category], color: 'white' }}
                    >
                      {providerType}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
