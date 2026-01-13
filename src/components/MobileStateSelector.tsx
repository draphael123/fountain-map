import { useState } from 'react';
import { 
  US_STATES, 
  ServiceType,
  getServicesForState,
} from '../data/serviceAvailability';

interface MobileStateSelectorProps {
  selectedService: ServiceType;
  onSelectState: (stateId: string) => void;
}

export function MobileStateSelector({ selectedService, onSelectState }: MobileStateSelectorProps) {
  const [selectedState, setSelectedState] = useState('');

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = e.target.value;
    setSelectedState(stateId);
    if (stateId) {
      onSelectState(stateId);
    }
  };

  return (
    <div className="sm:hidden mb-6 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 shadow-sm">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          📱 Mobile? Select your state:
        </label>
        <select
          value={selectedState}
          onChange={handleStateChange}
          className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-fountain-dark dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-fountain-trt"
        >
          <option value="">Choose a state...</option>
          {US_STATES.sort((a, b) => a.name.localeCompare(b.name)).map(state => {
            const services = getServicesForState(state.id);
            const hasCurrentService = services.some(s => s === selectedService);
            return (
              <option key={state.id} value={state.id}>
                {state.name} ({state.id}) {hasCurrentService ? '✓' : ''}
              </option>
            );
          })}
        </select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Tap to see all services available in your state
        </p>
      </div>
    </div>
  );
}

