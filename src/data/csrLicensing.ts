// CSR Licensing Data
// Defines which states have CSR requirements and what provider types are needed

export type CSRCategory = 'controlled' | 'nonControlled' | 'tbd';
export type ProviderType = 'MD' | 'NP' | 'MDs' | 'NPs';
export type LicenseRequirement = 'One License' | 'Two Licenses';

export interface CSRState {
  stateId: string;
  providerType: ProviderType;
  licenseRequirement: LicenseRequirement;
  notes?: string; // For annotations like "Prescriptive Authority", "RX Authority"
}

export interface TBDState {
  stateId: string;
  licenseRequirement: LicenseRequirement;
}

export interface CSRData {
  controlled: CSRState[];
  nonControlled: CSRState[];
  tbd: TBDState[];
}

export const CSR_DATA: CSRData = {
  // Controlled substances - states where CSR is Required (CSR Required = Yes)
  controlled: [
    { stateId: 'DC', providerType: 'NP', licenseRequirement: 'Two Licenses' },
    { stateId: 'KY', providerType: 'MD', licenseRequirement: 'One License', notes: 'Prescriptive Authority' },
    { stateId: 'SC', providerType: 'MD', licenseRequirement: 'Two Licenses' },
    { stateId: 'WV', providerType: 'NP', licenseRequirement: 'One License', notes: 'RX Authority' },
    { stateId: 'TN', providerType: 'MD', licenseRequirement: 'One License' },
    { stateId: 'GA', providerType: 'MD', licenseRequirement: 'One License' },
    { stateId: 'AK', providerType: 'MD', licenseRequirement: 'One License' },
  ],

  // Non-controlled substances - states where CSR is NOT Required (CSR Required = No)
  nonControlled: [
    { stateId: 'AL', providerType: 'NP', licenseRequirement: 'Two Licenses' },
    { stateId: 'CT', providerType: 'NP', licenseRequirement: 'Two Licenses' },
    { stateId: 'DE', providerType: 'NP', licenseRequirement: 'Two Licenses' },
    { stateId: 'HI', providerType: 'NP', licenseRequirement: 'Two Licenses' },
    { stateId: 'LA', providerType: 'NP', licenseRequirement: 'Two Licenses' },
    { stateId: 'OK', providerType: 'NP', licenseRequirement: 'Two Licenses' },
    { stateId: 'RI', providerType: 'NP', licenseRequirement: 'Two Licenses' },
    { stateId: 'NH', providerType: 'NP', licenseRequirement: 'One License' },
    { stateId: 'KY', providerType: 'NP', licenseRequirement: 'One License', notes: 'Prescriptive Authority' },
  ],

  // States to be determined
  tbd: [
    { stateId: 'MO', licenseRequirement: 'Two Licenses' },
    { stateId: 'AR', licenseRequirement: 'One License' },
    { stateId: 'MS', licenseRequirement: 'One License' },
    { stateId: 'KS', licenseRequirement: 'One License' },
  ],
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
    return CSR_DATA.tbd.map(s => s.stateId);
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
  const tbd = CSR_DATA.tbd.map(s => s.stateId);
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
  if (CSR_DATA.tbd.some(s => s.stateId === stateId)) {
    categories.push('tbd');
  }
  return categories;
}

// Helper to get license requirement for a state
export function getLicenseRequirement(stateId: string): LicenseRequirement | null {
  const controlled = CSR_DATA.controlled.find(s => s.stateId === stateId);
  if (controlled) return controlled.licenseRequirement;

  const nonControlled = CSR_DATA.nonControlled.find(s => s.stateId === stateId);
  if (nonControlled) return nonControlled.licenseRequirement;

  const tbd = CSR_DATA.tbd.find(s => s.stateId === stateId);
  if (tbd) return tbd.licenseRequirement;

  return null;
}

// Helper to get notes for a state (like "Prescriptive Authority", "RX Authority")
export function getStateNotes(stateId: string, category: CSRCategory): string | null {
  if (category === 'tbd') return null;
  const state = CSR_DATA[category].find(s => s.stateId === stateId);
  return state?.notes || null;
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
