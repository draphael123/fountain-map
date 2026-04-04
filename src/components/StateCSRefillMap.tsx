import { useState, useMemo, useCallback } from 'react';
import { getStateName } from '../data/serviceAvailability';
import { STATE_CS_REFILL_ROWS, type StateCSRefillRow } from '../data/stateCSRefillData';
import { DATA_LAST_UPDATED } from '../data/dataMeta';
import { LicensingUsAlbersMap } from './LicensingUsAlbersMap';

const COLOR_STANDARD = '#6366f1';
const COLOR_CUSTOM = '#8b5cf6';
const COLOR_EXTRA_ONLY = '#0ea5e9';
const COLOR_EMPTY = '#d1d5db';
const COLOR_NO_DATA = '#e5e7eb';

const STANDARD_SNIPPET = 'Five refills within Six month';

function categoryForRow(row: StateCSRefillRow | undefined): 'none' | 'standard' | 'custom' | 'extraOnly' {
  if (!row) return 'none';
  const r = row.restriction.trim();
  const x = row.extraNotes.trim();
  if (!r && !x) return 'none';
  if (!r && x) return 'extraOnly';
  if (r.includes(STANDARD_SNIPPET)) return 'standard';
  return 'custom';
}

function fillForCategory(cat: ReturnType<typeof categoryForRow>): string {
  switch (cat) {
    case 'standard':
      return COLOR_STANDARD;
    case 'custom':
      return COLOR_CUSTOM;
    case 'extraOnly':
      return COLOR_EXTRA_ONLY;
    default:
      return COLOR_EMPTY;
  }
}

export function StateCSRefillMap() {
  const [search, setSearch] = useState('');
  const [highlightedStateId, setHighlightedStateId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; stateId: string } | null>(null);

  const rowByStateId = useMemo(() => {
    const m = new Map<string, StateCSRefillRow>();
    STATE_CS_REFILL_ROWS.forEach((r) => m.set(r.stateId, r));
    return m;
  }, []);

  const rowMatchesSearch = useCallback(
    (row: StateCSRefillRow) => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        getStateName(row.stateId).toLowerCase().includes(q) ||
        row.stateId.toLowerCase().includes(q) ||
        row.restriction.toLowerCase().includes(q) ||
        row.extraNotes.toLowerCase().includes(q)
      );
    },
    [search]
  );

  const filteredRows = useMemo(() => {
    return STATE_CS_REFILL_ROWS.filter(rowMatchesSearch).sort((a, b) => a.stateId.localeCompare(b.stateId));
  }, [rowMatchesSearch]);

  const getColor = useCallback(
    (stateId: string) => {
      const row = rowByStateId.get(stateId);
      if (!row) return COLOR_NO_DATA;
      if (search.trim() && !rowMatchesSearch(row)) return COLOR_NO_DATA;
      return fillForCategory(categoryForRow(row));
    },
    [rowByStateId, search, rowMatchesSearch]
  );

  const isDimmed = useCallback(
    (stateId: string) => {
      const row = rowByStateId.get(stateId);
      if (!row) return true;
      if (search.trim() && !rowMatchesSearch(row)) return true;
      return false;
    },
    [rowByStateId, search, rowMatchesSearch]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGPathElement>, stateId: string) => {
      const row = rowByStateId.get(stateId);
      if (!row || (search.trim() && !rowMatchesSearch(row))) return;
      setTooltip({ x: e.clientX, y: e.clientY, stateId });
    },
    [rowByStateId, search, rowMatchesSearch]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGPathElement>) => {
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const downloadCsv = useCallback(() => {
    const header = 'State ID,State Label,Restriction,Extra notes';
    const lines = STATE_CS_REFILL_ROWS.sort((a, b) => a.stateId.localeCompare(b.stateId)).map((r) =>
      [
        r.stateId,
        `"${r.stateLabel.replace(/"/g, '""')}"`,
        `"${r.restriction.replace(/"/g, '""')}"`,
        `"${r.extraNotes.replace(/"/g, '""')}"`,
      ].join(',')
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'State_CS_Refill_Guidelines.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const focusFromList = useCallback((stateId: string) => {
    setHighlightedStateId(stateId);
    document.getElementById('state-cs-refill-map')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <div className="w-full licensing-policy-print">
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">State CS refill guidelines</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
          Prescription and refill restrictions for controlled substances by state (summarized from internal tracker).
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Data last synced with app: {DATA_LAST_UPDATED}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_STANDARD }} />
          <span className="text-gray-700 dark:text-gray-300">Common “5 refills / 6 month” pattern</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_CUSTOM }} />
          <span className="text-gray-700 dark:text-gray-300">State-specific wording</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_EXTRA_ONLY }} />
          <span className="text-gray-700 dark:text-gray-300">Notes only (see table)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_EMPTY }} />
          <span className="text-gray-500">Empty / see ancillary columns</span>
        </div>
      </div>

      <LicensingUsAlbersMap
        containerId="state-cs-refill-map"
        ariaLabel="State controlled substance refill guidelines map"
        getColor={getColor}
        isDimmed={isDimmed}
        highlightedStateId={highlightedStateId}
        onSelectState={(id) => {
          const row = rowByStateId.get(id);
          if (!row || (search.trim() && !rowMatchesSearch(row))) return;
          setHighlightedStateId(id);
        }}
        onMouseEnterState={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
      />

      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={downloadCsv}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Download CS refill data (CSV)
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search (map + table)</label>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="State, restriction text, notes…"
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-fountain-dark dark:text-white mb-4"
        />
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-semibold text-fountain-dark dark:text-white">State</th>
                  <th className="px-3 py-2 min-w-[280px]">Restriction / prescription rules</th>
                  <th className="px-3 py-2 min-w-[200px]">Additional notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr
                    key={r.stateId}
                    className={`border-t border-gray-100 dark:border-gray-700 align-top ${
                      highlightedStateId === r.stateId ? 'bg-amber-50 dark:bg-amber-900/20' : ''
                    }`}
                  >
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => focusFromList(r.stateId)}
                        className="font-medium text-teal-700 dark:text-teal-400 hover:underline text-left"
                      >
                        {getStateName(r.stateId)}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{r.restriction || '—'}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.extraNotes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {tooltip && rowByStateId.get(tooltip.stateId) && (!search.trim() || rowMatchesSearch(rowByStateId.get(tooltip.stateId)!)) && (
        <div className="fixed z-50 pointer-events-none" style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}>
          <div className="bg-fountain-dark text-white px-4 py-3 rounded-lg shadow-xl max-w-md text-xs">
            <div className="font-semibold text-sm">{getStateName(tooltip.stateId)}</div>
            {(() => {
              const r = rowByStateId.get(tooltip.stateId)!;
              return (
                <div className="mt-2 space-y-2 text-gray-200">
                  {r.restriction && <p>{r.restriction}</p>}
                  {r.extraNotes && <p className="text-gray-400 border-t border-white/10 pt-2">{r.extraNotes}</p>}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
