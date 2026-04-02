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
  getLicenseRequirement,
  getStateNotes,
  ProviderTypeFilter,
  PROVIDER_TYPE_COLORS,
  matchesProviderTypeFilter,
  countStatesByProviderType,
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

type CategoryFilter = 'all' | CSRCategory;

export function CSRMap() {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [providerTypeFilter, setProviderTypeFilter] = useState<ProviderTypeFilter>('all');
  const [isMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);

  // Zoom state
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Zoom handlers
  const handleZoomIn = useCallback(() => {
    setMapZoom(prev => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setMapZoom(prev => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) setMapPosition({ x: 0, y: 0 });
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setMapZoom(1);
    setMapPosition({ x: 0, y: 0 });
  }, []);

  // Drag handlers for panning
  const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (mapZoom <= 1) return;
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStart({ x: clientX - mapPosition.x, y: clientY - mapPosition.y });
  }, [mapZoom, mapPosition]);

  const handleDragMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setMapPosition({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Check if state matches current filters
  const stateMatchesFilters = useCallback((stateId: string): boolean => {
    const categories = getCategoriesForState(stateId);
    if (categories.length === 0) return false;

    // Check category filter
    if (categoryFilter !== 'all' && !categories.includes(categoryFilter)) {
      return false;
    }

    // Check provider type filter
    if (providerTypeFilter !== 'all') {
      let hasMatchingProvider = false;
      for (const category of categories) {
        if (category === 'tbd') continue;
        const providerType = getProviderType(stateId, category);
        if (providerType && matchesProviderTypeFilter(providerType, providerTypeFilter)) {
          hasMatchingProvider = true;
          break;
        }
      }
      if (!hasMatchingProvider) return false;
    }

    return true;
  }, [categoryFilter, providerTypeFilter]);

  // Get color for a state based on its categories and filters
  const getStateColor = useCallback((stateId: string): string => {
    if (!stateMatchesFilters(stateId)) {
      return CSR_COLORS.inactive;
    }

    const categories = getCategoriesForState(stateId);

    // If filtering by provider type, use provider type color
    if (providerTypeFilter !== 'all') {
      return PROVIDER_TYPE_COLORS[providerTypeFilter];
    }

    // Show primary category color (priority: controlled > nonControlled > tbd > active)
    if (categories.includes('controlled')) return CSR_COLORS.controlled;
    if (categories.includes('nonControlled')) return CSR_COLORS.nonControlled;
    if (categories.includes('tbd')) return CSR_COLORS.tbd;
    if (categories.includes('active')) return CSR_COLORS.active;
    return CSR_COLORS.inactive;
  }, [stateMatchesFilters, providerTypeFilter]);

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
    active: CSR_DATA.active.length,
    ...countStatesByProviderType(),
  }), []);

  // Download CSV
  const downloadCSV = useCallback(() => {
    const rows: string[] = ['State,State Name,CSR Required,Credential Type,License Requirement,Notes'];

    CSR_DATA.controlled.forEach(({ stateId, providerType, licenseRequirement, notes }) => {
      rows.push(`${stateId},${getStateName(stateId)},Yes,${providerType},${licenseRequirement},${notes || ''}`);
    });

    CSR_DATA.nonControlled.forEach(({ stateId, providerType, licenseRequirement, notes }) => {
      rows.push(`${stateId},${getStateName(stateId)},No,${providerType},${licenseRequirement},${notes || ''}`);
    });

    CSR_DATA.tbd.forEach(({ stateId, licenseRequirement }) => {
      rows.push(`${stateId},${getStateName(stateId)},TBD,,${licenseRequirement},`);
    });

    CSR_DATA.active.forEach(({ stateId, licenseRequirement, notes }) => {
      rows.push(`${stateId},${getStateName(stateId)},Active,,${licenseRequirement},${notes || ''}`);
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CSR_Licensing_Requirements.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

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

      {/* Category Filter Buttons */}
      <div className="mb-4">
        <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Filter by Category
        </div>
        <div className="flex flex-wrap justify-center gap-2 px-4">
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              categoryFilter === 'all'
                ? 'bg-fountain-dark text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Categories
          </button>
          {(['controlled', 'nonControlled', 'tbd', 'active'] as CSRCategory[]).map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                categoryFilter === category
                  ? 'text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              style={{
                backgroundColor: categoryFilter === category ? CSR_COLORS[category] : undefined,
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
      </div>

      {/* Provider Type Filter Buttons */}
      <div className="mb-6">
        <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Filter by Provider Type
        </div>
        <div className="flex flex-wrap justify-center gap-2 px-4">
          <button
            onClick={() => setProviderTypeFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              providerTypeFilter === 'all'
                ? 'bg-fountain-dark text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Providers
          </button>
          <button
            onClick={() => setProviderTypeFilter('md')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              providerTypeFilter === 'md'
                ? 'text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={{
              backgroundColor: providerTypeFilter === 'md' ? PROVIDER_TYPE_COLORS.md : undefined,
            }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: PROVIDER_TYPE_COLORS.md }}
            />
            MD States
            <span className="text-xs opacity-75">({stats.md})</span>
          </button>
          <button
            onClick={() => setProviderTypeFilter('np')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              providerTypeFilter === 'np'
                ? 'text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            style={{
              backgroundColor: providerTypeFilter === 'np' ? PROVIDER_TYPE_COLORS.np : undefined,
            }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: PROVIDER_TYPE_COLORS.np }}
            />
            NP States
            <span className="text-xs opacity-75">({stats.np})</span>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 px-4">
        {providerTypeFilter === 'all' ? (
          <>
            {(['controlled', 'nonControlled', 'tbd', 'active'] as CSRCategory[]).map(category => (
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
          </>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: PROVIDER_TYPE_COLORS[providerTypeFilter] }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {providerTypeFilter === 'md' ? 'MD Required' : 'NP Required'}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded"
            style={{ backgroundColor: CSR_COLORS.inactive }}
          />
          <span className="text-sm text-gray-500">No Requirements / Filtered Out</span>
        </div>
      </div>

      {/* Map */}
      <div className="relative w-full max-w-5xl mx-auto px-2 sm:px-4">
        {/* Zoom Controls */}
        <div className="absolute top-2 right-2 sm:right-6 z-30 flex flex-col gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom in"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
          <div className="border-t border-gray-200 dark:border-gray-700" />
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Zoom out"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          {mapZoom > 1 && (
            <>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Reset zoom"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Zoom indicator */}
        {mapZoom > 1 && (
          <div className="absolute top-2 left-2 sm:left-6 z-30 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
            {Math.round(mapZoom * 100)}%
          </div>
        )}

        {/* Map with zoom/pan */}
        <div
          className="overflow-hidden rounded-xl"
          style={{ cursor: mapZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <div
            style={{
              transform: `scale(${mapZoom}) translate(${mapPosition.x / mapZoom}px, ${mapPosition.y / mapZoom}px)`,
              transformOrigin: 'center center',
              transition: isDragging ? 'none' : 'transform 0.3s ease',
            }}
          >
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
                      const highlighted = stateMatchesFilters(stateId);

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

                const highlighted = stateMatchesFilters(stateId);

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

                const highlighted = stateMatchesFilters(stateId);
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
        </div>
      </div>

      {/* Download CSV Button */}
      <div className="flex justify-center mt-6 px-4">
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSR Data (CSV)
        </button>
      </div>

      {/* States List */}
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <h3 className="text-lg font-bold text-fountain-dark dark:text-white">
              CSR Requirements by Category
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0">
            {/* Controlled States (CSR Required) - GREEN */}
            <div className="p-4 md:border-r border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CSR_COLORS.controlled }}
                />
                <span className="font-bold text-sm" style={{ color: CSR_COLORS.controlled }}>
                  CSR Required ({stats.controlled})
                </span>
              </div>
              <div className="space-y-2">
                {CSR_DATA.controlled.map(({ stateId, providerType, licenseRequirement, notes }) => (
                  <div
                    key={`${stateId}-controlled`}
                    className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {getStateName(stateId)}
                        {notes && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({notes})</span>}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded"
                        style={{ backgroundColor: CSR_COLORS.controlled, color: 'white' }}
                      >
                        {providerType}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {licenseRequirement}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Non-Controlled States (No CSR Needed) - GRAY */}
            <div className="p-4 md:border-r border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-800/30">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CSR_COLORS.nonControlled }}
                />
                <span className="font-bold text-sm" style={{ color: '#6B7280' }}>
                  No CSR Needed ({stats.nonControlled})
                </span>
              </div>
              <div className="space-y-2">
                {CSR_DATA.nonControlled.map(({ stateId, providerType, licenseRequirement, notes }) => (
                  <div
                    key={`${stateId}-nonControlled`}
                    className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {getStateName(stateId)}
                        {notes && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({notes})</span>}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded bg-gray-500 text-white"
                      >
                        {providerType}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {licenseRequirement}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* TBD States - YELLOW */}
            <div className="p-4 md:border-r border-gray-100 dark:border-gray-700 bg-amber-50/30 dark:bg-amber-900/10">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CSR_COLORS.tbd }}
                />
                <span className="font-bold text-sm" style={{ color: CSR_COLORS.tbd }}>
                  TBD ({stats.tbd})
                </span>
              </div>
              <div className="space-y-2">
                {CSR_DATA.tbd.map(({ stateId, licenseRequirement }) => (
                  <div
                    key={stateId}
                    className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20"
                  >
                    <div className="flex items-center justify-between">
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
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {licenseRequirement}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active States - WHITE */}
            <div className="p-4 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span
                  className="w-3 h-3 rounded-full border border-gray-300"
                  style={{ backgroundColor: CSR_COLORS.active }}
                />
                <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                  Active ({stats.active})
                </span>
              </div>
              <div className="space-y-2">
                {CSR_DATA.active.map(({ stateId, licenseRequirement, notes }) => (
                  <div
                    key={stateId}
                    className="px-3 py-2 rounded-lg bg-white dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {getStateName(stateId)}
                        {notes && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({notes})</span>}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {licenseRequirement}
                    </div>
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
              const notes = getStateNotes(tooltip.stateId, category);
              const licenseReq = getLicenseRequirement(tooltip.stateId);
              return (
                <div key={category} className="py-1">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-medium"
                      style={{ color: CSR_COLORS[category] }}
                    >
                      {CSR_CATEGORY_INFO[category].name}
                      {notes && <span className="text-xs opacity-75"> ({notes})</span>}
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
                  {licenseReq && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {licenseReq}
                    </div>
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
