import { SERVICE_INFO, SERVICE_AVAILABILITY, ServiceType } from '../data/serviceAvailability';

// Comparison data for each service (excluding Planning)
const COMPARISON_DATA: Record<Exclude<ServiceType, 'Planning'>, {
  targetAudience: string;
  benefits: string[];
  treatment: string;
  timeline: string;
}> = {
  TRT: {
    targetAudience: 'Men with low testosterone',
    benefits: [
      'Increased energy & vitality',
      'Improved muscle mass',
      'Enhanced mood & focus',
      'Better sleep quality',
    ],
    treatment: 'Testosterone injections or topical applications',
    timeline: 'Results typically seen in 4-6 weeks',
  },
  HRT: {
    targetAudience: 'Women experiencing hormonal imbalance',
    benefits: [
      'Relief from menopause symptoms',
      'Improved bone density',
      'Better sleep & mood',
      'Enhanced skin health',
    ],
    treatment: 'Bioidentical hormone therapy',
    timeline: 'Symptom relief in 2-4 weeks',
  },
  GLP: {
    targetAudience: 'Adults seeking weight management',
    benefits: [
      'Sustainable weight loss',
      'Reduced appetite',
      'Improved blood sugar',
      'Increased energy levels',
    ],
    treatment: 'GLP-1 receptor agonist injections',
    timeline: 'Weight loss begins in 2-4 weeks',
  },
};

export function ServiceComparison() {
  const services: Exclude<ServiceType, 'Planning'>[] = ['TRT', 'HRT', 'GLP'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-fountain-dark dark:text-white mb-3">
          Compare Our Services
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Find the right treatment for your wellness journey. Each service is designed to address specific health needs.
        </p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-4 text-left bg-gray-50 dark:bg-gray-900 w-48">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">Feature</span>
              </th>
              {services.map(service => (
                <th 
                  key={service}
                  className="px-6 py-4 text-center"
                  style={{ backgroundColor: `${SERVICE_INFO[service].color}08` }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${SERVICE_INFO[service].color}20` }}
                    >
                      <span className="text-xl font-bold" style={{ color: SERVICE_INFO[service].color }}>
                        {service === 'TRT' ? '♂' : service === 'HRT' ? '♀' : '⚖'}
                      </span>
                    </div>
                    <span 
                      className="text-lg font-bold"
                      style={{ color: SERVICE_INFO[service].color }}
                    >
                      {SERVICE_INFO[service].fullName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {SERVICE_AVAILABILITY[service].length} states
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Target Audience */}
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Who it's for</span>
              </td>
              {services.map(service => (
                <td key={service} className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {COMPARISON_DATA[service].targetAudience}
                  </span>
                </td>
              ))}
            </tr>

            {/* Benefits */}
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-6 py-4 bg-gray-50 dark:bg-gray-900 align-top">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Key Benefits</span>
              </td>
              {services.map(service => (
                <td key={service} className="px-6 py-4">
                  <ul className="space-y-2">
                    {COMPARISON_DATA[service].benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <svg 
                          className="w-4 h-4 flex-shrink-0" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                          style={{ color: SERVICE_INFO[service].color }}
                        >
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>

            {/* Treatment */}
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Treatment Type</span>
              </td>
              {services.map(service => (
                <td key={service} className="px-6 py-4 text-center">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {COMPARISON_DATA[service].treatment}
                  </span>
                </td>
              ))}
            </tr>

            {/* Timeline */}
            <tr className="border-b border-gray-100 dark:border-gray-700">
              <td className="px-6 py-4 bg-gray-50 dark:bg-gray-900">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Expected Timeline</span>
              </td>
              {services.map(service => (
                <td key={service} className="px-6 py-4 text-center">
                  <span 
                    className="inline-flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full"
                    style={{ 
                      backgroundColor: `${SERVICE_INFO[service].color}15`,
                      color: SERVICE_INFO[service].color 
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {COMPARISON_DATA[service].timeline}
                  </span>
                </td>
              ))}
            </tr>

            {/* CTA Row */}
            <tr>
              <td className="px-6 py-6 bg-gray-50 dark:bg-gray-900"></td>
              {services.map(service => (
                <td key={service} className="px-6 py-6 text-center">
                  <a
                    href={`https://www.fountain${service.toLowerCase()}.com/get-started`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 hover:shadow-lg"
                    style={{ backgroundColor: SERVICE_INFO[service].color }}
                  >
                    Get Started
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {services.map(service => (
          <div 
            key={service}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Card Header */}
            <div 
              className="px-5 py-4 border-b border-gray-100 dark:border-gray-700"
              style={{ backgroundColor: `${SERVICE_INFO[service].color}08` }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${SERVICE_INFO[service].color}20` }}
                >
                  <span className="text-lg font-bold" style={{ color: SERVICE_INFO[service].color }}>
                    {service === 'TRT' ? '♂' : service === 'HRT' ? '♀' : '⚖'}
                  </span>
                </div>
                <div>
                  <h3 
                    className="font-bold"
                    style={{ color: SERVICE_INFO[service].color }}
                  >
                    {SERVICE_INFO[service].fullName}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Available in {SERVICE_AVAILABILITY[service].length} states
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                  Who it's for
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {COMPARISON_DATA[service].targetAudience}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  Key Benefits
                </p>
                <ul className="space-y-1.5">
                  {COMPARISON_DATA[service].benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <svg 
                        className="w-4 h-4 flex-shrink-0" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        style={{ color: SERVICE_INFO[service].color }}
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span 
                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
                  style={{ 
                    backgroundColor: `${SERVICE_INFO[service].color}15`,
                    color: SERVICE_INFO[service].color 
                  }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {COMPARISON_DATA[service].timeline}
                </span>
                
                <a
                  href={`https://www.fountain${service.toLowerCase()}.com/get-started`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold text-white text-sm transition-all hover:scale-105"
                  style={{ backgroundColor: SERVICE_INFO[service].color }}
                >
                  Get Started
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

