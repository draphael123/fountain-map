import { useState, useEffect } from 'react';
import { Header, type ViewMode } from './components/Header';
import { Footer } from './components/Footer';
import { UpdateBanner } from './components/UpdateBanner';
import { CheckMyState } from './components/CheckMyState';
import { Licensing, type LicensingMapType, LICENSING_MAPS } from './components/Licensing';
import { ThemeProvider } from './context/ThemeContext';
import { ChangelogPanel } from './components/ChangelogPanel';
import { ExportModal } from './components/ExportModal';
import { RNLicensingMap } from './components/RNLicensingMap';
import { OfficeLocationsMap } from './components/OfficeLocationsMap';

function AppContent() {
  const [checkMyStateOpen, setCheckMyStateOpen] = useState(false);
  const [preSelectedState, setPreSelectedState] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('licensing');
  const [licensingMap, setLicensingMap] = useState<LicensingMapType>('csr');
  const [changelogOpen, setChangelogOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

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
    const stateParam = params.get('state')?.toUpperCase();
    let viewParam = params.get('view')?.toLowerCase() ?? '';
    let mapParam = params.get('map')?.toLowerCase();

    if (viewParam === 'provider') {
      setViewMode('licensing');
      setLicensingMap('provider-authority');
      const url = new URL(window.location.href);
      url.searchParams.set('view', 'licensing');
      url.searchParams.set('map', 'provider-authority');
      window.history.replaceState({}, '', url.toString());
      viewParam = 'licensing';
      mapParam = 'provider-authority';
    }

    if (viewParam && ['licensing', 'rn-licensing', 'offices'].includes(viewParam)) {
      setViewMode(viewParam as ViewMode);
    }

    if (mapParam && LICENSING_MAPS.some((m) => m.id === mapParam)) {
      setLicensingMap(mapParam as LicensingMapType);
    }

    if (stateParam) {
      setPreSelectedState(stateParam);
      setCheckMyStateOpen(true);
    }
  }, []);

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    const url = new URL(window.location.href);
    url.searchParams.set('view', mode);
    if (mode !== 'licensing') {
      url.searchParams.delete('map');
      url.searchParams.delete('csrCategory');
      url.searchParams.delete('csrProvider');
    }
    window.history.replaceState({}, '', url.toString());
  };

  const handleLicensingMapChange = (map: LicensingMapType) => {
    setLicensingMap(map);
    const url = new URL(window.location.href);
    url.searchParams.set('map', map);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors">
      <Header
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onSearchClick={() => {
          setCheckMyStateOpen(true);
          setPreSelectedState(null);
        }}
        onChangelogClick={() => setChangelogOpen(true)}
      />

      <main className="flex-grow py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto view-transition-container">
          {viewMode === 'licensing' && (
            <div key="licensing" className="view-transition-item">
              <Licensing
                initialMap={licensingMap}
                onMapChange={handleLicensingMapChange}
              />
            </div>
          )}

          {viewMode === 'rn-licensing' && (
            <div key="rn-licensing" className="view-transition-item px-4">
              <div className="text-center mb-6">
                <h1 className="text-3xl lg:text-4xl font-bold text-fountain-dark dark:text-white">RN Licensing</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Track RN license status and expiration dates by state</p>
              </div>
              <RNLicensingMap />
            </div>
          )}

          {viewMode === 'offices' && (
            <div key="offices" className="view-transition-item px-4">
              <OfficeLocationsMap />
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

      {/* Changelog Panel */}
      <ChangelogPanel
        isOpen={changelogOpen}
        onClose={() => setChangelogOpen(false)}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
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
