import { ServiceType, SERVICE_INFO } from '../data/serviceAvailability';

interface ServiceQuickLinksProps {
  selectedService: ServiceType;
}

// Service-specific URLs (replace with actual Fountain URLs)
const SERVICE_URLS: Record<Exclude<ServiceType, 'Planning'>, { learnMore: string; getStarted: string }> = {
  TRT: {
    learnMore: 'https://www.fountaintrt.com',
    getStarted: 'https://www.fountaintrt.com/get-started',
  },
  HRT: {
    learnMore: 'https://www.fountainhrt.com',
    getStarted: 'https://www.fountainhrt.com/get-started',
  },
  GLP: {
    learnMore: 'https://www.fountainglp.com',
    getStarted: 'https://www.fountainglp.com/get-started',
  },
};

export function ServiceQuickLinks({ selectedService }: ServiceQuickLinksProps) {
  // Don't show for Planning
  if (selectedService === 'Planning') return null;

  const serviceInfo = SERVICE_INFO[selectedService];
  const urls = SERVICE_URLS[selectedService];

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 px-4">
      <a
        href={urls.learnMore}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg group"
        style={{ 
          borderColor: serviceInfo.color,
          color: serviceInfo.color,
        }}
      >
        <svg 
          className="w-5 h-5 transition-transform group-hover:scale-110" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Learn More About {serviceInfo.name}
      </a>
      
      <a
        href={urls.getStarted}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group"
        style={{ backgroundColor: serviceInfo.color }}
      >
        <svg 
          className="w-5 h-5 transition-transform group-hover:translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        Get Started Today
      </a>
    </div>
  );
}


