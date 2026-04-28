export type ServiceType = 'TRT' | 'HRT' | 'GLP' | 'Planning' | 'Async';

// Async service tier definitions
export const ASYNC_TIERS = {
  tier1: ['WA', 'CA', 'NV', 'MT', 'NE', 'MN', 'IL', 'MI', 'OH', 'PA', 'NY', 'FL'],
  tier2: ['OR', 'ID', 'WY', 'UT', 'AZ', 'NM', 'CO', 'ND', 'SD', 'TX', 'IA', 'MO', 'WI', 'IN', 'KY', 'VT', 'ME', 'MA', 'NJ', 'VA', 'TN', 'NC', 'MD', 'CT'],
};

// Helper to get Async tier for a state
export function getAsyncTier(stateId: string): 'tier1' | 'tier2' | null {
  if (ASYNC_TIERS.tier1.includes(stateId)) return 'tier1';
  if (ASYNC_TIERS.tier2.includes(stateId)) return 'tier2';
  return null;
}

/** Regional definitions for coverage summary */
export const REGIONS: Record<string, { name: string; states: string[]; color: string }> = {
  west: {
    name: 'West Coast',
    states: ['WA', 'OR', 'CA', 'NV', 'AK', 'HI'],
    color: '#3B82F6',
  },
  mountain: {
    name: 'Mountain',
    states: ['MT', 'ID', 'WY', 'UT', 'CO', 'AZ', 'NM'],
    color: '#8B5CF6',
  },
  midwest: {
    name: 'Midwest',
    states: ['ND', 'SD', 'NE', 'KS', 'MN', 'IA', 'MO', 'WI', 'IL', 'MI', 'IN', 'OH'],
    color: '#F59E0B',
  },
  south: {
    name: 'South',
    states: ['TX', 'OK', 'AR', 'LA', 'MS', 'AL', 'TN', 'KY', 'WV', 'VA', 'NC', 'SC', 'GA', 'FL'],
    color: '#EF4444',
  },
  northeast: {
    name: 'Northeast',
    states: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT', 'NY', 'NJ', 'PA', 'DE', 'MD', 'DC'],
    color: '#10B981',
  },
};

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

// Service availability data extracted from the source spreadsheet
// Updated 2026-04-28 from Provider Licensing by State / Availability Report
export const SERVICE_AVAILABILITY: Record<ServiceType, string[]> = {
  // FountainTRT - Testosterone Replacement Therapy (Teal states)
  // 23 states active (Promoting or Open status)
  TRT: [
    'AZ', 'CA', 'CO', 'FL', 'IA', 'ID', 'IL', 'IN', 'MD', 'ME', 'MI', 'MT', 'NC',
    'NE', 'NJ', 'NM', 'NY', 'OH', 'PA', 'TX', 'VA', 'WA', 'WI'
  ],

  // FountainHRT - Hormone Replacement Therapy (Pink states)
  // 11 states active (Promoting or Open status)
  HRT: [
    'AZ', 'CA', 'FL', 'MD', 'MI', 'NJ', 'NY', 'OH', 'TX', 'VA', 'WA'
  ],

  // FountainGLP - GLP-1 Weight Loss (Purple states)
  // 24 states active (Open status)
  GLP: [
    'AZ', 'CA', 'CO', 'CT', 'FL', 'IA', 'ID', 'IL', 'IN', 'KY', 'MD', 'MI', 'MT',
    'NC', 'NE', 'NH', 'NJ', 'NY', 'OH', 'PA', 'TX', 'VA', 'WA', 'WI'
  ],

  // Fountain State Planning (Blue states)
  // 10 states total
  Planning: [
    'NV', 'WY', 'ND', 'SD', 'MO', 'AR', 'MS', 'WV', 'RI', 'HI'
  ],

  // FountainAsync - Async Services (Green for Tier 1, Yellow for Tier 2)
  // 36 states active (12 Tier 1 + 24 Tier 2)
  Async: [
    // Tier 1 (12 states)
    'WA', 'CA', 'NV', 'MT', 'NE', 'MN', 'IL', 'MI', 'OH', 'PA', 'NY', 'FL',
    // Tier 2 (24 states)
    'OR', 'ID', 'WY', 'UT', 'AZ', 'NM', 'CO', 'ND', 'SD', 'TX', 'IA', 'MO', 'WI', 'IN', 'KY', 'VT', 'ME', 'MA', 'NJ', 'VA', 'TN', 'NC', 'MD', 'CT'
  ],
};

