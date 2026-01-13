import { ServiceType, SERVICE_INFO } from '../data/serviceAvailability';

interface HeaderProps {
  selectedService: ServiceType;
  onServiceChange: (service: ServiceType) => void;
}

export function Header({ selectedService, onServiceChange }: HeaderProps) {
  const services: ServiceType[] = ['TRT', 'HRT', 'GLP'];

  return (
    <header className="bg-fountain-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top branding bar */}
        <div className="py-4 border-b border-white/10">
          <div className="flex items-center justify-center gap-1">
            <img 
              src="/fountain-logo.png" 
              alt="Fountain" 
              className="h-8 sm:h-10 w-auto brightness-0 invert"
            />
            <span className="text-2xl font-semibold tracking-tight text-fountain-trt">
              Vitality
            </span>
          </div>
        </div>

        {/* Service filter tabs */}
        <nav className="py-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <span className="text-sm text-gray-400 uppercase tracking-wider font-medium">
              Select Service:
            </span>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
              {services.map((service) => {
                const info = SERVICE_INFO[service];
                const isSelected = selectedService === service;
                
                return (
                  <button
                    key={service}
                    onClick={() => onServiceChange(service)}
                    className={`
                      group flex items-center gap-2 px-4 py-2.5 rounded-full
                      transition-all duration-300 ease-out
                      ${isSelected 
                        ? 'bg-white shadow-lg scale-105' 
                        : 'bg-white/10 hover:bg-white/20 hover:scale-102'
                      }
                    `}
                    style={{
                      boxShadow: isSelected ? `0 4px 20px ${info.color}40` : undefined,
                    }}
                  >
                    <img 
                      src="/fountain-logo.png" 
                      alt="" 
                      className={`h-5 w-auto ${isSelected ? '' : 'brightness-0 invert'}`}
                      style={isSelected ? { filter: `brightness(0) saturate(100%)` } : undefined}
                    />
                    <span className={`
                      font-semibold text-sm sm:text-base tracking-wide
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
      </div>
    </header>
  );
}
