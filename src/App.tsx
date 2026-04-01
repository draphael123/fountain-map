import { useState, useEffect, Suspense, lazy } from 'react';
import { Header, type ViewMode } from './components/Header';
import { ExpansionBanner } from './components/ExpansionBanner';
import { MultiServiceMap } from './components/MultiServiceMap';
import { Footer } from './components/Footer';
import { UpdateBanner } from './components/UpdateBanner';
import { CheckMyState } from './components/CheckMyState';
import { MobileStateSelector } from './components/MobileStateSelector';
import { MapSkeleton } from './components/MapSkeleton';
import { ProviderAuthorityMap } from './components/ProviderAuthorityMap';
import { RegionalSummary } from './components/RegionalSummary';
import { Statistics } from './components/Statistics';
import { StateComparison } from './components/StateComparison';
import { Licensing, type LicensingMapType, LICENSING_MAPS } from './components/Licensing';
import { ThemeProvider } from './context/ThemeContext';
import { ServiceType } from './data/serviceAvailability';

// Lazy load the map for better initial load performance
const USMap = lazy(() => import('./components/USMap').then(module => ({ default: module.USMap })));

function AppContent() {
  const [selectedService, setSelectedService] = useState<ServiceType>('TRT');
  const [checkMyStateOpen, setCheckMyStateOpen] = useState(false);
  const [preSelectedState, setPreSelectedState] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [licensingMap, setLicensingMap] = useState<LicensingMapType>('csr');

  // Keyboard shortcut: / opens Check My State (when not in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName ?? '');
        if (!isInput) {
          e.preventDefault();
          setCheckMyStateOpen(true);
          setPreSelectedState(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle URL parameters for shareable links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceParam = params.get('service')?.toUpperCase();
    const stateParam = params.get('state')?.toUpperCase();
    const viewParam = params.get('view');
    const mapParam = params.get('map')?.toLowerCase();

    if (serviceParam && ['TRT', 'HRT', 'GLP', 'PLANNING', 'ASYNC'].includes(serviceParam)) {
      setSelectedService(
        serviceParam === 'PLANNING' ? 'Planning' :
        serviceParam === 'ASYNC' ? 'Async' :
        serviceParam as ServiceType
      );
    }

    if (viewParam && ['single', 'multi', 'provider', 'stats', 'compare', 'licensing'].includes(viewParam)) {
      setViewMode(viewParam as ViewMode);
    }

    // Handle licensing map parameter
    if (mapParam && LICENSING_MAPS.some(m => m.id === mapParam)) {
      setLicensingMap(mapParam as LicensingMapType);
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
    // Clear map param when leaving licensing view
    if (mode !== 'licensing') {
      url.searchParams.delete('map');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleLicensingMapChange = (map: LicensingMapType) => {
    setLicensingMap(map);
    const url = new URL(window.location.href);
    url.searchParams.set('map', map);
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
        onSearchClick={() => {
          setCheckMyStateOpen(true);
          setPreSelectedState(null);
        }}
      />
      
      <ExpansionBanner />
      <RegionalSummary />

      <main className="flex-grow py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto view-transition-container">
          {viewMode === 'single' && (
            <div key="single" className="view-transition-item">
              <MobileStateSelector 
                selectedService={selectedService}
                onSelectState={handleCheckState}
              />
              <Suspense fallback={<MapSkeleton />}>
                <USMap 
                  selectedService={selectedService} 
                  onCheckState={handleCheckState}
                />
              </Suspense>
            </div>
          )}
          
          {viewMode === 'multi' && (
            <div key="multi" className="view-transition-item">
              <MultiServiceMap onCheckState={handleCheckState} />
            </div>
          )}

          {viewMode === 'compare' && (
            <div key="compare" className="view-transition-item">
              <StateComparison onCheckState={handleCheckState} />
            </div>
          )}

          {viewMode === 'stats' && (
            <div key="stats" className="view-transition-item">
              <Statistics />
            </div>
          )}

          {viewMode === 'provider' && (
            <div key="provider" className="view-transition-item">
              <ProviderAuthorityMap />
            </div>
          )}

          {viewMode === 'licensing' && (
            <div key="licensing" className="view-transition-item">
              <Licensing
                initialMap={licensingMap}
                onMapChange={handleLicensingMapChange}
              />
            </div>
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

      {/* Update notification banner - shows for 24h after an update */}
      <UpdateBanner />
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
