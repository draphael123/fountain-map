import { useState, useEffect, useRef, useCallback } from 'react';
import { US_STATES } from '../data/serviceAvailability';
import { ProviderLicensingData, loadProviderLicensingData } from '../data/providerAuthority';
import { generateCompliancePDF, generateBulkExportCSV, generateBulkExportJSON } from '../utils/pdfExport';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStates?: string[];
  initialProviders?: string[];
}

type ExportFormat = 'csv' | 'json' | 'pdf';

export function ExportModal({ isOpen, onClose, initialStates = [], initialProviders = [] }: ExportModalProps) {
  const [providerData, setProviderData] = useState<ProviderLicensingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>(initialStates);
  const [selectedProviders, setSelectedProviders] = useState<string[]>(initialProviders);
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [stateSearch, setStateSearch] = useState('');
  const [providerSearch, setProviderSearch] = useState('');
  const [includeServices, setIncludeServices] = useState(true);
  const [reportTitle, setReportTitle] = useState('Compliance Report');
  const modalRef = useRef<HTMLDivElement>(null);

  // Load provider data
  useEffect(() => {
    if (isOpen && !providerData) {
      setLoading(true);
      loadProviderLicensingData()
        .then(data => {
          setProviderData(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, providerData]);

  // Reset state when initial values change
  useEffect(() => {
    if (isOpen) {
      setSelectedStates(initialStates);
      setSelectedProviders(initialProviders);
    }
  }, [isOpen, initialStates, initialProviders]);

  // Handle click outside
  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleClickOutside]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Filter states
  const filteredStates = US_STATES.filter(s =>
    s.name.toLowerCase().includes(stateSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(stateSearch.toLowerCase())
  );

  // Filter providers
  const filteredProviders = (providerData?.providers || []).filter(p =>
    p.toLowerCase().includes(providerSearch.toLowerCase())
  );

  // Toggle state selection
  const toggleState = (stateId: string) => {
    setSelectedStates(prev =>
      prev.includes(stateId)
        ? prev.filter(s => s !== stateId)
        : [...prev, stateId]
    );
  };

  // Toggle provider selection
  const toggleProvider = (provider: string) => {
    setSelectedProviders(prev =>
      prev.includes(provider)
        ? prev.filter(p => p !== provider)
        : [...prev, provider]
    );
  };

  // Select/deselect all states
  const selectAllStates = () => {
    if (selectedStates.length === US_STATES.length) {
      setSelectedStates([]);
    } else {
      setSelectedStates(US_STATES.map(s => s.id));
    }
  };

  // Select/deselect all providers
  const selectAllProviders = () => {
    if (!providerData) return;
    if (selectedProviders.length === providerData.providers.length) {
      setSelectedProviders([]);
    } else {
      setSelectedProviders([...providerData.providers]);
    }
  };

  // Handle export
  const handleExport = async () => {
    if (!providerData || selectedStates.length === 0) return;

    setExporting(true);
    try {
      if (format === 'pdf') {
        generateCompliancePDF({
          title: reportTitle,
          states: selectedStates,
          providers: selectedProviders.length > 0 ? selectedProviders : undefined,
          includeServiceStatus: includeServices,
        }, providerData);
      } else if (format === 'csv') {
        generateBulkExportCSV({
          states: selectedStates,
          providers: selectedProviders,
          format: 'csv',
          includeServices,
        }, providerData);
      } else {
        generateBulkExportJSON({
          states: selectedStates,
          providers: selectedProviders,
          format: 'json',
          includeServices,
        }, providerData);
      }
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" aria-hidden="true" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-label="Export Data"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-fountain-dark dark:text-white">Export Data</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fountain-dark" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Format Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Export Format
                  </label>
                  <div className="flex gap-2">
                    {(['csv', 'json', 'pdf'] as ExportFormat[]).map(f => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          format === f
                            ? 'bg-fountain-dark text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PDF Title */}
                {format === 'pdf' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Report Title
                    </label>
                    <input
                      type="text"
                      value={reportTitle}
                      onChange={e => setReportTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="Enter report title..."
                    />
                  </div>
                )}

                {/* State Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      States ({selectedStates.length} selected)
                    </label>
                    <button
                      onClick={selectAllStates}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      {selectedStates.length === US_STATES.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={stateSearch}
                    onChange={e => setStateSearch(e.target.value)}
                    placeholder="Search states..."
                    className="w-full px-3 py-2 mb-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <div className="h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                    <div className="flex flex-wrap gap-1">
                      {filteredStates.map(state => (
                        <button
                          key={state.id}
                          onClick={() => toggleState(state.id)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            selectedStates.includes(state.id)
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {state.id}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Provider Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Providers ({selectedProviders.length} selected, empty = all)
                    </label>
                    <button
                      onClick={selectAllProviders}
                      className="text-xs text-teal-600 dark:text-teal-400 hover:underline"
                    >
                      {selectedProviders.length === providerData?.providers.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={providerSearch}
                    onChange={e => setProviderSearch(e.target.value)}
                    placeholder="Search providers..."
                    className="w-full px-3 py-2 mb-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <div className="h-32 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                    <div className="flex flex-wrap gap-1">
                      {filteredProviders.map(provider => (
                        <button
                          key={provider}
                          onClick={() => toggleProvider(provider)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            selectedProviders.includes(provider)
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200'
                          }`}
                        >
                          {provider}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeServices}
                      onChange={e => setIncludeServices(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Include active services
                    </span>
                  </label>
                </div>

                {/* Preview */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Export Preview:</strong>
                    <ul className="mt-1 space-y-1">
                      <li>• {selectedStates.length} state{selectedStates.length !== 1 ? 's' : ''}</li>
                      <li>• {selectedProviders.length || 'All'} provider{selectedProviders.length !== 1 ? 's' : ''}</li>
                      <li>• Format: {format.toUpperCase()}</li>
                      {includeServices && <li>• Including service availability</li>}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={selectedStates.length === 0 || exporting || loading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-fountain-dark text-white hover:bg-fountain-dark/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Exporting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export {format.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
