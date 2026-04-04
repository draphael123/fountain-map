import { useState, useMemo, useCallback } from 'react';
import { getStateName } from '../data/serviceAvailability';
import { STATE_RULES_ROWS, type StateRuleRow } from '../data/stateRulesData';
import { LicensingUsAlbersMap } from './LicensingUsAlbersMap';

const COLOR_YES = '#0d9488';
const COLOR_NO = '#64748b';
const COLOR_OTHER = '#f59e0b';
const COLOR_NO_DATA = '#e5e7eb';

type TriFilter = 'all' | 'yes' | 'no';

function normYesNo(v: string): 'yes' | 'no' | 'other' {
  const t = v.trim().toLowerCase();
  if (t === 'yes') return 'yes';
  if (t === 'no') return 'no';
  return 'other';
}

function rowMatches(row: StateRuleRow, op: TriFilter, comp: TriFilter): boolean {
  if (op !== 'all') {
    const o = normYesNo(row.operational);
    if (op === 'yes' && o !== 'yes') return false;
    if (op === 'no' && o !== 'no') return false;
  }
  if (comp !== 'all') {
    const c = normYesNo(row.compact);
    if (comp === 'yes' && c !== 'yes') return false;
    if (comp === 'no' && c !== 'no') return false;
  }
  return true;
}

function fillForRow(row: StateRuleRow | undefined): string {
  if (!row) return COLOR_NO_DATA;
  const o = normYesNo(row.operational);
  if (o === 'yes') return COLOR_YES;
  if (o === 'no') return COLOR_NO;
  return COLOR_OTHER;
}

