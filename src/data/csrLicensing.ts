// CSR Licensing Data
// Defines which states have CSR requirements and what provider types are needed

export type CSRCategory = 'controlled' | 'nonControlled' | 'tbd';
export type ProviderType = 'MD' | 'NP' | 'MDs' | 'NPs';

export interface CSRState {
  stateId: string;
  providerType: ProviderType;
}

export interface CSRData {
  controlled: CSRState[];
  nonControlled: CSRState[];
  tbd: string[];
}

export const CSR_DATA: CSRData = {
  // Controlled substances - states with specific provider requirements
  controlled: [
    { stateId: 'WV', providerType: 'NPs' },
    { stateId: 'TN', providerType: 'MD' },
    { stateId: 'DC', providerType: 'NPs' },
    { stateId: 'KY', providerType: 'MDs' },
    { stateId: 'AK', providerType: 'MD' },
    { stateId: 'GA', providerType: 'MD' },
    { stateId: 'SC', providerType: 'MD' },
  ],

  // Non-controlled substances - states with specific provider requirements
  nonControlled: [
    { stateId: 'RI', providerType: 'NP' },
    { stateId: 'DE', providerType: 'NP' },
    { stateId: 'HI', providerType: 'NP' },
    { stateId: 'LA', providerType: 'NP' },
    { stateId: 'KY', providerType: 'NPs' },
    { stateId: 'OK', providerType: 'NP' },
    { stateId: 'AL', providerType: 'NP' },
    { stateId: 'CT', providerType: 'NP' },
    { stateId: 'NH', providerType: 'NP' },
  ],

  // States to be determined
  tbd: ['AR', 'MS', 'MO', 'KS'],
};

// Colors for each category
export const CSR_COLORS = {
  controlled: '#EF4444',      // Red
  nonControlled: '#3B82F6',   // Blue
  tbd: '#F59E0B',             // Amber/Yellow
  inactive: '#E5E7EB',        // Gray
};

// Category display info
export const CSR_CATEGORY_INFO: Record<CSRCategory, { name: string; description: string; color: string }> = {
  controlled: {
    name: 'Controlled',
    description: 'States with controlled substance requirements',
    color: CSR_COLORS.controlled,
  },
  nonControlled: {
    name: 'Non-Controlled',
    description: 'States with non-controlled substance requirements',
    color: CSR_COLORS.nonControlled,
  },
  tbd: {
    name: 'States TBD',
    description: 'States still being determined',
    color: CSR_COLORS.tbd,
  },
};

// Helper to get all states in a category
export function getStatesInCategory(category: CSRCategory): string[] {
  if (category === 'tbd') {
    return CSR_DATA.tbd;
  }
  return CSR_DATA[category].map(s => s.stateId);
}

// Helper to get provider type for a state in a category
export function getProviderType(stateId: string, category: CSRCategory): ProviderType | null {
  if (category === 'tbd') return null;
  const state = CSR_DATA[category].find(s => s.stateId === stateId);
  return state?.providerType || null;
}

// Helper to get all CSR states
export function getAllCSRStates(): string[] {
  const controlled = CSR_DATA.controlled.map(s => s.stateId);
  const nonControlled = CSR_DATA.nonControlled.map(s => s.stateId);
  const tbd = CSR_DATA.tbd;
  return [...new Set([...controlled, ...nonControlled, ...tbd])];
}

// Helper to get category for a state (returns array since KY is in both controlled and non-controlled)
export function getCategoriesForState(stateId: string): CSRCategory[] {
  const categories: CSRCategory[] = [];
  if (CSR_DATA.controlled.some(s => s.stateId === stateId)) {
    categories.push('controlled');
  }
  if (CSR_DATA.nonControlled.some(s => s.stateId === stateId)) {
    categories.push('nonControlled');
  }
  if (CSR_DATA.tbd.includes(stateId)) {
    categories.push('tbd');
  }
  return categories;
}
