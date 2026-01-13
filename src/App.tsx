import { useState } from 'react';
import { Header } from './components/Header';
import { USMap } from './components/USMap';
import { Footer } from './components/Footer';
import { ServiceType } from './data/serviceAvailability';

function App() {
  const [selectedService, setSelectedService] = useState<ServiceType>('TRT');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header 
        selectedService={selectedService} 
        onServiceChange={setSelectedService} 
      />
      
      <main className="flex-grow py-8 sm:py-12 lg:py-16">
        <div className="max-w-7xl mx-auto">
          <USMap selectedService={selectedService} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;