export function StateRulesMap() {
  const [opFilter, setOpFilter] = useState<TriFilter>('all');
  const [compactFilter, setCompactFilter] = useState<TriFilter>('all');
  const [search, setSearch] = useState('');
  const [highlightedStateId, setHighlightedStateId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; stateId: string } | null>(null);

  const rowByStateId = useMemo(() => {
    const m = new Map<string, StateRuleRow>();
    STATE_RULES_ROWS.forEach((r) => m.set(r.stateId, r));
    return m;
  }, []);

  const matchesFilter = useCallback(
    (row: StateRuleRow | undefined) => {
      if (!row) return false;
      return rowMatches(row, opFilter, compactFilter);
    },
    [opFilter, compactFilter]
  );

  const getColor = useCallback(
    (stateId: string) => {
      const row = rowByStateId.get(stateId);
      if (!row || !matchesFilter(row)) return COLOR_NO_DATA;
      return fillForRow(row);
    },
    [rowByStateId, matchesFilter]
  );

  const isDimmed = useCallback(
    (stateId: string) => {
      const row = rowByStateId.get(stateId);
      if (!row) return true;
      return !matchesFilter(row);
    },
    [rowByStateId, matchesFilter]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<SVGPathElement>, stateId: string) => {
      const row = rowByStateId.get(stateId);
      if (!row || !matchesFilter(row)) return;
      setTooltip({ x: e.clientX, y: e.clientY, stateId });
    },
    [rowByStateId, matchesFilter]
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGPathElement>) => {
    setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = STATE_RULES_ROWS.filter((r) => rowMatches(r, opFilter, compactFilter));
    if (q) {
      list = list.filter(
        (r) =>
          getStateName(r.stateId).toLowerCase().includes(q) ||
          r.stateId.toLowerCase().includes(q) ||
          r.requiredSteps.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.stateId.localeCompare(b.stateId));
  }, [opFilter, compactFilter, search]);

  const downloadCsv = useCallback(() => {
    const header = 'State ID,State,Compact,Operational,Required Steps,DEA CSRs,CPA Required,Notes';
    const lines = STATE_RULES_ROWS.sort((a, b) => a.stateId.localeCompare(b.stateId)).map(
      (r) =>
        [
          r.stateId,
          `"${getStateName(r.stateId).replace(/"/g, '""')}"`,
          r.compact,
          r.operational,
          `"${r.requiredSteps.replace(/"/g, '""')}"`,
          r.deaCsrs,
          r.cpaRequired,
          `"${r.notes.replace(/"/g, '""')}"`,
        ].join(',')
    );
    const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'State_Licensing_Rules.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const focusFromList = useCallback((stateId: string) => {
    setHighlightedStateId(stateId);
    document.getElementById('state-rules-map')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, []);

  return (
    <div className="w-full licensing-policy-print">
      <div className="text-center mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">State licensing rules</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl mx-auto text-sm sm:text-base">
          Compact, operational status, required steps, DEA CSR and CPA flags by state (internal reference).
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 w-full text-center">Operational</div>
        {(['all', 'yes', 'no'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setOpFilter(v)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              opFilter === v ? 'bg-fountain-dark text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            {v === 'all' ? 'All' : v === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400 w-full text-center">Nurse compact</div>
        {(['all', 'yes', 'no'] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setCompactFilter(v)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
              compactFilter === v ? 'bg-fountain-dark text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
          >
            {v === 'all' ? 'All' : v === 'yes' ? 'Yes' : 'No'}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_YES }} />
          <span className="text-gray-700 dark:text-gray-300">Operational: Yes</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_NO }} />
          <span className="text-gray-700 dark:text-gray-300">Operational: No</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: COLOR_OTHER }} />
          <span className="text-gray-700 dark:text-gray-300">Other / unclear</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-600" />
          <span className="text-gray-500">Filtered / no data</span>
        </div>
      </div>

      <LicensingUsAlbersMap
        containerId="state-rules-map"
        ariaLabel="State licensing rules map"
        getColor={getColor}
        isDimmed={isDimmed}
        highlightedStateId={highlightedStateId}
        onSelectState={(id) => {
          if (!rowByStateId.get(id) || !matchesFilter(rowByStateId.get(id)!)) return;
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
          Download state rules (CSV)
        </button>
      </div>

      <div className="max-w-4xl mx-auto mt-8">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search table</label>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="State, steps, notes…"
          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-fountain-dark dark:text-white mb-2"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Showing <strong className="text-fountain-dark dark:text-white">{filteredRows.length}</strong> of{' '}
          {STATE_RULES_ROWS.length} states
          {(opFilter !== 'all' || compactFilter !== 'all' || search.trim()) && (
            <span className="text-gray-500"> — filters and/or search applied</span>
          )}
        </p>
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 font-semibold text-fountain-dark dark:text-white">State</th>
                  <th className="px-3 py-2">Compact</th>
                  <th className="px-3 py-2">Op.</th>
                  <th className="px-3 py-2 min-w-[200px]">Required steps</th>
                  <th className="px-3 py-2">DEA CSR</th>
                  <th className="px-3 py-2">CPA</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      No states match these filters and search. Try setting Operational and Nurse compact to &quot;All&quot;
                      or clear search.
                    </td>
                  </tr>
                )}
                {filteredRows.map((r) => (
                  <tr
                    key={r.stateId}
                    className={`border-t border-gray-100 dark:border-gray-700 ${
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
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.compact}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.operational}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-300">{r.requiredSteps}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.deaCsrs}</td>
                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">{r.cpaRequired}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {filteredRows.map((r) => r.notes).some(Boolean) && (
          <div className="mt-6 space-y-3">
            <h3 className="font-bold text-fountain-dark dark:text-white text-sm">Notes (filtered)</h3>
            {filteredRows
              .filter((r) => r.notes.trim())
              .map((r) => (
                <div key={r.stateId} className="text-sm text-gray-600 dark:text-gray-300 border-l-4 border-teal-500 pl-3">
                  <span className="font-semibold text-fountain-dark dark:text-white">{getStateName(r.stateId)}: </span>
                  {r.notes}
                </div>
              ))}
          </div>
        )}
      </div>

      {tooltip && rowByStateId.get(tooltip.stateId) && matchesFilter(rowByStateId.get(tooltip.stateId)!) && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{ left: tooltip.x + 15, top: tooltip.y - 10 }}
        >
          <div className="bg-fountain-dark text-white px-4 py-3 rounded-lg shadow-xl max-w-sm text-xs">
            <div className="font-semibold text-sm">{getStateName(tooltip.stateId)}</div>
            {(() => {
              const r = rowByStateId.get(tooltip.stateId)!;
              return (
                <div className="mt-2 space-y-1 text-gray-200">
                  <div>
                    <span className="text-gray-400">Compact: </span>
                    {r.compact}
                  </div>
                  <div>
                    <span className="text-gray-400">Operational: </span>
                    {r.operational}
                  </div>
                  <div>
                    <span className="text-gray-400">CPA: </span>
                    {r.cpaRequired}
                  </div>
                  {r.requiredSteps && (
                    <div className="pt-1 border-t border-white/10 text-gray-300">{r.requiredSteps}</div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
