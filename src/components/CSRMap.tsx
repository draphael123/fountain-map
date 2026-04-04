import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
} from 'react-simple-maps';
import { getStateName, US_STATES } from '../data/serviceAvailability';
import { GEO_URL, FIPS_TO_STATE, STATE_CENTERS, SMALL_STATES } from '../data/usMapGeo';
import { DATA_LAST_UPDATED, CSR_DATA_REVIEW_NOTE } from '../data/dataMeta';
import {
  CSRCategory,
  CSR_DATA,
  CSR_DEA_SOURCE_URL,
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

function useNarrowViewport(maxWidth = 639): boolean {
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= maxWidth : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxWidth}px)`);
    const update = () => setNarrow(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [maxWidth]);
  return narrow;
}

interface TooltipInfo {
  x: number;
  y: number;
  stateId: string;
  stateName: string;
  categories: CSRCategory[];
}

type CategoryFilter = 'all' | CSRCategory;

function readInitialCsrFilters(): { category: CategoryFilter; provider: ProviderTypeFilter } {
  if (typeof window === 'undefined') return { category: 'all', provider: 'all' };
  const params = new URLSearchParams(window.location.search);
  const cat = params.get('csrCategory');
  const pt = params.get('csrProvider');
  const validCats: CategoryFilter[] = ['all', 'controlled', 'nonControlled', 'tbd', 'active'];
  const validPts: ProviderTypeFilter[] = ['all', 'md', 'np'];
  return {
    category: validCats.includes(cat as CategoryFilter) ? (cat as CategoryFilter) : 'all',
    provider: validPts.includes(pt as ProviderTypeFilter) ? (pt as ProviderTypeFilter) : 'all',
  };
}

export function CSRMap() {
  const initialFilters = readInitialCsrFilters();
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(initialFilters.category);
  const [providerTypeFilter, setProviderTypeFilter] = useState<ProviderTypeFilter>(initialFilters.provider);
  const [highlightedStateId, setHighlightedStateId] = useState<string | null>(null);
  const isMobile = useNarrowViewport(639);

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

  const csrFilteredStateCount = useMemo(
    () => US_STATES.filter((s) => stateMatchesFilters(s.id)).length,
    [stateMatchesFilters]
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    if (categoryFilter === 'all') url.searchParams.delete('csrCategory');
    else url.searchParams.set('csrCategory', categoryFilter);
    if (providerTypeFilter === 'all') url.searchParams.delete('csrProvider');
    else url.searchParams.set('csrProvider', providerTypeFilter);
    window.history.replaceState({}, '', url.toString());
  }, [categoryFilter, providerTypeFilter]);

  const scrollToMap = useCallback(() => {
    document.getElementById('csr-map')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  const focusStateFromList = useCallback(
    (stateId: string) => {
      setHighlightedStateId(stateId);
      scrollToMap();
    },
    [scrollToMap]
  );

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

  const downloadJSON = useCallback(() => {
    const payload = {
      exportedAt: new Date().toISOString(),
      dataLastUpdated: DATA_LAST_UPDATED,
      sourceUrl: CSR_DEA_SOURCE_URL,
      controlled: CSR_DATA.controlled,
      nonControlled: CSR_DATA.nonControlled,
      tbd: CSR_DATA.tbd,
      active: CSR_DATA.active,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'CSR_Licensing_Requirements.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="w-full licensing-csr-print">
      <a href="#csr-map" className="sr-only">
        Skip to CSR map
      </a>

      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">
          CSR Licensing Map
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Customer Service Representative (DEA CSR registration) requirements by state
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-3 max-w-2xl mx-auto">{CSR_DATA_REVIEW_NOTE}</p>
      </div>

      {/* Glossary */}
      <details className="max-w-3xl mx-auto mb-6 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50/80 dark:bg-gray-800/50 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        <summary className="cursor-pointer font-semibold text-fountain-dark dark:text-white list-none flex items-center justify-between gap-2">
          <span>What do the categories mean?</span>
          <span className="text-gray-400 text-xs" aria-hidden>
            ▼
          </span>
        </summary>
        <ul className="mt-3 space-y-2 list-disc pl-5 text-left">
          <li>
            <strong className="text-fountain-dark dark:text-white">CSR Required (controlled)</strong> — State expects a
            Customer Service Representative registration aligned with controlled-substance prescribing in that state.
          </li>
          <li>
            <strong className="text-fountain-dark dark:text-white">No CSR needed (non-controlled)</strong> — Under the
            modeled rule set, CSR is not required for the listed credential in that state.
          </li>
          <li>
            <strong className="text-fountain-dark dark:text-white">TBD</strong> — Requirement not finalized; treat as a
            research backlog item.
          </li>
          <li>
            <strong className="text-fountain-dark dark:text-white">Active</strong> — Operational / active handling per
            internal notes (see table).
          </li>
        </ul>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          Primary reference:{' '}
          <a
            href={CSR_DEA_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 dark:text-teal-400 underline font-medium"
          >
            DEA — State practitioner licensing requirements
          </a>
          .
        </p>
      </details>

      {/* Category Filter Buttons */}
      <div className="mb-4">
        <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Filter by Category
        </div>
        <div className="flex flex-wrap justify-center gap-2 px-4">
          <button
            type="button"
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
              type="button"
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
        <div className="flex justify-center mt-3">
          <button
            type="button"
            onClick={() => {
              setCategoryFilter('tbd');
              setProviderTypeFilter('all');
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
              categoryFilter === 'tbd' && providerTypeFilter === 'all'
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100'
                : 'border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-50/80 dark:hover:bg-amber-900/20'
            }`}
          >
            TBD backlog only ({stats.tbd} states)
          </button>
        </div>
      </div>

      {/* Provider Type Filter Buttons */}
      <div className="mb-6">
        <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
          Filter by Provider Type
        </div>
        <div className="flex flex-wrap justify-center gap-2 px-4">
          <button
            type="button"
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
            type="button"
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
            type="button"
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

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4 px-4">
        <strong className="text-fountain-dark dark:text-gray-200">{csrFilteredStateCount}</strong> states match current
        filters ({US_STATES.length} jurisdictions on the map, including D.C.)
      </p>

      {/* Map */}
      <div id="csr-map" className="relative w-full max-w-5xl mx-auto px-2 sm:px-4">
        {/* Zoom Controls */}
        <div className="print-hide absolute top-2 right-2 sm:right-6 z-30 flex flex-col gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            type="button"
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
            type="button"
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
                type="button"
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
          <div className="print-hide absolute top-2 left-2 sm:left-6 z-30 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
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
          role="region"
          aria-label="CSR licensing map by state"
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
                          stroke={highlightedStateId === stateId ? '#f59e0b' : '#ffffff'}
                          strokeWidth={
                            highlightedStateId === stateId ? 2.5 : isMobile ? 1.25 : 0.75
                          }
                          style={{
                            default: {
                              outline: 'none',
                              transition: 'fill 0.3s ease, stroke 0.2s ease',
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
                          onClick={() => {
                            if (highlighted) setHighlightedStateId(stateId);
                          }}
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

      {/* Download */}
      <div className="flex flex-wrap justify-center gap-3 mt-6 px-4">
        <button
          type="button"
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSR Data (CSV)
        </button>
        <button
          type="button"
          onClick={downloadJSON}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSR Data (JSON)
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
                  <button
                    type="button"
                    key={`${stateId}-controlled`}
                    onClick={() => focusStateFromList(stateId)}
                    className={`w-full text-left px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fountain-trt dark:focus-visible:ring-offset-gray-900 ${
                      highlightedStateId === stateId ? 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-gray-900' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {getStateName(stateId)}
                        {notes && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({notes})</span>}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded shrink-0"
                        style={{ backgroundColor: CSR_COLORS.controlled, color: 'white' }}
                      >
                        {providerType}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {licenseRequirement}
                    </div>
                  </button>
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
                  <button
                    type="button"
                    key={`${stateId}-nonControlled`}
                    onClick={() => focusStateFromList(stateId)}
                    className={`w-full text-left px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700/30 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fountain-trt dark:focus-visible:ring-offset-gray-900 ${
                      highlightedStateId === stateId ? 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-gray-900' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {getStateName(stateId)}
                        {notes && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({notes})</span>}
                      </span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-gray-500 text-white shrink-0">
                        {providerType}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {licenseRequirement}
                    </div>
                  </button>
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
                  <button
                    type="button"
                    key={stateId}
                    onClick={() => focusStateFromList(stateId)}
                    className={`w-full text-left px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fountain-trt dark:focus-visible:ring-offset-gray-900 ${
                      highlightedStateId === stateId ? 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-gray-900' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {getStateName(stateId)}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-1 rounded shrink-0"
                        style={{ backgroundColor: CSR_COLORS.tbd, color: 'white' }}
                      >
                        TBD
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {licenseRequirement}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active States - LIGHT BLUE */}
            <div className="p-4 bg-blue-50/30 dark:bg-blue-900/10">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: CSR_COLORS.active }}
                />
                <span className="font-bold text-sm" style={{ color: CSR_COLORS.active }}>
                  Active ({stats.active})
                </span>
              </div>
              <div className="space-y-2">
                {CSR_DATA.active.map(({ stateId, licenseRequirement, notes }) => (
                  <button
                    type="button"
                    key={stateId}
                    onClick={() => focusStateFromList(stateId)}
                    className={`w-full text-left px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fountain-trt dark:focus-visible:ring-offset-gray-900 ${
                      highlightedStateId === stateId ? 'ring-2 ring-amber-400 ring-offset-1 dark:ring-offset-gray-900' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {getStateName(stateId)}
                        {notes && <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">({notes})</span>}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {licenseRequirement}
                    </div>
                  </button>
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
