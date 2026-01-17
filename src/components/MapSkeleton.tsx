export function MapSkeleton() {
  return (
    <div className="relative w-full animate-pulse">
      {/* Title skeleton */}
      <div className="text-center mb-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64 mx-auto mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mx-auto" />
      </div>

      {/* Search bar skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6 px-4">
        <div className="w-full sm:w-72 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="w-full sm:w-40 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>

      {/* Regional cards skeleton */}
      <div className="max-w-5xl mx-auto mb-6 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i}
              className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16" />
              </div>
              <div className="flex items-end justify-between">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-10" />
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-8" />
              </div>
              <div className="mt-2 h-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Map skeleton */}
      <div className="relative w-full max-w-5xl mx-auto px-2 sm:px-4">
        <div className="bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden aspect-[1.6/1] relative">
          {/* USA outline approximation */}
          <svg 
            viewBox="0 0 960 600" 
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Simplified state shapes as placeholders */}
            <g fill="none" stroke="currentColor" className="text-gray-300 dark:text-gray-600">
              {/* West */}
              <rect x="50" y="120" width="80" height="120" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="130" y="80" width="60" height="100" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="130" y="180" width="60" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="50" y="240" width="80" height="160" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              
              {/* Mountain */}
              <rect x="190" y="60" width="50" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="190" y="140" width="50" height="60" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="190" y="200" width="50" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="190" y="280" width="50" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="240" y="100" width="60" height="60" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="240" y="160" width="60" height="100" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="240" y="260" width="60" height="100" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              
              {/* Midwest */}
              <rect x="300" y="60" width="40" height="40" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="340" y="60" width="40" height="40" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="300" y="100" width="80" height="40" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="300" y="140" width="80" height="50" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="300" y="190" width="80" height="50" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="380" y="80" width="60" height="50" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="380" y="130" width="60" height="50" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="440" y="80" width="60" height="50" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="440" y="130" width="60" height="50" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="500" y="100" width="50" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              
              {/* South */}
              <rect x="300" y="240" width="100" height="180" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="400" y="200" width="60" height="60" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="400" y="260" width="60" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="460" y="200" width="60" height="60" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="460" y="260" width="60" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="520" y="180" width="60" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="520" y="260" width="60" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="580" y="340" width="100" height="100" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              
              {/* Northeast */}
              <rect x="550" y="60" width="60" height="60" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="610" y="40" width="80" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="580" y="120" width="80" height="60" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="660" y="120" width="60" height="60" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="720" y="80" width="30" height="40" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="750" y="60" width="20" height="60" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              
              {/* Alaska & Hawaii placeholders */}
              <rect x="80" y="450" width="120" height="80" rx="4" className="fill-gray-200 dark:fill-gray-700" />
              <rect x="250" y="470" width="80" height="50" rx="4" className="fill-gray-200 dark:fill-gray-700" />
            </g>
          </svg>
          
          {/* Loading text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-full shadow-lg">
              <svg className="animate-spin h-5 w-5 text-fountain-trt" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Loading map...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="flex justify-center gap-6 mt-6 px-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>
      </div>
    </div>
  );
}

