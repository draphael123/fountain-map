import { useState, useEffect, useMemo } from 'react';
import { 
  US_STATES, 
  SERVICE_INFO, 
  ServiceType,
  isServiceAvailable,
  getServicesForState,
} from '../data/serviceAvailability';

interface CheckMyStateProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedState: string | null;
}

export function CheckMyState({ isOpen, onClose, preSelectedState }: CheckMyStateProps) {
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Set pre-selected state when modal opens
  useEffect(() => {
    if (isOpen && preSelectedState) {
      setSelectedState(preSelectedState);
      setSearchQuery('');
    }
  }, [isOpen, preSelectedState]);

  // Reset when closing
  useEffect(() => {
    if (!isOpen) {
      setSelectedState('');
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter states based on search
  const filteredStates = useMemo(() => {
    if (!searchQuery) return US_STATES;
    const query = searchQuery.toLowerCase();
    return US_STATES.filter(
      state => 
        state.name.toLowerCase().includes(query) || 
        state.id.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Get services for selected state (excluding Planning)
  const stateServices = useMemo(() => {
    if (!selectedState) return null;
    const stateName = US_STATES.find(s => s.id === selectedState)?.name || selectedState;
    const services = (['TRT', 'HRT', 'GLP'] as ServiceType[]).map(service => ({
      service,
      info: SERVICE_INFO[service],
      available: isServiceAvailable(selectedState, service),
    }));
    const availableCount = services.filter(s => s.available).length;
    return { stateName, services, availableCount, totalServices: services.length };
  }, [selectedState]);

  // Generate shareable link
  const shareableLink = selectedState 
    ? `${window.location.origin}${window.location.pathname}?state=${selectedState}`
    : '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareableLink);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-modal-in">
        {/* Header */}
        <div className="bg-fountain-dark text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Check My State</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-300 mt-1">
            See all Fountain services available in your state
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Search/Select State */}
          {!selectedState ? (
            <div>
              {/* Search Input */}
              <div className="relative mb-4">
                <svg 
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for your state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-fountain-dark dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-fountain-trt focus:outline-none transition-colors"
                  autoFocus
                />
              </div>

              {/* States List */}
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {filteredStates.map(state => {
                  const availableServices = getServicesForState(state.id).filter(s => s !== 'Planning');
                  return (
                    <button
                      key={state.id}
                      onClick={() => setSelectedState(state.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div>
                        <span className="font-medium text-fountain-dark dark:text-white">{state.name}</span>
                        <span className="text-gray-400 dark:text-gray-500 ml-2">({state.id})</span>
                      </div>
                      <div className="flex gap-1">
                        {availableServices.length > 0 ? (
                          availableServices.map(service => (
                            <span
                              key={service}
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: SERVICE_INFO[service].color }}
                            />
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">Coming soon</span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {filteredStates.length === 0 && (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">No states found</p>
                )}
              </div>
            </div>
          ) : stateServices && (
            <div>
              {/* Selected State Header */}
              <div className="text-center mb-6">
                <button
                  onClick={() => setSelectedState('')}
                  className="text-sm text-fountain-trt hover:underline mb-2 inline-flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Choose different state
                </button>
                <h3 className="text-2xl font-bold text-fountain-dark dark:text-white">{stateServices.stateName}</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {stateServices.availableCount} of {stateServices.totalServices} services available
                </p>
              </div>

              {/* Services List */}
              <div className="space-y-3">
                {stateServices.services.map(({ service, info, available }) => (
                  <div
                    key={service}
                    className={`
                      p-4 rounded-xl border-2 transition-all
                      ${available 
                        ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${info.color}20` }}
                        >
                          <img 
                            src="/fountain-logo.png" 
                            alt="" 
                            className="h-5 w-auto"
                            style={{ filter: 'brightness(0)' }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-fountain-dark dark:text-white">
                            Fountain<span style={{ color: info.color }}>{info.name}</span>
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{info.shortDescription}</div>
                        </div>
                      </div>
                      <div className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${available 
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }
                      `}>
                        {available ? '✓ Available' : 'Coming Soon'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Share Link */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Share this result:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareableLink}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 truncate"
                  />
                  <button
                    onClick={copyShareLink}
                    className="px-4 py-2 bg-fountain-trt text-fountain-dark rounded-lg font-medium text-sm hover:bg-teal-300 dark:hover:bg-teal-400 transition-colors"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

