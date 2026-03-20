import { useState, useMemo } from 'react';
import {
  SERVICE_INFO,
  SERVICE_AVAILABILITY,
  US_STATES,
  getStateName,
  getServicesForState,
  type ServiceType,
} from '../data/serviceAvailability';

const MAX_STATES = 4;
const SERVICES: ServiceType[] = ['TRT', 'HRT', 'GLP', 'Planning'];

interface StateComparisonProps {
  onCheckState?: (stateId: string) => void;
}

export function StateComparison({ onCheckState }: StateComparisonProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const sortedStates = useMemo(
    () => [...US_STATES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const filteredStates = useMemo(() => {
    if (!search.trim()) return sortedStates.slice(0, 12);
    const q = search.toLowerCase();
    return sortedStates.filter(
      (s) => s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)
    );
  }, [search, sortedStates]);

  const addState = (id: string) => {
    if (selectedIds.includes(id) || selectedIds.length >= MAX_STATES) return;
    setSelectedIds((prev) => [...prev, id]);
    setSearch('');
    setDropdownOpen(false);
  };

  const removeState = (id: string) => {
    setSelectedIds((prev) => prev.filter((s) => s !== id));
  };

  const comparisonRows = useMemo(() => {
    return selectedIds.map((stateId) => ({
      stateId,
      name: getStateName(stateId),
      services: SERVICES.map((service) => ({
        service,
        available: SERVICE_AVAILABILITY[service].includes(stateId),
        info: SERVICE_INFO[service],
      })),
      serviceCount: getServicesForState(stateId).length,
    }));
  }, [selectedIds]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">
          Compare States
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Select up to {MAX_STATES} states to compare Fountain service availability side by side
        </p>
      </div>

      {/* State selectors */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">States:</span>
        {selectedIds.map((id) => (
          <span
            key={id}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-fountain-dark/10 dark:bg-white/10 text-fountain-dark dark:text-white text-sm font-medium"
          >
            {getStateName(id)} ({id})
            <button
              type="button"
              onClick={() => removeState(id)}
              className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              aria-label={`Remove ${id}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        {selectedIds.length < MAX_STATES && (
          <div className="relative">
            <input
              type="text"
              placeholder="Add state..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              onBlur={() => setTimeout(() => setDropdownOpen(false), 180)}
              className="w-40 sm:w-48 px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-fountain-dark dark:text-white text-sm focus:border-fountain-trt focus:outline-none"
            />
            {dropdownOpen && filteredStates.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-56 max-h-60 overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-20 py-1">
                {filteredStates.map((state) => {
                  const disabled = selectedIds.includes(state.id);
                  return (
                    <button
                      key={state.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => addState(state.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        disabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-fountain-dark dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {state.name} ({state.id})
                      {disabled && ' ✓'}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison table */}
      {comparisonRows.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
            Add at least one state above to see the comparison.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden animate-fade-in"
          style={{ animationDuration: '0.35s' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[320px] text-left">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
                  <th className="py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32 sm:w-40">
                    Service
                  </th>
                  {comparisonRows.map((row) => (
                    <th
                      key={row.stateId}
                      className="py-3 px-3 sm:px-4 text-sm font-semibold text-fountain-dark dark:text-white"
                    >
                      <button
                        type="button"
                        onClick={() => onCheckState?.(row.stateId)}
                        className="hover:underline focus:outline-none focus:underline"
                      >
                        {row.name}
                      </button>
                      <span className="block text-xs font-normal text-gray-500 dark:text-gray-400 mt-0.5">
                        {row.serviceCount} service{row.serviceCount !== 1 ? 's' : ''}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SERVICES.map((service) => {
                  const info = SERVICE_INFO[service];
                  return (
                    <tr
                      key={service}
                      className="border-b border-gray-100 dark:border-gray-700/80 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center gap-2 text-sm font-medium"
                          style={{ color: info.color }}
                        >
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: info.color }}
                          />
                          {info.name}
                        </span>
                        <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {info.shortDescription}
                        </span>
                      </td>
                      {comparisonRows.map((row) => {
                        const cell = row.services.find((s) => s.service === service);
                        const available = cell?.available ?? false;
                        return (
                          <td key={`${row.stateId}-${service}`} className="py-3 px-3 sm:px-4">
                            {available ? (
                              <span
                                className="inline-flex items-center gap-1.5 text-sm font-medium"
                                style={{ color: info.color }}
                              >
                                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                Available
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
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
    </div>
  );
}
