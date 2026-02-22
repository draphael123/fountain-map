import { useState, useEffect } from 'react';
import { SERVICE_INFO, ServiceType } from '../data/serviceAvailability';
import { DATA_LAST_UPDATED, UPDATE_NOTES } from '../data/dataMeta';

interface UpdateInfo {
  lastUpdated: string;
  notes: string[];
}

export function Footer() {
  const services: ServiceType[] = ['TRT', 'HRT', 'GLP'];
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);

  useEffect(() => {
    const fetchUpdateInfo = () => {
      fetch('/update-info.json')
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data?.lastUpdated && Array.isArray(data?.notes)) {
            setUpdateInfo({ lastUpdated: data.lastUpdated, notes: data.notes });
          }
        })
        .catch(() => {});
    };

    fetchUpdateInfo();
    const interval = setInterval(fetchUpdateInfo, 60000); // Refetch every minute
    return () => clearInterval(interval);
  }, []);

  const lastUpdated = updateInfo?.lastUpdated ?? DATA_LAST_UPDATED;
  const notes = updateInfo?.notes ?? UPDATE_NOTES;

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

        {/* Last updated section */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-sm font-semibold text-white mb-2">Website last updated: {lastUpdated}</h3>
          <ul className="text-gray-400 text-xs space-y-1 mb-6">
            {notes.map((note, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-fountain-trt mt-0.5">•</span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/10 text-center">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Fountain Vitality. All rights reserved.
            Service availability subject to state regulations.
          </p>
        </div>
      </div>
    </footer>
  );
}
