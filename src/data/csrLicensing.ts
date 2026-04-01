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

// Provider type filter - normalized to handle MD/MDs and NP/NPs
export type ProviderTypeFilter = 'all' | 'md' | 'np';

// Colors for provider types
export const PROVIDER_TYPE_COLORS = {
  md: '#8B5CF6',  // Purple for MDs
  np: '#10B981',  // Green for NPs
};

// Check if a provider type matches the filter (MD/MDs match 'md', NP/NPs match 'np')
export function matchesProviderTypeFilter(providerType: ProviderType, filter: ProviderTypeFilter): boolean {
  if (filter === 'all') return true;
  const normalized = providerType.toLowerCase().replace('s', '');
  return normalized === filter;
}

// Get all states that require a specific provider type (across all categories)
export function getStatesByProviderType(filter: ProviderTypeFilter): { stateId: string; category: CSRCategory; providerType: ProviderType }[] {
  const results: { stateId: string; category: CSRCategory; providerType: ProviderType }[] = [];

  CSR_DATA.controlled.forEach(({ stateId, providerType }) => {
    if (matchesProviderTypeFilter(providerType, filter)) {
      results.push({ stateId, category: 'controlled', providerType });
    }
  });

  CSR_DATA.nonControlled.forEach(({ stateId, providerType }) => {
    if (matchesProviderTypeFilter(providerType, filter)) {
      results.push({ stateId, category: 'nonControlled', providerType });
    }
  });

  return results;
}

// Count states by provider type
export function countStatesByProviderType(): { md: number; np: number } {
  const mdStates = new Set<string>();
  const npStates = new Set<string>();

  [...CSR_DATA.controlled, ...CSR_DATA.nonControlled].forEach(({ stateId, providerType }) => {
    if (matchesProviderTypeFilter(providerType, 'md')) {
      mdStates.add(stateId);
    }
    if (matchesProviderTypeFilter(providerType, 'np')) {
      npStates.add(stateId);
    }
  });

  return { md: mdStates.size, np: npStates.size };
}
