import { useState, useEffect, useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

interface OfficeLocation {
  state: string;
  stateCode: string;
  address: string;
  isHQ: boolean;
  notes: string;
  active: boolean;
}

// Coordinates for each office state (approximate city centers)
const STATE_COORDINATES: Record<string, [number, number]> = {
  FL: [-81.6557, 30.3322], // Jacksonville
  MD: [-76.7811, 39.4181], // Owings Mills
  IN: [-86.3976, 39.8336], // Brownsburg
  ID: [-116.3915, 43.6150], // Meridian
  UT: [-111.9738, 41.2230], // Ogden
  NM: [-106.6504, 35.0844], // Albuquerque
  WV: [-80.0659, 39.4668], // White Hall
  KY: [-84.5037, 38.0406], // Lexington
  NJ: [-74.7295, 40.2968], // Lawrence
};

export function OfficeLocationsMap() {
  const [offices, setOffices] = useState<OfficeLocation[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<OfficeLocation | null>(null);
  const [showInactive, setShowInactive] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  useEffect(() => {
    fetch('/office-locations.csv')
      .then((res) => res.text())
      .then((text) => {
        const lines = text.trim().split('\n');
        const parsed: OfficeLocation[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          // Parse CSV with quoted fields properly handling empty values
          const fields: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              fields.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          fields.push(current.trim()); // Push last field

          if (fields.length < 6) continue;

          const state = fields[0] || '';
          const stateCode = fields[1] || '';
          const address = fields[2]?.replace(/^"|"$/g, '') || '';
          const isHQ = fields[3]?.toLowerCase() === 'true';
          const notes = fields[4]?.replace(/^"|"$/g, '') || '';
          const active = fields[5]?.toLowerCase() === 'true';

          if (stateCode) {
            parsed.push({ state, stateCode, address, isHQ, notes, active });
          }
        }

        setOffices(parsed);
      })
      .catch((err) => console.error('Failed to load office locations:', err));
  }, []);

  const displayedOffices = useMemo(() => {
    return showInactive ? offices : offices.filter((o) => o.active);
  }, [offices, showInactive]);

  const activeCount = offices.filter((o) => o.active).length;
  const inactiveCount = offices.filter((o) => !o.active).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-fountain-dark dark:text-white">
            Office Locations
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {activeCount} active office{activeCount !== 1 ? 's' : ''}
            {inactiveCount > 0 && ` (${inactiveCount} inactive)`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-fountain-blue focus:ring-fountain-blue"
            />
            Show inactive
          </label>

          <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-fountain-blue text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-fountain-blue text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-fountain-blue border-2 border-white shadow"></span>
          <span className="text-gray-600 dark:text-gray-400">Active Office</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow"></span>
          <span className="text-gray-600 dark:text-gray-400">Headquarters</span>
        </div>
        {showInactive && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow"></span>
            <span className="text-gray-600 dark:text-gray-400">Inactive</span>
          </div>
        )}
      </div>

      {viewMode === 'map' ? (
        <div className="relative bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{ scale: 1000 }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const hasOffice = displayedOffices.some(
                      (o) => o.stateCode === geo.properties.postal
                    );
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={hasOffice ? '#E0F2FE' : '#F3F4F6'}
                        stroke="#CBD5E1"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none', fill: hasOffice ? '#BAE6FD' : '#E5E7EB' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {displayedOffices.map((office) => {
                const coords = STATE_COORDINATES[office.stateCode];
                if (!coords) return null;

                let markerColor = '#0EA5E9'; // fountain-blue
                if (office.isHQ) markerColor = '#EAB308'; // yellow for HQ
                if (!office.active) markerColor = '#9CA3AF'; // gray for inactive

                return (
                  <Marker
                    key={office.stateCode}
                    coordinates={coords}
                  >
                    <g
                      onClick={() => setSelectedOffice(office)}
                      style={{ cursor: 'pointer' }}
                    >
                      <circle
                        r={8}
                        fill={markerColor}
                        stroke="#FFFFFF"
                        strokeWidth={2}
                        className="drop-shadow-md"
                      />
                      {office.isHQ && (
                        <text
                          textAnchor="middle"
                          y={4}
                          style={{
                            fontSize: '8px',
                            fontWeight: 'bold',
                            fill: '#FFFFFF',
                            pointerEvents: 'none',
                          }}
                        >
                          HQ
                        </text>
                      )}
                    </g>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Click hint */}
          <p className="absolute bottom-2 left-2 text-xs text-gray-500 dark:text-gray-400">
            Click a marker to view office details
          </p>
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Full Address
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {displayedOffices.map((office) => (
                <tr
                  key={office.stateCode}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => setSelectedOffice(office)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {office.state}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        ({office.stateCode})
                      </span>
                      {office.isHQ && (
                        <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                          HQ
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-md">
                    {office.address}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        office.active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {office.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                    {office.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Office Detail Modal */}
      {selectedOffice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedOffice(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-fountain-dark dark:text-white">
                    {selectedOffice.state}
                  </h3>
                  {selectedOffice.isHQ && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full">
                      Headquarters
                    </span>
                  )}
                  {!selectedOffice.active && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Office Location
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOffice(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Address
                </h4>
                <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  {selectedOffice.address}
                </p>
              </div>

              {selectedOffice.notes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </h4>
                  <p className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 text-sm">
                    {selectedOffice.notes}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Fountain Contact Info
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                    <a href="tel:+12132371454" className="ml-2 text-fountain-blue hover:underline">
                      (213) 237-1454
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Fax:</span>
                    <span className="ml-2 text-gray-900 dark:text-white">
                      (202) 998-4218
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                    <a href="mailto:daniel@fountain.net" className="ml-2 text-fountain-blue hover:underline">
                      daniel@fountain.net
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedOffice.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-fountain-blue text-white text-center font-semibold rounded-lg hover:bg-fountain-blue/90 transition-colors"
              >
                Open in Google Maps
              </a>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(selectedOffice.address);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Copy Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
