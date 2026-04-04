import { useState, useRef, useEffect } from 'react';
import { ServiceType, SERVICE_INFO, getServiceColor } from '../data/serviceAvailability';
import { ThemeToggle } from './ThemeToggle';
import { PrintButton } from './PrintButton';
import { ColorblindToggle } from './ColorblindToggle';
import { useTheme } from '../context/ThemeContext';

export type ViewMode = 'single' | 'multi' | 'stats' | 'compare' | 'licensing';

const VIEW_TABS: { id: ViewMode; label: string; shortLabel: string; icon: string }[] = [
  { id: 'single', label: 'Service Map', shortLabel: 'Services', icon: '🗺️' },
  { id: 'multi', label: 'Coverage', shortLabel: 'Coverage', icon: '📊' },
  { id: 'compare', label: 'Compare States', shortLabel: 'Compare', icon: '⚖️' },
  { id: 'stats', label: 'Statistics', shortLabel: 'Stats', icon: '📈' },
  { id: 'licensing', label: 'Licensing', shortLabel: 'Licensing', icon: '📋' },
];

const PRIMARY_TAB_IDS = new Set<ViewMode>(['single', 'multi', 'licensing']);

interface HeaderProps {
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchClick?: () => void;
}

export function Header({ selectedService, onServiceChange, viewMode, onViewModeChange, onSearchClick }: HeaderProps) {
  const services: ServiceType[] = ['TRT', 'HRT', 'GLP', 'Async', 'Planning'];
  const { colorblindMode } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    if (moreOpen) {
      document.addEventListener('mousedown', handle);
    }
    return () => document.removeEventListener('mousedown', handle);
  }, [moreOpen]);

  const overflowActive = viewMode === 'compare' || viewMode === 'stats';
  const primaryTabs = VIEW_TABS.filter((t) => PRIMARY_TAB_IDS.has(t.id));
  const overflowTabs = VIEW_TABS.filter((t) => !PRIMARY_TAB_IDS.has(t.id));

  const renderTabButton = (t: (typeof VIEW_TABS)[0], compact?: boolean) => (
    <button
      key={t.id}
      type="button"
      onClick={() => {
        onViewModeChange(t.id);
        setMoreOpen(false);
      }}
      className={`
        px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0
        ${viewMode === t.id ? 'bg-white text-fountain-dark' : 'text-gray-300 hover:bg-white/10'}
        ${compact ? 'w-full text-left rounded-md' : ''}
      `}
    >
      <span className="sm:hidden">{t.icon} {t.shortLabel}</span>
      <span className="hidden sm:inline">{t.icon} {t.label}</span>
    </button>
  );

  return (
    <header className="bg-fountain-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex items-center justify-center">
              <img src="/fountain-logo.png" alt="Fountain Vitality" className="h-8 sm:h-10 w-auto" />
            </div>
            <div className="flex-1 flex justify-end items-center gap-2">
              {onSearchClick && (
                <button
                  type="button"
                  onClick={onSearchClick}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
                  title="Search state (/)"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">Search state</span>
                  <kbd className="hidden sm:inline px-1.5 py-0.5 text-xs bg-white/10 rounded">/</kbd>
                </button>
              )}
              <ColorblindToggle />
              <PrintButton />
              <ThemeToggle />
            </div>
          </div>
        </div>

        <div className="py-3 border-b border-white/10">
          {/* lg+: all tabs in one row */}
          <div className="hidden lg:flex justify-center gap-1 sm:gap-2 flex-wrap">
            {VIEW_TABS.map((t) => renderTabButton(t))}
          </div>

          {/* Narrow screens: primary tabs + More (Compare, Stats) */}
          <div className="lg:hidden">
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex justify-start gap-1 min-w-max sm:min-w-0">
                {primaryTabs.map((t) => renderTabButton(t))}
                <div className="relative flex-shrink-0" ref={moreRef}>
                  <button
                    type="button"
                    onClick={() => setMoreOpen((o) => !o)}
                    className={`
                      px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap
                      ${overflowActive ? 'bg-white/20 text-white ring-1 ring-white/30' : 'text-gray-300 hover:bg-white/10'}
                    `}
                    aria-expanded={moreOpen}
                    aria-haspopup="true"
                  >
                    More <span className="text-xs opacity-80">▾</span>
                  </button>
                  {moreOpen && (
                    <div
                      className="absolute right-0 mt-1 py-1 min-w-[200px] rounded-lg bg-white text-fountain-dark shadow-xl border border-gray-200 z-[100]"
                      role="menu"
                    >
                      {overflowTabs.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            onViewModeChange(t.id);
                            setMoreOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-100 flex items-center gap-2 ${
                            viewMode === t.id ? 'bg-teal-50 font-semibold' : ''
                          }`}
                        >
                          <span>{t.icon}</span>
                          <span>{t.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-center mt-1 sm:hidden">
              <span className="text-xs text-gray-500">Swipe — Compare &amp; Stats are under More</span>
            </div>
          </div>
        </div>

        {viewMode === 'single' && (
          <nav className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">Select Service:</span>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {services.map((service) => {
                  const info = SERVICE_INFO[service];
                  const serviceColor = getServiceColor(service, colorblindMode);
                  const isSelected = selectedService === service;

                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => onServiceChange(service)}
                      className={`
                        group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full
                        transition-all duration-300 ease-out service-switch-transition
                        ${isSelected ? 'bg-white shadow-lg scale-105' : 'bg-white/10 hover:bg-white/20'}
                      `}
                      style={{
                        boxShadow: isSelected ? `0 4px 20px ${serviceColor}40` : undefined,
                      }}
                    >
                      <span
                        className={`
                        font-semibold text-xs sm:text-sm tracking-wide
                        ${isSelected ? 'text-fountain-dark' : 'text-white'}
                      `}
                      >
                        <span style={{ color: serviceColor }} className="font-bold">
                          {info.name}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
