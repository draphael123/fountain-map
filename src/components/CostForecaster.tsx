import { useState, useMemo } from 'react';
import {
  LICENSE_COSTS,
  DEA_COSTS,
  getLicenseCostStats,
  getAnnualMdCost,
  getAnnualNpCost,
} from '../data/licenseCosts';
import {
  US_STATES,
  getServicesForState,
} from '../data/serviceAvailability';

type ProviderType = 'MD' | 'NP' | 'Both';
type ViewTab = 'overview' | 'byState' | 'forecast';

export function CostForecaster() {
  const [viewTab, setViewTab] = useState<ViewTab>('overview');
  const [providerType, setProviderType] = useState<ProviderType>('Both');
  const [includeDea, setIncludeDea] = useState(true);
  const [forecastYears, setForecastYears] = useState(1);
  const [sortBy, setSortBy] = useState<'state' | 'cost'>('cost');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Get operational states (states where Fountain has any service)
  const operationalStates = useMemo(() => {
    return US_STATES.filter(state => {
      const services = getServicesForState(state.id);
      return services.length > 0;
    }).map(s => s.id);
  }, []);

  // Cost statistics
  const costStats = useMemo(() => getLicenseCostStats(), []);

  // Calculate costs per state
  const stateCosts = useMemo(() => {
    return LICENSE_COSTS.map(state => {
      const isOperational = operationalStates.includes(state.stateId);
      const mdAnnual = getAnnualMdCost(state.stateId);
      const npAnnual = getAnnualNpCost(state.stateId);
      const deaAnnual = includeDea ? DEA_COSTS.annualEquivalent : 0;

      let annualCost = 0;
      if (providerType === 'MD' || providerType === 'Both') {
        annualCost += mdAnnual + (includeDea ? deaAnnual : 0);
      }
      if (providerType === 'NP' || providerType === 'Both') {
        annualCost += npAnnual + (includeDea && providerType === 'NP' ? deaAnnual : 0);
      }
      if (providerType === 'Both' && includeDea) {
        // Both already includes DEA once for MD, add again for NP
        annualCost += deaAnnual;
      }

      return {
        ...state,
        isOperational,
        mdAnnual,
        npAnnual,
        deaAnnual,
        annualCost,
        forecastCost: annualCost * forecastYears,
      };
    });
  }, [operationalStates, providerType, includeDea, forecastYears]);

  // Sorted state costs
  const sortedStateCosts = useMemo(() => {
    const sorted = [...stateCosts];
    sorted.sort((a, b) => {
      if (sortBy === 'state') {
        return sortDir === 'asc'
          ? a.stateLabel.localeCompare(b.stateLabel)
          : b.stateLabel.localeCompare(a.stateLabel);
      }
      return sortDir === 'asc'
        ? a.annualCost - b.annualCost
        : b.annualCost - a.annualCost;
    });
    return sorted;
  }, [stateCosts, sortBy, sortDir]);

  // Total costs for operational states
  const operationalTotals = useMemo(() => {
    const operational = stateCosts.filter(s => s.isOperational);
    const totalAnnual = operational.reduce((sum, s) => sum + s.annualCost, 0);
    return {
      stateCount: operational.length,
      totalAnnual,
      totalForecast: totalAnnual * forecastYears,
      avgPerState: operational.length > 0 ? Math.round(totalAnnual / operational.length) : 0,
    };
  }, [stateCosts, forecastYears]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const toggleSort = (column: 'state' | 'cost') => {
    if (sortBy === column) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(column);
      setSortDir(column === 'cost' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-fountain-dark dark:text-white">
          License Cost Forecaster
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base">
          Estimate and project licensing costs across states
        </p>
      </div>

      {/* View Tabs */}
      <div className="flex justify-center gap-2 mb-6">
        {[
          { id: 'overview', label: 'Overview', icon: '📊' },
          { id: 'byState', label: 'By State', icon: '🗺️' },
          { id: 'forecast', label: 'Forecast', icon: '📈' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setViewTab(tab.id as ViewTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewTab === tab.id
                ? 'bg-fountain-dark text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">Provider Type:</label>
            <select
              value={providerType}
              onChange={e => setProviderType(e.target.value as ProviderType)}
              className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
            >
              <option value="Both">Both (MD + NP)</option>
              <option value="MD">MD Only</option>
              <option value="NP">NP Only</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={includeDea}
              onChange={e => setIncludeDea(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-fountain-dark focus:ring-fountain-dark"
            />
            Include DEA ({formatCurrency(DEA_COSTS.annualEquivalent)}/yr)
          </label>

          {viewTab === 'forecast' && (
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-400">Forecast:</label>
              <select
                value={forecastYears}
                onChange={e => setForecastYears(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200"
              >
                <option value={1}>1 Year</option>
                <option value={2}>2 Years</option>
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Overview Tab */}
      {viewTab === 'overview' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-3xl font-bold text-fountain-trt">
                {operationalTotals.stateCount}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active States</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-bold text-fountain-dark dark:text-white">
                {formatCurrency(operationalTotals.totalAnnual)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Annual Total</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-bold text-fountain-planning">
                {formatCurrency(operationalTotals.avgPerState)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">Avg per State</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="text-2xl sm:text-3xl font-bold text-fountain-glp">
                {formatCurrency(DEA_COSTS.renewalFee)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">DEA (3yr)</div>
            </div>
          </div>

          {/* Fee Ranges */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-fountain-dark dark:text-white mb-4">Annual Fee Ranges</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* MD Fees */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MD License (Annual)</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Avg: {formatCurrency(costStats.md.avg)}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-red-400 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{costStats.md.minState}: {formatCurrency(costStats.md.min)}</span>
                  <span>{costStats.md.maxState}: {formatCurrency(costStats.md.max)}</span>
                </div>
              </div>

              {/* NP Fees */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">NP License (Annual)</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Avg: {formatCurrency(costStats.np.avg)}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-red-400 rounded-full"
                    style={{ width: '100%' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span>{costStats.np.minState}: {formatCurrency(costStats.np.min)}</span>
                  <span>{costStats.np.maxState}: {formatCurrency(costStats.np.max)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Most/Least Expensive */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-red-600 dark:text-red-400 mb-3 text-sm">Most Expensive States</h4>
              <div className="space-y-2">
                {sortedStateCosts.slice(0, 5).map((state, idx) => (
                  <div key={state.stateId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 mr-2">{idx + 1}.</span>
                      {state.stateLabel}
                    </span>
                    <span className="text-sm font-medium text-red-600 dark:text-red-400">
                      {formatCurrency(state.annualCost)}/yr
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
              <h4 className="font-semibold text-green-600 dark:text-green-400 mb-3 text-sm">Least Expensive States</h4>
              <div className="space-y-2">
                {[...sortedStateCosts].reverse().slice(0, 5).map((state, idx) => (
                  <div key={state.stateId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 mr-2">{idx + 1}.</span>
                      {state.stateLabel}
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(state.annualCost)}/yr
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* By State Tab */}
      {viewTab === 'byState' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th
                    onClick={() => toggleSort('state')}
                    className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    State {sortBy === 'state' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    MD (Annual)
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    NP (Annual)
                  </th>
                  {includeDea && (
                    <th className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                      DEA
                    </th>
                  )}
                  <th
                    onClick={() => toggleSort('cost')}
                    className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Total {sortBy === 'cost' && (sortDir === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sortedStateCosts.map(state => (
                  <tr
                    key={state.stateId}
                    className={`${
                      state.isOperational
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-gray-50 dark:bg-gray-800/50 opacity-60'
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-800 dark:text-gray-200 font-medium">
                      {state.stateLabel}
                      {state.notes && (
                        <span className="ml-2 text-xs text-gray-400" title={state.notes}>
                          ⓘ
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {formatCurrency(state.mdAnnual)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                      {formatCurrency(state.npAnnual)}
                    </td>
                    {includeDea && (
                      <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">
                        {formatCurrency(state.deaAnnual)}
                      </td>
                    )}
                    <td className="px-4 py-3 text-right font-semibold text-fountain-dark dark:text-white">
                      {formatCurrency(state.annualCost)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {state.isOperational ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                          Inactive
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-fountain-dark/5 dark:bg-fountain-dark/20">
                <tr>
                  <td className="px-4 py-3 font-semibold text-fountain-dark dark:text-white">
                    Total (Active States)
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    {formatCurrency(
                      stateCosts
                        .filter(s => s.isOperational)
                        .reduce((sum, s) => sum + s.mdAnnual, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                    {formatCurrency(
                      stateCosts
                        .filter(s => s.isOperational)
                        .reduce((sum, s) => sum + s.npAnnual, 0)
                    )}
                  </td>
                  {includeDea && (
                    <td className="px-4 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">
                      {formatCurrency(
                        stateCosts
                          .filter(s => s.isOperational)
                          .reduce((sum, s) => sum + s.deaAnnual, 0)
                      )}
                    </td>
                  )}
                  <td className="px-4 py-3 text-right font-bold text-fountain-dark dark:text-white text-base">
                    {formatCurrency(operationalTotals.totalAnnual)}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                    {operationalTotals.stateCount} states
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Forecast Tab */}
      {viewTab === 'forecast' && (
        <div className="space-y-6">
          {/* Forecast Summary */}
          <div className="bg-gradient-to-br from-fountain-dark to-fountain-dark/80 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">
              {forecastYears}-Year Cost Projection
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <div className="text-3xl font-bold">
                  {formatCurrency(operationalTotals.totalForecast)}
                </div>
                <div className="text-sm text-white/70 mt-1">Total Projected Cost</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {formatCurrency(operationalTotals.totalAnnual)}
                </div>
                <div className="text-sm text-white/70 mt-1">Per Year</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {formatCurrency(Math.round(operationalTotals.totalAnnual / 12))}
                </div>
                <div className="text-sm text-white/70 mt-1">Per Month</div>
              </div>
            </div>
          </div>

          {/* Year-by-Year Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-fountain-dark dark:text-white mb-4">Year-by-Year Breakdown</h3>
            <div className="space-y-3">
              {Array.from({ length: forecastYears }, (_, i) => i + 1).map(year => (
                <div key={year} className="flex items-center gap-4">
                  <div className="w-20 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Year {year}
                  </div>
                  <div className="flex-1 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-fountain-trt rounded-lg transition-all duration-500"
                      style={{ width: `${100 / forecastYears}%`, marginLeft: `${((year - 1) / forecastYears) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                      {formatCurrency(operationalTotals.totalAnnual)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Total ({forecastYears} years)</span>
              <span className="text-xl font-bold text-fountain-dark dark:text-white">
                {formatCurrency(operationalTotals.totalForecast)}
              </span>
            </div>
          </div>

          {/* Cost Breakdown by Type */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-fountain-dark dark:text-white mb-4">Cost Breakdown by License Type</h3>
            <div className="space-y-4">
              {(providerType === 'MD' || providerType === 'Both') && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">MD Licenses</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(
                        stateCosts.filter(s => s.isOperational).reduce((sum, s) => sum + s.mdAnnual, 0) * forecastYears
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '40%' }} />
                  </div>
                </div>
              )}
              {(providerType === 'NP' || providerType === 'Both') && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">NP Licenses</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(
                        stateCosts.filter(s => s.isOperational).reduce((sum, s) => sum + s.npAnnual, 0) * forecastYears
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
              )}
              {includeDea && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">DEA Registrations</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {formatCurrency(
                        stateCosts.filter(s => s.isOperational).reduce((sum, s) => sum + s.deaAnnual, 0) * forecastYears
                      )}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '30%' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-xs text-amber-800 dark:text-amber-200">
          <strong>Disclaimer:</strong> Fee data compiled from public state medical and nursing board sources (April 2026).
          Fees are subject to change. This tool provides estimates only — verify with individual state boards for current rates.
          Does not include additional costs like CME, background checks, or expedited processing fees.
        </p>
      </div>
    </div>
  );
}
