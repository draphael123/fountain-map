import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
  GeographyObject,
} from 'react-simple-maps';
import {
  loadProviderLicensingData,
  stateHasSelectedProviders,
  getProviderValueInState,
  type ProviderLicensingData,
  type ProviderLicensingRow,
} from '../data/providerAuthority';
import { US_STATES, SERVICE_INFO } from '../data/serviceAvailability';
import type { ServiceType } from '../data/serviceAvailability';
import { GEO_URL, FIPS_TO_STATE, STATE_CENTERS, SMALL_STATES } from '../data/usMapGeo';

const ACTIVE_COLOR = '#0D9488';
const INACTIVE_COLOR = '#D1D5DB';

const SERVICE_TYPES: ServiceType[] = ['TRT', 'HRT', 'GLP', 'Async'];

interface TooltipState {
  x: number;
  y: number;
  stateId: string;
  stateName: string;
  row: ProviderLicensingRow | undefined;
}

interface ProviderAuthorityMapProps {
  /** When false, hides the large title (e.g. when embedded under Licensing). */
  showTitle?: boolean;
}

export function ProviderAuthorityMap({ showTitle = true }: ProviderAuthorityMapProps) {
  const [data, setData] = useState<ProviderLicensingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string[]>([]);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<ServiceType | ''>('');
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const [providerSearch, setProviderSearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');

  useEffect(() => {
    loadProviderLicensingData()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const rowByStateId = useMemo(() => {
    if (!data) return new Map<string, ProviderLicensingRow>();
    const m = new Map<string, ProviderLicensingRow>();
    data.rows.forEach((row) => m.set(row.stateId, row));
    return m;
  }, [data]);

  const filteredProviders = useMemo(() => {
    if (!data) return [];
    let list = data.providers;
    if (selectedServiceFilter) {
      const forService = data.providersByService[selectedServiceFilter] ?? [];
      list = forService.length > 0 ? forService : list;
    }
    const q = providerSearch.toLowerCase();
    return q ? list.filter((p) => p.toLowerCase().includes(q)) : list;
  }, [data, providerSearch, selectedServiceFilter]);

  const stateFilterOptions = useMemo(() => {
    return US_STATES.filter((s) => {
      const row = rowByStateId.get(s.id);
      if (!row) return false;
      if (selectedProviders.length === 0) return true;
      return stateHasSelectedProviders(row, selectedProviders);
    });
  }, [rowByStateId, selectedProviders]);

  const filteredStateFilterOptions = useMemo(() => {
    const q = stateSearch.toLowerCase();
    return q
      ? stateFilterOptions.filter(
          (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
        )
      : stateFilterOptions;
  }, [stateFilterOptions, stateSearch]);

  const toggleProvider = useCallback((name: string) => {
    setSelectedProviders((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
    );
  }, []);

  const toggleStateFilter = useCallback((stateId: string) => {
    setSelectedStateFilter((prev) =>
      prev.includes(stateId) ? prev.filter((s) => s !== stateId) : [...prev, stateId]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSelectedProviders([]);
    setSelectedStateFilter([]);
    setSelectedServiceFilter('');
    setProviderSearch('');
    setStateSearch('');
  }, []);

  const providerCoverageSummary = useMemo(() => {
    if (!data || selectedProviders.length === 0) return null;
    const statesWithAny = new Set<string>();
    const byService: Record<string, Set<string>> = { TRT: new Set(), HRT: new Set(), GLP: new Set() };

    data.rows.forEach((row) => {
      selectedProviders.forEach((p) => {
        const val = row.providers[p];
        if (!val) return;
        statesWithAny.add(row.stateId);
        const services = data.providerToServices[p] ?? [];
        services.forEach((s) => byService[s]?.add(row.stateId));
      });
    });

    return {
      totalStates: statesWithAny.size,
      byService: Object.fromEntries(Object.entries(byService).map(([s, set]) => [s, set.size])) as Record<string, number>,
    };
  }, [data, selectedProviders]);

  const handleMouseEnter = useCallback(
    (geo: GeographyObject) => (e: React.MouseEvent<SVGPathElement>) => {
      const stateId = FIPS_TO_STATE[geo.id] || geo.id;
      const stateName = US_STATES.find((s) => s.id === stateId)?.name ?? stateId;
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        stateId,
        stateName,
        row: rowByStateId.get(stateId),
      });
    },
    [rowByStateId]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGPathElement>) => {
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading provider data…</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center text-red-700 dark:text-red-300">
        {error ?? 'Provider licensing data not available.'}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {showTitle && (
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">
            Provider Authority Map
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
            Filter by providers and states to see where providers are licensed
          </p>
        </div>
      )}

      {/* Service filter */}
      <div className="max-w-5xl mx-auto mb-4 px-4 sm:px-6 no-print">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Filter by service (optional)
        </label>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSelectedServiceFilter('')}
            className={`px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 ${
              selectedServiceFilter === ''
                ? 'bg-fountain-dark dark:bg-gray-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All providers
          </button>
          {SERVICE_TYPES.map((svc) => (
            <button
              key={svc}
              type="button"
              onClick={() => setSelectedServiceFilter(svc)}
              className={`px-4 py-2.5 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-h-[44px] sm:min-h-0 ${
                selectedServiceFilter === svc
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={selectedServiceFilter === svc ? { backgroundColor: SERVICE_INFO[svc].color } : undefined}
            >
              <span className="w-2 h-2 rounded-full bg-white/80" />
              {svc}
              {data?.providersByService[svc]?.length != null && (
                <span className="text-xs opacity-90">({data.providersByService[svc].length})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-6 px-4 sm:px-6 space-y-4 no-print">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Providers
            </label>
            <input
              type="text"
              placeholder="Search providers..."
              value={providerSearch}
              onChange={(e) => setProviderSearch(e.target.value)}
              className="w-full mb-2 px-3 py-3 sm:py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-fountain-dark dark:text-white text-sm min-h-[44px] sm:min-h-0"
            />
            <div className="max-h-40 overflow-y-auto space-y-0.5 sm:space-y-1">
              {filteredProviders.slice(0, 50).map((name) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer text-sm py-2 sm:py-0.5 min-h-[44px] sm:min-h-0 -mx-1 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 touch-manipulation">
                  <input
                    type="checkbox"
                    checked={selectedProviders.includes(name)}
                    onChange={() => toggleProvider(name)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700 dark:text-gray-300 truncate">{name}</span>
                </label>
              ))}
              {filteredProviders.length > 50 && (
                <p className="text-xs text-gray-500 mt-1">+ {filteredProviders.length - 50} more (narrow search)</p>
              )}
            </div>
            {selectedProviders.length > 0 && (
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">{selectedProviders.length} selected</p>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              States (optional – limit map to these)
            </label>
            <input
              type="text"
              placeholder="Search states..."
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              className="w-full mb-2 px-3 py-3 sm:py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-fountain-dark dark:text-white text-sm min-h-[44px] sm:min-h-0"
            />
            <div className="max-h-40 overflow-y-auto space-y-0.5 sm:space-y-1">
              {filteredStateFilterOptions.slice(0, 30).map((s) => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm py-2 sm:py-0.5 min-h-[44px] sm:min-h-0 -mx-1 px-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 touch-manipulation">
                  <input
                    type="checkbox"
                    checked={selectedStateFilter.includes(s.id)}
                    onChange={() => toggleStateFilter(s.id)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-gray-700 dark:text-gray-300">{s.name} ({s.id})</span>
                </label>
              ))}
              {filteredStateFilterOptions.length > 30 && (
                <p className="text-xs text-gray-500 mt-1">+ {filteredStateFilterOptions.length - 30} more</p>
              )}
            </div>
            {selectedStateFilter.length > 0 && (
              <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">{selectedStateFilter.length} states selected</p>
            )}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={clearFilters}
            className="px-5 py-3 sm:px-4 sm:py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 min-h-[44px] sm:min-h-0 touch-manipulation"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Provider coverage summary */}
      {providerCoverageSummary && selectedProviders.length > 0 && (
        <div className="max-w-5xl mx-auto mb-6 px-4 no-print">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
            <h4 className="font-semibold text-fountain-dark dark:text-white mb-3">Provider coverage summary</h4>
            <div className="flex flex-wrap gap-4 sm:gap-6">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total states</span>
                <p className="text-lg font-bold text-fountain-dark dark:text-white">{providerCoverageSummary.totalStates}</p>
              </div>
              {SERVICE_TYPES.map((svc) => (
                <div key={svc}>
                  <span className="text-sm" style={{ color: SERVICE_INFO[svc].color }}>{svc}</span>
                  <p className="text-lg font-bold" style={{ color: SERVICE_INFO[svc].color }}>
                    {providerCoverageSummary.byService[svc] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        <div className="overflow-hidden rounded-xl">
          <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 1000 }}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateId = FIPS_TO_STATE[geo.id] || geo.id;
                  const row = rowByStateId.get(stateId);
                  const hasProvider = stateHasSelectedProviders(row, selectedProviders);
                  const stateInFilter = selectedStateFilter.length === 0 || selectedStateFilter.includes(stateId);
                  const showActive = selectedProviders.length > 0 && hasProvider && stateInFilter;
                  const dimmed = selectedStateFilter.length > 0 && !stateInFilter;

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={showActive ? ACTIVE_COLOR : INACTIVE_COLOR}
                      stroke="#ffffff"
                      strokeWidth={0.75}
                      style={{
                        default: {
                          outline: 'none',
                          opacity: dimmed ? 0.35 : 1,
                          transition: 'fill 0.2s ease, opacity 0.2s ease',
                        },
                        hover: {
                          outline: 'none',
                          cursor: 'pointer',
                          filter: 'brightness(1.08)',
                        },
                      }}
                      onMouseEnter={handleMouseEnter(geo)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleMouseLeave}
                    />
                  );
                })
              }
            </Geographies>

            {Object.entries(STATE_CENTERS).map(([stateId, coords]) => {
              if (SMALL_STATES[stateId]) return null;
              const row = rowByStateId.get(stateId);
              const hasProvider = stateHasSelectedProviders(row, selectedProviders);
              const stateInFilter = selectedStateFilter.length === 0 || selectedStateFilter.includes(stateId);
              const showActive = selectedProviders.length > 0 && hasProvider && stateInFilter;

              return (
                <Marker key={stateId} coordinates={coords}>
                  <text
                    textAnchor="middle"
                    style={{
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: stateId === 'DC' ? 6 : (stateId === 'AK' || stateId === 'HI' ? 8 : 10),
                      fontWeight: 600,
                      fill: showActive ? '#1E293B' : '#6B7280',
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

            {Object.entries(SMALL_STATES).map(([stateId, offset]) => {
              const coords = STATE_CENTERS[stateId];
              if (!coords) return null;
              const row = rowByStateId.get(stateId);
              const hasProvider = stateHasSelectedProviders(row, selectedProviders);
              const stateInFilter = selectedStateFilter.length === 0 || selectedStateFilter.includes(stateId);
              const showActive = selectedProviders.length > 0 && hasProvider && stateInFilter;

              return (
                <Annotation
                  key={stateId}
                  subject={coords}
                  dx={offset.dx}
                  dy={offset.dy}
                  connectorProps={{ stroke: '#94A3B8', strokeWidth: 1, strokeLinecap: 'round' }}
                >
                  <text
                    textAnchor="start"
                    style={{
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: 9,
                      fontWeight: 600,
                      fill: showActive ? ACTIVE_COLOR : '#9CA3AF',
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

      <div className="flex justify-center gap-6 mt-4 sm:mt-6 flex-wrap px-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: ACTIVE_COLOR }} />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {selectedProviders.length > 0 ? 'Selected provider(s) licensed' : 'Select providers to see coverage'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: INACTIVE_COLOR }} />
          <span className="text-sm text-gray-700 dark:text-gray-300">No selected provider / not in filter</span>
        </div>
      </div>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}
        >
          <div className="bg-fountain-dark text-white px-4 py-3 rounded-lg shadow-xl min-w-[200px] max-w-[320px]">
            <div className="font-semibold text-base mb-1">{tooltip.stateName}</div>
            <div className="text-xs text-gray-300 mb-2">({tooltip.stateId})</div>
            {tooltip.row ? (
              <div className="text-xs space-y-1 max-h-48 overflow-y-auto">
                {selectedProviders.length > 0
                  ? selectedProviders.map((p) => {
                      const val = getProviderValueInState(tooltip.row, p);
                      return (
                        <div key={p} className="flex justify-between gap-2">
                          <span className="text-gray-400 truncate">{p}:</span>
                          <span className={val ? 'text-green-300' : 'text-gray-500'}>{val || '—'}</span>
                        </div>
                      );
                    })
                  : Object.entries(tooltip.row.providers).slice(0, 8).map(([p, val]) => (
                      <div key={p} className="flex justify-between gap-2">
                        <span className="text-gray-400 truncate">{p}:</span>
                        <span className="text-gray-200 truncate">{val}</span>
                      </div>
                    ))}
                {tooltip.row && Object.keys(tooltip.row.providers).length > 8 && selectedProviders.length === 0 && (
                  <div className="text-gray-500">+ more providers…</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-400">No data for this state</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