// Lab availability restrictions by state
// States with specific lab requirements (e.g., Quest only, no Labcorp)
export const LAB_RESTRICTIONS: Record<string, { quest: boolean; labcorp: boolean; note: string }> = {
  'MD': { quest: true, labcorp: false, note: 'Quest only - Labcorp not available' },
  'MA': { quest: true, labcorp: false, note: 'Quest only - Labcorp not available' },
};

// Helper function to get lab restrictions for a state
export function getLabRestrictions(stateId: string): { quest: boolean; labcorp: boolean; note: string } | null {
  return LAB_RESTRICTIONS[stateId] || null;
}

// Service metadata
export const SERVICE_INFO: Record<ServiceType, {
  name: string;
  fullName: string;
  color: string;
  tier1Color?: string;
  tier2Color?: string;
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
  Async: {
    name: 'Async',
    fullName: 'Async Services',
    color: '#2e7d32', // Tier 1 green (default)
    tier1Color: '#2e7d32', // Green for Tier 1
    tier2Color: '#f9e076', // Yellow for Tier 2
    shortDescription: 'Asynchronous telehealth services',
    longDescription: 'FountainAsync provides convenient asynchronous telehealth services allowing you to connect with licensed providers on your schedule. Get personalized care and treatment plans through our secure messaging platform without the need for real-time appointments.',
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

// Colorblind-safe colors (accessible for deuteranopia, protanopia, tritanopia)
// Using the IBM Design Language colorblind-safe palette
export const COLORBLIND_COLORS: Record<ServiceType, { color: string; pattern: string }> = {
  TRT: { color: '#0077BB', pattern: 'diagonal' },      // Blue
  HRT: { color: '#EE7733', pattern: 'dots' },          // Orange
  GLP: { color: '#009988', pattern: 'crosshatch' },    // Teal
  Planning: { color: '#CC3311', pattern: 'horizontal' }, // Red
  Async: { color: '#117733', pattern: 'vertical' },    // Green
};

export const COLORBLIND_INACTIVE = '#BBBBBB';

// Multi-service colorblind colors
export const COLORBLIND_SERVICE_COUNT_COLORS: Record<number, string> = {
  0: '#DDDDDD',  // Gray - no services
  1: '#FFDD00',  // Yellow - 1 service
  2: '#88CCEE',  // Light blue - 2 services
  3: '#44AA99',  // Teal - 3 services
  4: '#117733',  // Green - 4 services
  5: '#004400',  // Dark green - all 5 services
};

// Helper to get the appropriate color based on colorblind mode
export function getServiceColor(service: ServiceType, colorblindMode: boolean): string {
  return colorblindMode ? COLORBLIND_COLORS[service].color : SERVICE_INFO[service].color;
}

export function getInactiveColor(colorblindMode: boolean): string {
  return colorblindMode ? COLORBLIND_INACTIVE : '#D1D5DB';
}

// Get the appropriate color for Async service based on tier
export function getAsyncColorForState(stateId: string): string {
  const tier = getAsyncTier(stateId);
  if (tier === 'tier1') return SERVICE_INFO.Async.tier1Color || '#2e7d32';
  if (tier === 'tier2') return SERVICE_INFO.Async.tier2Color || '#f9e076';
  return '#D1D5DB'; // inactive
}
