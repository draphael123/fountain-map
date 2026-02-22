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
import { US_STATES } from '../data/serviceAvailability';

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
  'AL': [-86.9, 32.8], 'AK': [-153.5, 64.2], 'AZ': [-111.7, 34.2], 'AR': [-92.4, 34.9],
  'CA': [-119.5, 37.2], 'CO': [-105.5, 39.0], 'CT': [-72.7, 41.6], 'DE': [-75.5, 39.0],
  'DC': [-77.0, 38.9], 'FL': [-81.7, 28.1], 'GA': [-83.4, 32.6], 'HI': [-157.5, 20.8],
  'ID': [-114.5, 44.4], 'IL': [-89.2, 40.0], 'IN': [-86.2, 39.9], 'IA': [-93.5, 42.0],
  'KS': [-98.4, 38.5], 'KY': [-85.3, 37.8], 'LA': [-91.9, 31.0], 'ME': [-69.0, 45.4],
  'MD': [-76.6, 39.0], 'MA': [-71.8, 42.2], 'MI': [-84.7, 43.3], 'MN': [-94.3, 46.3],
  'MS': [-89.7, 32.7], 'MO': [-92.5, 38.4], 'MT': [-109.6, 47.0], 'NE': [-99.8, 41.5],
  'NV': [-117.0, 39.5], 'NH': [-71.5, 43.7], 'NJ': [-74.4, 40.1], 'NM': [-106.0, 34.5],
  'NY': [-75.5, 43.0], 'NC': [-79.4, 35.5], 'ND': [-100.5, 47.4], 'OH': [-82.8, 40.2],
  'OK': [-97.5, 35.5], 'OR': [-120.5, 44.0], 'PA': [-77.6, 40.9], 'RI': [-71.5, 41.7],
  'SC': [-80.9, 33.9], 'SD': [-100.2, 44.4], 'TN': [-86.3, 35.8], 'TX': [-99.5, 31.5],
  'UT': [-111.7, 39.3], 'VT': [-72.6, 44.0], 'VA': [-78.8, 37.5], 'WA': [-120.5, 47.4],
  'WV': [-80.6, 38.9], 'WI': [-89.8, 44.6], 'WY': [-107.5, 43.0],
};

const SMALL_STATES: Record<string, { dx: number; dy: number }> = {
  'VT': { dx: 45, dy: -10 }, 'NH': { dx: 40, dy: 5 }, 'MA': { dx: 50, dy: 0 },
  'RI': { dx: 40, dy: 5 }, 'CT': { dx: 40, dy: 10 }, 'NJ': { dx: 35, dy: 5 },
  'DE': { dx: 40, dy: 0 }, 'MD': { dx: 50, dy: 15 }, 'DC': { dx: 45, dy: 25 },
};

const ACTIVE_COLOR = '#0D9488';
const INACTIVE_COLOR = '#D1D5DB';

interface TooltipState {
  x: number;
  y: number;
  stateId: string;
  stateName: string;
  row: ProviderLicensingRow | undefined;
}

export function ProviderAuthorityMap() {
  const [data, setData] = useState<ProviderLicensingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [selectedStateFilter, setSelectedStateFilter] = useState<string[]>([]);
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
    const q = providerSearch.toLowerCase();
    return q ? data.providers.filter((p) => p.toLowerCase().includes(q)) : data.providers;
  }, [data, providerSearch]);

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
    setProviderSearch('');
    setStateSearch('');
  }, []);

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
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">
          Provider Authority Map
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Filter by providers and states to see where providers are licensed
        </p>
      </div>

      <div className="max-w-5xl mx-auto mb-6 px-4 space-y-4 no-print">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Providers
            </label>
            <input
              type="text"
              placeholder="Search providers..."
              value={providerSearch}
              onChange={(e) => setProviderSearch(e.target.value)}
              className="w-full mb-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-fountain-dark dark:text-white text-sm"
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredProviders.slice(0, 50).map((name) => (
                <label key={name} className="flex items-center gap-2 cursor-pointer text-sm">
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

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              States (optional – limit map to these)
            </label>
            <input
              type="text"
              placeholder="Search states..."
              value={stateSearch}
              onChange={(e) => setStateSearch(e.target.value)}
              className="w-full mb-2 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-fountain-dark dark:text-white text-sm"
            />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredStateFilterOptions.slice(0, 30).map((s) => (
                <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm">
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
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Clear filters
          </button>
        </div>
      </div>

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
