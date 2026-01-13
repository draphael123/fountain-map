export type ServiceType = 'TRT' | 'HRT' | 'GLP' | 'Planning';

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
    'ND', 'MN', 'WI', 'MI', 'IA', 'IL', 'IN', 'OH',
    'TX', 'LA', 'FL', 'NC', 'SC', 'VA',
    'MD', 'DE', 'DC', 'PA', 'NJ', 'NY', 'VT', 'NH', 'ME'
  ],
  
  // FountainHRT - Hormone Replacement Therapy (Pink states)
  HRT: [
    'WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'UT', 'AZ', 'CO', 'NM',
    'ND', 'MN', 'WI', 'MI', 'IL', 'IN', 'OH', 'KY',
    'TX', 'OK', 'LA', 'FL', 'NC', 'VA', 'DC',
    'MD', 'DE', 'NJ', 'PA', 'NY', 'CT', 'RI', 'MA', 'VT', 'NH', 'ME'
  ],
  
  // FountainGLP - GLP-1 Weight Loss (Purple states)
  GLP: [
    'WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'UT', 'AZ', 'CO', 'NM',
    'ND', 'MN', 'WI', 'MI', 'IA', 'MO', 'IL', 'IN', 'OH', 'KY',
    'TN', 'OK', 'AR', 'TX', 'LA', 'FL', 'NC', 'SC', 'VA', 'WV',
    'MD', 'DE', 'DC', 'PA', 'NJ', 'NY', 'CT', 'RI', 'MA', 'VT', 'NH', 'ME'
  ],

  // Fountain State Planning (Blue states)
  Planning: [
    'ND', 'SD', 'WY', 'NV', 'MO', 'AR', 'MS', 'WV', 'HI', 'MA', 'RI'
  ],
};

// Service metadata
export const SERVICE_INFO: Record<ServiceType, { 
  name: string; 
  fullName: string; 
  color: string; 
  shortDescription: string;
  longDescription: string;
}> = {
  TRT: {
    name: 'TRT',
    fullName: 'Testosterone Replacement Therapy',
    color: '#2DD4BF',
    shortDescription: 'Hormone optimization for men',
    longDescription: 'FountainTRT provides personalized testosterone replacement therapy for men experiencing low testosterone levels. Our licensed providers create customized treatment plans to help restore energy, improve mood, increase muscle mass, and enhance overall vitality. Treatment includes regular monitoring and adjustments to ensure optimal results.',
  },
  HRT: {
    name: 'HRT',
    fullName: 'Hormone Replacement Therapy',
    color: '#EC4899',
    shortDescription: 'Hormone balance for women',
    longDescription: 'FountainHRT offers comprehensive hormone replacement therapy designed specifically for women. Whether you\'re experiencing perimenopause, menopause, or hormonal imbalances, our expert providers develop personalized treatment plans to help alleviate symptoms, restore hormonal balance, and improve your quality of life.',
  },
  GLP: {
    name: 'GLP',
    fullName: 'GLP-1 Weight Loss',
    color: '#7C6F9B',
    shortDescription: 'Medical weight management',
    longDescription: 'FountainGLP provides medically supervised weight loss programs using GLP-1 receptor agonist medications. These FDA-approved treatments help regulate appetite, improve blood sugar control, and support sustainable weight loss. Our providers work with you to create a comprehensive plan that includes medication management and ongoing support.',
  },
  Planning: {
    name: 'State Planning',
    fullName: 'State Planning Services',
    color: '#3B82F6',
    shortDescription: 'Comprehensive state planning',
    longDescription: 'Fountain State Planning offers comprehensive planning services to help you navigate complex decisions. Our expert team provides personalized guidance and support to help you plan for the future, ensuring you have the resources and strategies in place to achieve your goals.',
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
