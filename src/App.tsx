import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { USMap } from './components/USMap';
import { MultiServiceMap } from './components/MultiServiceMap';
import { Statistics } from './components/Statistics';
import { FAQ } from './components/FAQ';
import { Footer } from './components/Footer';
import { CheckMyState } from './components/CheckMyState';
import { MobileStateSelector } from './components/MobileStateSelector';
import { ThemeProvider } from './context/ThemeContext';
import { ServiceType } from './data/serviceAvailability';

type ViewMode = 'single' | 'multi' | 'stats' | 'faq';

function AppContent() {
  const [selectedService, setSelectedService] = useState<ServiceType>('TRT');
  const [checkMyStateOpen, setCheckMyStateOpen] = useState(false);
  const [preSelectedState, setPreSelectedState] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('single');

  // Handle URL parameters for shareable links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service')?.toUpperCase();
    const stateParam = params.get('state')?.toUpperCase();
    const viewParam = params.get('view');
    
    if (serviceParam && ['TRT', 'HRT', 'GLP', 'PLANNING'].includes(serviceParam)) {
      setSelectedService(serviceParam === 'PLANNING' ? 'Planning' : serviceParam as ServiceType);
    }
    
    if (viewParam && ['single', 'multi', 'stats', 'faq'].includes(viewParam)) {
      setViewMode(viewParam as ViewMode);
    }
    
    if (stateParam) {
      setPreSelectedState(stateParam);
      setCheckMyStateOpen(true);
    }
  }, []);

  // Update URL when service or view changes
  const handleServiceChange = (service: ServiceType) => {
    setSelectedService(service);
    const url = new URL(window.location.href);
    url.searchParams.set('service', service);
    window.history.replaceState({}, '', url.toString());
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    const url = new URL(window.location.href);
    url.searchParams.set('view', mode);
    window.history.replaceState({}, '', url.toString());
  };

  // Handle opening Check My State from state search
  const handleCheckState = (stateId: string) => {
    setPreSelectedState(stateId || null);
    setCheckMyStateOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header 
        selectedService={selectedService} 
        onServiceChange={handleServiceChange}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
      />
      
      <main className="flex-grow py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {viewMode === 'single' && (
            <>
              <MobileStateSelector 
                selectedService={selectedService}
                onSelectState={handleCheckState}
              />
              <USMap 
                selectedService={selectedService} 
                onCheckState={handleCheckState}
              />
            </>
          )}
          
          {viewMode === 'multi' && (
            <MultiServiceMap onCheckState={handleCheckState} />
          )}
          
          {viewMode === 'stats' && (
            <Statistics />
          )}
          
          {viewMode === 'faq' && (
            <FAQ />
          )}
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

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
