import { SERVICE_INFO, ServiceType } from '../data/serviceAvailability';
import { DATA_LAST_UPDATED } from '../data/dataMeta';

export function Footer() {
  const services: ServiceType[] = ['TRT', 'HRT', 'GLP'];

  return (
    <footer className="bg-fountain-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <img 
                src="/fountain-logo.png" 
                alt="Fountain Vitality" 
                className="h-7 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm">
              Personalized hormone therapy and weight management solutions delivered to your door.
            </p>
          </div>

          {/* Services */}
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-4">Our Services</h3>
            <ul className="space-y-2">
              {services.map(service => (
                <li key={service} className="flex items-center justify-center gap-2">
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: SERVICE_INFO[service].color }}
                  />
                  <span className="text-gray-300 text-sm">
                    {SERVICE_INFO[service].fullName}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-lg mb-4">Get Started</h3>
            <p className="text-gray-400 text-sm">
              Check if our services are available in your state and start your wellness journey today.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center space-y-1">
          <p className="text-gray-400 text-xs">
            Data last updated: {DATA_LAST_UPDATED}
          </p>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Fountain Vitality. All rights reserved.
            Service availability subject to state regulations.
          </p>
        </div>
      </div>
    </footer>
  );
}
