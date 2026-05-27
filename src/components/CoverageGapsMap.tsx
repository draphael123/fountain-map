import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  GeographyObject,
} from 'react-simple-maps';
import { useTheme } from '../context/ThemeContext';
import { loadProviderLicensingData, ProviderLicensingData } from '../data/providerAuthority';
import {
  analyzeGaps,
  StateGap,
  GapSeverity,
  getSeverityColor,
  getGapStats,
  GAP_SEVERITY_COLORS,
} from '../data/gapAnalysis';

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

interface TooltipInfo {
  x: number;
  y: number;
  gap: StateGap;
}

type ViewMode = 'map' | 'list';
type SeverityFilter = 'all' | GapSeverity;

interface CoverageGapsMapProps {
  onCheckState?: (stateId: string) => void;
}

export function CoverageGapsMap({ onCheckState }: CoverageGapsMapProps) {
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 640);
  const [providerData, setProviderData] = useState<ProviderLicensingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [expandedState, setExpandedState] = useState<string | null>(null);
  const { colorblindMode } = useTheme();

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

  // Analyze gaps
  const gaps = useMemo(() => {
    if (!providerData) return [];
    return analyzeGaps(providerData);
  }, [providerData]);

  // Build gap map for quick lookup
  const gapMap = useMemo(() => {
    const map: Record<string, StateGap> = {};
    gaps.forEach(gap => {
      map[gap.stateId] = gap;
    });
    return map;
  }, [gaps]);

  // Filter gaps
  const filteredGaps = useMemo(() => {
    if (severityFilter === 'all') return gaps;
    return gaps.filter(g => g.severity === severityFilter);
  }, [gaps, severityFilter]);

  // Stats
  const stats = useMemo(() => getGapStats(gaps), [gaps]);

  // Get color for a state
  const getStateColor = useCallback((stateId: string): string => {
    const gap = gapMap[stateId];
    if (!gap) return '#D1FAE5'; // Light green - no issues
    return getSeverityColor(gap.severity, colorblindMode);
  }, [gapMap, colorblindMode]);

  const createMouseEnterHandler = useCallback((geo: GeographyObject) => {
    return (event: React.MouseEvent<SVGPathElement>) => {
      const stateId = FIPS_TO_STATE[geo.id] || geo.id;
      const gap = gapMap[stateId];
      if (gap) {
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          gap,
        });
      } else {
        setTooltip(null);
      }
    };
  }, [gapMap]);

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
          Coverage Gap Analysis
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Identify states with coverage risks and service gaps
        </p>
      </div>

      {/* Summary Stats */}
      <div className="max-w-4xl mx-auto mb-6 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center">
            <div className="text-2xl font-bold text-fountain-dark dark:text-white">{stats.total}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">States with Gaps</div>
          </div>
          <button
            onClick={() => setSeverityFilter(severityFilter === 'high' ? 'all' : 'high')}
            className={`bg-white dark:bg-gray-800 rounded-lg p-3 border text-center transition-all ${
              severityFilter === 'high' ? 'ring-2 ring-red-500 border-red-300' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="text-2xl font-bold text-red-500">{stats.high}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">High Risk</div>
          </button>
          <button
            onClick={() => setSeverityFilter(severityFilter === 'medium' ? 'all' : 'medium')}
            className={`bg-white dark:bg-gray-800 rounded-lg p-3 border text-center transition-all ${
              severityFilter === 'medium' ? 'ring-2 ring-amber-500 border-amber-300' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="text-2xl font-bold text-amber-500">{stats.medium}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Medium Risk</div>
          </button>
          <button
            onClick={() => setSeverityFilter(severityFilter === 'low' ? 'all' : 'low')}
            className={`bg-white dark:bg-gray-800 rounded-lg p-3 border text-center transition-all ${
              severityFilter === 'low' ? 'ring-2 ring-blue-500 border-blue-300' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="text-2xl font-bold text-blue-500">{stats.low}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Low Risk</div>
          </button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="max-w-4xl mx-auto mb-4 px-4">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'map'
                ? 'bg-fountain-dark text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'list'
                ? 'bg-fountain-dark text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            List View
          </button>
          {severityFilter !== 'all' && (
            <button
              onClick={() => setSeverityFilter('all')}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
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
                    const gap = gapMap[stateId];
                    const isFiltered = severityFilter !== 'all' && gap?.severity !== severityFilter;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getStateColor(stateId)}
                        stroke="#ffffff"
                        strokeWidth={isMobile ? 1.25 : 0.75}
                        style={{
                          default: { outline: 'none', transition: 'all 0.3s ease', opacity: isFiltered && gap ? 0.3 : 1 },
                          hover: { outline: 'none', cursor: gap ? 'pointer' : 'default', filter: gap ? 'brightness(1.1)' : 'none', opacity: isFiltered && gap ? 0.3 : 1 },
                          pressed: { outline: 'none', opacity: isFiltered && gap ? 0.3 : 1 },
                        }}
                        onMouseEnter={createMouseEnterHandler(geo)}
                        onMouseLeave={handleMouseLeave}
                        onMouseMove={handleMouseMove}
                        onClick={() => gap && onCheckState?.(stateId)}
                      />
                    );
                  })}
                </>
              )}
            </Geographies>
          </ComposableMap>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-3">
            {filteredGaps.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No gaps found{severityFilter !== 'all' ? ` with ${severityFilter} severity` : ''}
              </div>
            ) : (
              filteredGaps.map(gap => (
                <div
                  key={gap.stateId}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedState(expandedState === gap.stateId ? null : gap.stateId)}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getSeverityColor(gap.severity, colorblindMode) }}
                      />
                      <span className="font-medium text-fountain-dark dark:text-white">
                        {gap.stateName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({gap.stateId})
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        gap.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                        gap.severity === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      }`}>
                        {gap.severity.toUpperCase()}
                      </span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${expandedState === gap.stateId ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {expandedState === gap.stateId && (
                    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Providers:</span>
                          <span className="ml-2 font-medium text-fountain-dark dark:text-white">{gap.providerCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Services:</span>
                          <span className="ml-2 font-medium text-fountain-dark dark:text-white">{gap.serviceCount}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Issues:</div>
                        {gap.issues.map((issue, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <span className="text-red-500 mt-0.5">•</span>
                            <span>{issue.description}</span>
                          </div>
                        ))}
                      </div>
                      {onCheckState && (
                        <button
                          onClick={() => onCheckState(gap.stateId)}
                          className="mt-3 text-sm text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          View full state details →
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-3 px-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: '#D1FAE5' }} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">No Issues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: GAP_SEVERITY_COLORS.low }} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: GAP_SEVERITY_COLORS.medium }} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Medium Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: GAP_SEVERITY_COLORS.high }} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">High Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && viewMode === 'map' && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}
        >
          <div className="bg-fountain-dark text-white px-4 py-3 rounded-lg shadow-xl min-w-[220px]">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getSeverityColor(tooltip.gap.severity, colorblindMode) }}
              />
              <span className="font-semibold">{tooltip.gap.stateName}</span>
              <span className="text-xs text-gray-400">({tooltip.gap.stateId})</span>
            </div>
            <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">
              {tooltip.gap.severity} Risk
            </div>
            <div className="text-sm space-y-1">
              {tooltip.gap.issues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-red-400">•</span>
                  <span className="text-gray-200">{issue.description}</span>
                </div>
              ))}
            </div>
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
