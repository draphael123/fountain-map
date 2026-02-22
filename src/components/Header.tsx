import { ServiceType, SERVICE_INFO } from '../data/serviceAvailability';
import { ThemeToggle } from './ThemeToggle';

type ViewMode = 'single' | 'multi' | 'provider';

interface HeaderProps {
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function Header({ selectedService, onServiceChange, viewMode, onViewModeChange }: HeaderProps) {
  const services: ServiceType[] = ['TRT', 'HRT', 'GLP', 'Planning'];

  return (
    <header className="bg-fountain-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top branding bar */}
        <div className="py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1" />
            <div className="flex items-center justify-center">
              <img 
                src="/fountain-logo.png" 
                alt="Fountain Vitality" 
                className="h-8 sm:h-10 w-auto"
              />
            </div>
            <div className="flex-1 flex justify-end">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="py-3 border-b border-white/10">
          <div className="flex justify-center gap-1 sm:gap-2">
            {[
              { id: 'single', label: 'Service Map', icon: '🗺️' },
              { id: 'multi', label: 'Coverage', icon: '📊' },
              { id: 'provider', label: 'Provider Authority Map', icon: '👤' },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => onViewModeChange(id as ViewMode)}
                className={`
                  px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${viewMode === id 
                    ? 'bg-white text-fountain-dark' 
                    : 'text-gray-300 hover:bg-white/10'
                  }
                `}
              >
                <span className="hidden sm:inline">{icon} </span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Service filter tabs - only show for single service view */}
        {viewMode === 'single' && (
          <nav className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">
                Select Service:
              </span>
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                {services.map((service) => {
                  const info = SERVICE_INFO[service];
                  const isSelected = selectedService === service;
                  
                  return (
                    <button
                      key={service}
                      onClick={() => onServiceChange(service)}
                      className={`
                        group flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full
                        transition-all duration-300 ease-out
                        ${isSelected 
                          ? 'bg-white shadow-lg scale-105' 
                          : 'bg-white/10 hover:bg-white/20'
                        }
                      `}
                      style={{
                        boxShadow: isSelected ? `0 4px 20px ${info.color}40` : undefined,
                      }}
                    >
                      <span className={`
                        font-semibold text-xs sm:text-sm tracking-wide
                        ${isSelected ? 'text-fountain-dark' : 'text-white'}
                      `}>
                        <span 
                          style={{ color: info.color }}
                          className="font-bold"
                        >
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
