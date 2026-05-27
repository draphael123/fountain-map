import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Annotation,
} from 'react-simple-maps';
import { US_STATES } from '../data/serviceAvailability';
import { GEO_URL, FIPS_TO_STATE, STATE_CENTERS, SMALL_STATES } from '../data/usMapGeo';
import { parseCSV } from '../data/providerAuthority';
import { StateRNPanel } from './StateRNPanel';

const STATUS_COLORS = {
  valid: '#22C55E',
  expiringSoon: '#EAB308',
  critical: '#EF4444',
  pending: '#F97316',
  none: '#D1D5DB',
};

const INACTIVE_COLOR = '#D1D5DB';
const UNLICENSED_COLOR = '#3B82F6'; // Blue for states where RN is NOT licensed

interface RNLicensingRow {
  stateId: string;
  stateName: string;
  rns: Record<string, string>;
}

interface RNLicensingData {
  rns: string[];
  rows: RNLicensingRow[];
}

function stateNameToId(name: string): string | null {
  const n = name.trim();
  if (!n) return null;
  const state = US_STATES.find((s) => s.name === n);
  if (state) return state.id;
  if (n === 'DC') return 'DC';
  return null;
}

async function loadRNLicensingData(): Promise<RNLicensingData> {
  const res = await fetch('/rn-licensing.csv');
  if (!res.ok) throw new Error('Failed to load RN licensing data');
  const text = await res.text();
  const rows = parseCSV(text);
  if (rows.length < 2) return { rns: [], rows: [] };

  const headers = rows[0];
  const rns = headers.slice(1).map((h) => h.trim()).filter(Boolean);

  const dataRows: RNLicensingRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const stateName = row[0]?.trim() ?? '';
    const stateId = stateNameToId(stateName);
    if (!stateId) continue;

    const rnData: Record<string, string> = {};
    rns.forEach((rn, i) => {
      const value = row[i + 1]?.trim() ?? '';
      if (value) rnData[rn] = value;
    });
    if (Object.keys(rnData).length > 0) {
      dataRows.push({ stateId, stateName, rns: rnData });
    }
  }

  return { rns, rows: dataRows };
}

function parseLicenseDate(value: string): Date | null {
  const v = (value ?? '').trim().toLowerCase();
  if (!v || v === 'pending') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

interface LicenseStatus {
  status: 'valid' | 'expiringSoon' | 'critical' | 'pending' | 'none';
  daysUntilExpiry: number | null;
}

function getLicenseStatus(value: string | undefined): LicenseStatus {
  if (!value) return { status: 'none', daysUntilExpiry: null };
  const v = value.trim().toLowerCase();
  if (v === 'pending' || v.includes('pending')) return { status: 'pending', daysUntilExpiry: null };

  const date = parseLicenseDate(value);
  if (!date) return { status: 'none', daysUntilExpiry: null };

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0 || days < 30) return { status: 'critical', daysUntilExpiry: days };
  if (days < 90) return { status: 'expiringSoon', daysUntilExpiry: days };
  return { status: 'valid', daysUntilExpiry: days };
}

