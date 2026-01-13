export type ServiceType = 'TRT' | 'HRT' | 'GLP';

export interface StateInfo {
  id: string;
  name: string;
}

// All US states with their abbreviations
export const US_STATES: StateInfo[] = [
  { id: 'AL', name: 'Alabama' },
  { id: 'AK', name: 'Alaska' },
  { id: 'AZ', name: 'Arizona' },
  { id: 'AR', name: 'Arkansas' },
  { id: 'CA', name: 'California' },
  { id: 'CO', name: 'Colorado' },
  { id: 'CT', name: 'Connecticut' },
  { id: 'DE', name: 'Delaware' },
  { id: 'FL', name: 'Florida' },
  { id: 'GA', name: 'Georgia' },
  { id: 'HI', name: 'Hawaii' },
  { id: 'ID', name: 'Idaho' },
  { id: 'IL', name: 'Illinois' },
  { id: 'IN', name: 'Indiana' },
  { id: 'IA', name: 'Iowa' },
  { id: 'KS', name: 'Kansas' },
  { id: 'KY', name: 'Kentucky' },
  { id: 'LA', name: 'Louisiana' },
  { id: 'ME', name: 'Maine' },
  { id: 'MD', name: 'Maryland' },
  { id: 'MA', name: 'Massachusetts' },
  { id: 'MI', name: 'Michigan' },
  { id: 'MN', name: 'Minnesota' },
  { id: 'MS', name: 'Mississippi' },
  { id: 'MO', name: 'Missouri' },
  { id: 'MT', name: 'Montana' },
  { id: 'NE', name: 'Nebraska' },
  { id: 'NV', name: 'Nevada' },
  { id: 'NH', name: 'New Hampshire' },
  { id: 'NJ', name: 'New Jersey' },
  { id: 'NM', name: 'New Mexico' },
  { id: 'NY', name: 'New York' },
  { id: 'NC', name: 'North Carolina' },
  { id: 'ND', name: 'North Dakota' },
  { id: 'OH', name: 'Ohio' },
  { id: 'OK', name: 'Oklahoma' },
  { id: 'OR', name: 'Oregon' },
  { id: 'PA', name: 'Pennsylvania' },
  { id: 'RI', name: 'Rhode Island' },
  { id: 'SC', name: 'South Carolina' },
  { id: 'SD', name: 'South Dakota' },
  { id: 'TN', name: 'Tennessee' },
  { id: 'TX', name: 'Texas' },
  { id: 'UT', name: 'Utah' },
  { id: 'VT', name: 'Vermont' },
  { id: 'VA', name: 'Virginia' },
  { id: 'WA', name: 'Washington' },
  { id: 'WV', name: 'West Virginia' },
  { id: 'WI', name: 'Wisconsin' },
  { id: 'WY', name: 'Wyoming' },
  { id: 'DC', name: 'District of Columbia' },
];

// Service availability data extracted from the source maps
export const SERVICE_AVAILABILITY: Record<ServiceType, string[]> = {
  // FountainTRT - Testosterone Replacement Therapy (Teal states)
  TRT: [
    'WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'UT', 'AZ', 'CO', 'NM',
    'ND', 'MN', 'IA', 'MO', 'WI', 'IL', 'IN', 'MI', 'OH', 'WV',
    'VA', 'NC', 'PA', 'NY', 'ME', 'VT', 'NH', 'RI', 'NJ', 'DE',
    'MD', 'TX', 'LA', 'FL', 'GA'
  ],
  
  // FountainHRT - Hormone Replacement Therapy (Pink states)
  HRT: [
    'WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'UT', 'AZ', 'CO', 'NM',
    'ND', 'MN', 'WI', 'MI', 'NY', 'PA', 'OH', 'IN', 'IL', 'IA',
    'OK', 'TX', 'LA', 'MS', 'AL', 'FL', 'GA', 'SC', 'NC', 'VA',
    'MD', 'DE', 'NJ', 'RI', 'ME', 'MO', 'AR', 'TN', 'KS'
  ],
  
  // FountainGLP - GLP-1 Weight Loss (Purple states)
  GLP: [
    'WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'UT', 'AZ', 'CO', 'NM',
    'ND', 'NE', 'MN', 'IA', 'MO', 'WI', 'IL', 'IN', 'MI', 'OH',
    'KY', 'TN', 'VA', 'NC', 'PA', 'NY', 'ME', 'VT', 'NH', 'RI',
    'NJ', 'DE', 'MD', 'DC', 'TX', 'LA', 'AR', 'FL'
  ],
};

// Service metadata
export const SERVICE_INFO: Record<ServiceType, { name: string; fullName: string; color: string; description: string }> = {
  TRT: {
    name: 'TRT',
    fullName: 'Testosterone Replacement Therapy',
    color: '#2DD4BF',
    description: 'Hormone optimization for men',
  },
  HRT: {
    name: 'HRT',
    fullName: 'Hormone Replacement Therapy',
    color: '#EC4899',
    description: 'Hormone balance for women',
  },
  GLP: {
    name: 'GLP',
    fullName: 'GLP-1 Weight Loss',
    color: '#7C6F9B',
    description: 'Medical weight management',
  },
};

// Helper function to check if a state has a service
export function isServiceAvailable(stateId: string, service: ServiceType): boolean {
  return SERVICE_AVAILABILITY[service].includes(stateId);
}

// Get all services available in a state
export function getServicesForState(stateId: string): ServiceType[] {
  return (Object.keys(SERVICE_AVAILABILITY) as ServiceType[]).filter(
    service => isServiceAvailable(stateId, service)
  );
}

// Get state name from ID
export function getStateName(stateId: string): string {
  const state = US_STATES.find(s => s.id === stateId);
  return state?.name ?? stateId;
}

