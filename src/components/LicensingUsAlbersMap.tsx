import { useState, useCallback, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
} from 'react-simple-maps';
import { GEO_URL, FIPS_TO_STATE, STATE_CENTERS, SMALL_STATES } from '../data/usMapGeo';

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

const INACTIVE = '#D1D5DB';

export interface LicensingUsAlbersMapProps {
  containerId: string;
  ariaLabel: string;
  getColor: (stateId: string) => string;
  /** When true, state is shown with muted fill */
  isDimmed?: (stateId: string) => boolean;
  highlightedStateId?: string | null;
  onSelectState?: (stateId: string) => void;
  onMouseEnterState: (e: React.MouseEvent<SVGPathElement>, stateId: string) => void;
  onMouseLeave: () => void;
  onMouseMove: (e: React.MouseEvent<SVGPathElement>) => void;
}

export function LicensingUsAlbersMap({
  containerId,
  ariaLabel,
  getColor,
  isDimmed,
  highlightedStateId,
  onSelectState,
  onMouseEnterState,
  onMouseLeave,
  onMouseMove,
}: LicensingUsAlbersMapProps) {
  const isMobile = useNarrowViewport(639);
  const [mapZoom, setMapZoom] = useState(1);
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => setMapZoom((z) => Math.min(z + 0.5, 3)), []);
  const handleZoomOut = useCallback(() => {
    setMapZoom((z) => {
      const nz = Math.max(z - 0.5, 1);
      if (nz === 1) setMapPosition({ x: 0, y: 0 });
      return nz;
    });
  }, []);
  const handleResetZoom = useCallback(() => {
    setMapZoom(1);
    setMapPosition({ x: 0, y: 0 });
  }, []);

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (mapZoom <= 1) return;
      setIsDragging(true);
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setDragStart({ x: clientX - mapPosition.x, y: clientY - mapPosition.y });
    },
    [mapZoom, mapPosition]
  );
  const handleDragMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setMapPosition({ x: clientX - dragStart.x, y: clientY - dragStart.y });
    },
    [isDragging, dragStart]
  );
  const handleDragEnd = useCallback(() => setIsDragging(false), []);

  return (
    <div id={containerId} className="relative w-full max-w-5xl mx-auto px-2 sm:px-4">
      <div className="print-hide absolute top-2 right-2 sm:right-6 z-30 flex flex-col gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button type="button" onClick={handleZoomIn} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Zoom in">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <div className="border-t border-gray-200 dark:border-gray-700" />
        <button type="button" onClick={handleZoomOut} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Zoom out">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        {mapZoom > 1 && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700" />
            <button type="button" onClick={handleResetZoom} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Reset zoom">
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </>
        )}
      </div>

      {mapZoom > 1 && (
        <div className="print-hide absolute top-2 left-2 sm:left-6 z-30 bg-white dark:bg-gray-800 px-2 py-1 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300">
          {Math.round(mapZoom * 100)}%
        </div>
      )}

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
          aria-label={ariaLabel}
        >
          <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: isMobile ? 750 : 1000 }}>
            <Geographies geography={GEO_URL}>
              {({ geographies }) => (
                <>
                  {geographies.map((geo) => {
                    const stateId = FIPS_TO_STATE[geo.id] || geo.id;
                    const dimmed = isDimmed?.(stateId) ?? false;
                    const fillColor = dimmed ? INACTIVE : getColor(stateId);
                    const interactive = !dimmed;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={fillColor}
                        stroke={highlightedStateId === stateId ? '#f59e0b' : '#ffffff'}
                        strokeWidth={highlightedStateId === stateId ? 2.5 : isMobile ? 1.25 : 0.75}
                        style={{
                          default: { outline: 'none', transition: 'fill 0.3s ease, stroke 0.2s ease' },
                          hover: {
                            fill: interactive ? fillColor : INACTIVE,
                            outline: 'none',
                            cursor: interactive ? 'pointer' : 'default',
                            filter: interactive ? 'brightness(1.08)' : 'none',
                          },
                          pressed: { outline: 'none' },
                        }}
                        onMouseEnter={(e) => onMouseEnterState(e, stateId)}
                        onMouseLeave={onMouseLeave}
                        onMouseMove={onMouseMove}
                        onClick={() => interactive && onSelectState?.(stateId)}
                      />
                    );
                  })}
                </>
              )}
            </Geographies>

            {Object.entries(STATE_CENTERS).map(([stateId, coords]) => {
              if (SMALL_STATES[stateId]) return null;
              if (stateId === 'AK' || stateId === 'HI') return null;
              const dimmed = isDimmed?.(stateId) ?? false;
              return (
                <Marker key={stateId} coordinates={coords}>
                  <text
                    textAnchor="middle"
                    style={{
                      fontFamily: 'Outfit, system-ui, sans-serif',
                      fontSize: stateId === 'DC' ? (isMobile ? 7 : 6) : isMobile ? 11 : 10,
                      fontWeight: 600,
                      fill: dimmed ? '#9CA3AF' : '#1E293B',
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
              const dimmed = isDimmed?.(stateId) ?? false;
              const fillColor = dimmed ? INACTIVE : getColor(stateId);
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
                      fontSize: isMobile ? 10 : 9,
                      fontWeight: 600,
                      fill: dimmed ? '#9CA3AF' : fillColor,
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
  );
}