export function RNLicensingMap() {
  const [data, setData] = useState<RNLicensingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRN, setSelectedRN] = useState<string>('');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');
  const [panelState, setPanelState] = useState<{ stateId: string; stateName: string } | null>(null);
  const [showUnlicensed, setShowUnlicensed] = useState(false);

  useEffect(() => {
    loadRNLicensingData()
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const rowByStateId = useMemo(() => {
    if (!data) return new Map<string, RNLicensingRow>();
    const m = new Map<string, RNLicensingRow>();
    data.rows.forEach((row) => m.set(row.stateId, row));
    return m;
  }, [data]);

  const rnStateCounts = useMemo(() => {
    if (!data) return new Map<string, number>();
    const counts = new Map<string, number>();
    data.rns.forEach((rn) => {
      let count = 0;
      data.rows.forEach((row) => {
        if (row.rns[rn]) count++;
      });
      counts.set(rn, count);
    });
    return counts;
  }, [data]);

  const expiringLicenses = useMemo(() => {
    if (!data || !selectedRN) return [];
    const expiring: { state: string; stateId: string; days: number; value: string }[] = [];

    data.rows.forEach((row) => {
      const value = row.rns[selectedRN];
      if (!value) return;
      const status = getLicenseStatus(value);
      if ((status.status === 'critical' || status.status === 'expiringSoon') && status.daysUntilExpiry !== null) {
        expiring.push({
          state: row.stateName,
          stateId: row.stateId,
          days: status.daysUntilExpiry,
          value,
        });
      }
    });

    return expiring.sort((a, b) => a.days - b.days);
  }, [data, selectedRN]);

  const getStateColor = useCallback((stateId: string): string => {
    if (!selectedRN) return INACTIVE_COLOR;
    const row = rowByStateId.get(stateId);
    const value = row?.rns[selectedRN];
    const hasLicense = !!value;

    if (showUnlicensed) {
      // Invert: show where NOT licensed
      return hasLicense ? INACTIVE_COLOR : UNLICENSED_COLOR;
    } else {
      // Normal: show license status
      if (!value) return INACTIVE_COLOR;
      const status = getLicenseStatus(value);
      return STATUS_COLORS[status.status];
    }
  }, [selectedRN, rowByStateId, showUnlicensed]);

  const handleStateClick = useCallback((stateId: string) => {
    const stateName = US_STATES.find((s) => s.id === stateId)?.name ?? stateId;
    setPanelState({ stateId, stateName });
  }, []);

  const closePanelHandler = useCallback(() => setPanelState(null), []);

  const exportToCSV = useCallback(() => {
    if (!data) return;
    const rnsToExport = selectedRN ? [selectedRN] : data.rns;
    const headers = ['State', ...rnsToExport];
    const rows = data.rows.map((row) => {
      const state = US_STATES.find((s) => s.id === row.stateId);
      return [state?.name ?? row.stateId, ...rnsToExport.map((rn) => row.rns[rn] ?? '')];
    });

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rn-licensing-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data, selectedRN]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Loading RN licensing data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 text-center text-red-700 dark:text-red-300">
        {error ?? 'RN licensing data not available.'}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Expiring Licenses Banner */}
      {expiringLicenses.length > 0 && (
        <div className="max-w-5xl mx-auto mb-4 px-4 sm:px-6">
          <div className={`rounded-xl border p-4 ${
            expiringLicenses.some((l) => l.days < 30)
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
              : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{expiringLicenses.some((l) => l.days < 30) ? '🚨' : '⚠️'}</span>
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  expiringLicenses.some((l) => l.days < 30) ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
                }`}>
                  {expiringLicenses.filter((l) => l.days < 30).length > 0
                    ? `${expiringLicenses.filter((l) => l.days < 30).length} RN license(s) expiring within 30 days`
                    : `${expiringLicenses.length} RN license(s) expiring within 90 days`}
                </h4>
                <div className="mt-2 text-sm space-y-1">
                  {expiringLicenses.slice(0, 5).map((lic, i) => (
                    <div key={i} className={lic.days < 30 ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}>
                      {lic.state}: {lic.days < 0 ? `Expired ${Math.abs(lic.days)} days ago` : `${lic.days} days left`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="max-w-5xl mx-auto mb-6 px-4 sm:px-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Select RN
          </label>
          <select
            value={selectedRN}
            onChange={(e) => setSelectedRN(e.target.value)}
            className="w-full px-3 py-3 sm:py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-fountain-dark dark:text-white text-sm"
          >
            <option value="">-- Select an RN --</option>
            {data.rns.map((rn) => (
              <option key={rn} value={rn}>
                {rn} ({rnStateCounts.get(rn) ?? 0} states)
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          <button
            type="button"
            onClick={() => { setSelectedRN(''); setShowUnlicensed(false); }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'map' ? 'table' : 'map')}
            className="px-4 py-2 text-sm font-medium text-white bg-fountain-dark rounded-lg hover:bg-fountain-dark/90"
          >
            {viewMode === 'map' ? '📊 Table View' : '🗺️ Map View'}
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className="px-4 py-2 text-sm font-medium text-fountain-dark bg-white border border-fountain-dark rounded-lg hover:bg-gray-50"
          >
            📥 Export CSV
          </button>
          {selectedRN && viewMode === 'map' && (
            <button
              type="button"
              onClick={() => setShowUnlicensed(!showUnlicensed)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showUnlicensed
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {showUnlicensed ? 'Showing unlicensed' : 'Show unlicensed'}
            </button>
          )}
        </div>
      </div>

      {/* Coverage Summary */}
      {selectedRN && (
        <div className="max-w-5xl mx-auto mb-6 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h4 className="font-semibold text-fountain-dark dark:text-white mb-2">{selectedRN}</h4>
            <p className="text-2xl font-bold text-teal-600">{rnStateCounts.get(selectedRN) ?? 0} states</p>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === 'map' && (
        <>
          <div className="max-w-5xl mx-auto px-2 sm:px-4">
            <div className="overflow-hidden rounded-xl">
              <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 1000 }}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const stateId = FIPS_TO_STATE[geo.id] || geo.id;
                      const fillColor = getStateColor(stateId);

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill={fillColor}
                          stroke="#ffffff"
                          strokeWidth={0.75}
                          style={{
                            default: { outline: 'none', transition: 'fill 0.2s ease' },
                            hover: { outline: 'none', cursor: 'pointer', filter: 'brightness(1.08)' },
                          }}
                          onClick={() => handleStateClick(stateId)}
                        />
                      );
                    })
                  }
                </Geographies>

                {Object.entries(STATE_CENTERS).map(([stateId, coords]) => {
                  if (SMALL_STATES[stateId]) return null;
                  const color = getStateColor(stateId);
                  const isActive = color !== INACTIVE_COLOR;

                  return (
                    <Marker key={stateId} coordinates={coords}>
                      <text
                        textAnchor="middle"
                        style={{
                          fontFamily: 'Outfit, system-ui, sans-serif',
                          fontSize: stateId === 'DC' ? 6 : (stateId === 'AK' || stateId === 'HI' ? 8 : 10),
                          fontWeight: 600,
                          fill: isActive ? '#1E293B' : '#6B7280',
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
                  const color = getStateColor(stateId);

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
                          fill: color !== INACTIVE_COLOR ? color : '#9CA3AF',
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

          {/* Legend */}
          <div className="flex justify-center gap-4 sm:gap-6 mt-4 flex-wrap px-4">
            {selectedRN ? (
              showUnlicensed ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: UNLICENSED_COLOR }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Not licensed (needs licensure)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: INACTIVE_COLOR }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Already licensed</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: STATUS_COLORS.valid }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Valid (90+ days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: STATUS_COLORS.expiringSoon }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Expiring (30-90 days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: STATUS_COLORS.critical }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Critical (&lt;30 days)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded shadow-sm" style={{ backgroundColor: STATUS_COLORS.pending }} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Pending</span>
                  </div>
                </>
              )
            ) : (
              <span className="text-sm text-gray-500">Select an RN to see license status by state</span>
            )}
          </div>
        </>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="max-w-5xl mx-auto px-4">
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-gray-50 dark:bg-gray-800">State</th>
                  {(selectedRN ? [selectedRN] : data.rns).map((rn) => (
                    <th key={rn} className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">{rn}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.rows.map((row) => {
                  const state = US_STATES.find((s) => s.id === row.stateId);
                  return (
                    <tr key={row.stateId} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900">
                        {state?.name ?? row.stateId}
                      </td>
                      {(selectedRN ? [selectedRN] : data.rns).map((rn) => {
                        const value = row.rns[rn];
                        const status = getLicenseStatus(value);
                        return (
                          <td key={rn} className="px-4 py-3 whitespace-nowrap">
                            {value ? (
                              <span
                                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${STATUS_COLORS[status.status]}20`,
                                  color: STATUS_COLORS[status.status],
                                }}
                              >
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status.status] }} />
                                {value}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* State RN Panel */}
      <StateRNPanel
        isOpen={panelState !== null}
        onClose={closePanelHandler}
        stateId={panelState?.stateId ?? ''}
        stateName={panelState?.stateName ?? ''}
        row={panelState ? rowByStateId.get(panelState.stateId) : undefined}
      />
    </div>
  );
}
