import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { USMap } from './components/USMap';
import { Footer } from './components/Footer';
import { CheckMyState } from './components/CheckMyState';
import { ServiceType } from './data/serviceAvailability';

function App() {
  const [selectedService, setSelectedService] = useState<ServiceType>('TRT');
  const [checkMyStateOpen, setCheckMyStateOpen] = useState(false);
  const [preSelectedState, setPreSelectedState] = useState<string | null>(null);

  // Handle URL parameters for shareable links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service')?.toUpperCase();
    const stateParam = params.get('state')?.toUpperCase();
    
    if (serviceParam && ['TRT', 'HRT', 'GLP'].includes(serviceParam)) {
      setSelectedService(serviceParam as ServiceType);
    }
    
    if (stateParam) {
      setPreSelectedState(stateParam);
      setCheckMyStateOpen(true);
    }
  }, []);

  // Update URL when service changes
  const handleServiceChange = (service: ServiceType) => {
    setSelectedService(service);
    const url = new URL(window.location.href);
    url.searchParams.set('service', service);
    window.history.replaceState({}, '', url.toString());
  };

  // Handle opening Check My State from state search
  const handleCheckState = (stateId: string) => {
    setPreSelectedState(stateId);
    setCheckMyStateOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header 
        selectedService={selectedService} 
        onServiceChange={handleServiceChange} 
      />
      
      <main className="flex-grow py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <USMap 
            selectedService={selectedService} 
            onCheckState={handleCheckState}
          />
        </div>
      </main>

      <Footer />

      {/* Check My State Modal */}
      <CheckMyState
        isOpen={checkMyStateOpen}
        onClose={() => {
          setCheckMyStateOpen(false);
          setPreSelectedState(null);
        }}
        preSelectedState={preSelectedState}
      />
    </div>
  );
}

export default App;
