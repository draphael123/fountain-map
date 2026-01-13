import { FountainIcon } from './FountainIcon';
import { SERVICE_INFO, ServiceType } from '../data/serviceAvailability';

export function Footer() {
  const services: ServiceType[] = ['TRT', 'HRT', 'GLP'];

  return (
    <footer className="bg-fountain-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
              <FountainIcon color="#ffffff" size={28} />
              <span className="text-xl font-semibold">
                Fountain<span className="text-fountain-trt">Health</span>
              </span>
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
            <p className="text-gray-400 text-sm mb-4">
              Check if our services are available in your state and start your wellness journey today.
            </p>
            <a 
              href="#" 
              className="inline-flex items-center gap-2 bg-fountain-trt text-fountain-dark px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-teal-300 transition-colors"
            >
              Learn More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Fountain Health. All rights reserved. 
            Service availability subject to state regulations.
          </p>
        </div>
      </div>
    </footer>
  );
}

