// CSR Licensing Data — defines which states have CSR requirements and provider types
/** DEA reference for state practitioner registration (CSR) requirements */
export const CSR_DEA_SOURCE_URL =
  'https://www.deadiversion.usdoj.gov/drugreg/reg_apps/pract-state-lic-require.html';

export type CSRCategory = 'controlled' | 'nonControlled' | 'tbd' | 'active';
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

export interface ActiveState {
  stateId: string;
  licenseRequirement: LicenseRequirement;
  notes?: string; // For annotations like "Furnishing license", "RX Authority"
}

export interface CSRData {
  controlled: CSRState[];
  nonControlled: CSRState[];
  tbd: TBDState[];
  active: ActiveState[];
}

export const CSR_DATA: CSRData = {
  // Controlled substances - states where CSR is Required (CSR Required = Yes) - GREEN
  controlled: [
    { stateId: 'DC', providerType: 'NP', licenseRequirement: 'Two Licenses' },
    { stateId: 'KY', providerType: 'MD', licenseRequirement: 'One License', notes: 'Prescriptive Authority' },
    { stateId: 'SC', providerType: 'MD', licenseRequirement: 'Two Licenses' },
    { stateId: 'WV', providerType: 'NP', licenseRequirement: 'One License', notes: 'RX Authority' },
    { stateId: 'TN', providerType: 'MD', licenseRequirement: 'One License' },
    { stateId: 'GA', providerType: 'MD', licenseRequirement: 'One License' },
    { stateId: 'AK', providerType: 'MD', licenseRequirement: 'One License' },
  ],

  // Non-controlled substances - states where CSR is NOT Required (CSR Required = No) - GRAY
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

  // States to be determined - YELLOW
  tbd: [
    { stateId: 'MO', licenseRequirement: 'Two Licenses' },
    { stateId: 'AR', licenseRequirement: 'One License' },
    { stateId: 'MS', licenseRequirement: 'One License' },
    { stateId: 'KS', licenseRequirement: 'One License' },
  ],

  // Active states with existing CSR tracking - WHITE
  active: [
    { stateId: 'CA', licenseRequirement: 'One License', notes: 'Furnishing license' },
    { stateId: 'CO', licenseRequirement: 'One License', notes: 'RX Authority' },
    { stateId: 'GU', licenseRequirement: 'Two Licenses' },
    { stateId: 'ID', licenseRequirement: 'Two Licenses' },
    { stateId: 'IL', licenseRequirement: 'Two Licenses' },
    { stateId: 'IN', licenseRequirement: 'Two Licenses' },
    { stateId: 'IA', licenseRequirement: 'Two Licenses' },
    { stateId: 'MD', licenseRequirement: 'Two Licenses' },
    { stateId: 'MA', licenseRequirement: 'Two Licenses' },
    { stateId: 'MI', licenseRequirement: 'Two Licenses' },
    { stateId: 'NV', licenseRequirement: 'Two Licenses' },
    { stateId: 'NJ', licenseRequirement: 'Two Licenses' },
    { stateId: 'NM', licenseRequirement: 'Two Licenses' },
    { stateId: 'PA', licenseRequirement: 'One License', notes: 'RX Authority' },
    { stateId: 'PR', licenseRequirement: 'Two Licenses' },
    { stateId: 'SD', licenseRequirement: 'Two Licenses' },
    { stateId: 'UT', licenseRequirement: 'Two Licenses' },
    { stateId: 'WY', licenseRequirement: 'Two Licenses' },
  ],
};

// Colors for each category
export const CSR_COLORS = {
  controlled: '#22C55E',      // Green - CSR Required
  nonControlled: '#9CA3AF',   // Gray - No CSR Needed
  tbd: '#EAB308',             // Yellow - Pending Determination
  active: '#60A5FA',          // Light Blue - Active state with existing CSR tracking
  inactive: '#E5E7EB',        // Light Gray - Not in any category
};

// Category display info
export const CSR_CATEGORY_INFO: Record<CSRCategory, { name: string; description: string; color: string }> = {
  controlled: {
    name: 'CSR Required',
    description: 'States where CSR is required for controlled substances',
    color: CSR_COLORS.controlled,
  },
  nonControlled: {
    name: 'No CSR Needed',
    description: 'States where no CSR is needed',
    color: CSR_COLORS.nonControlled,
  },
  tbd: {
    name: 'TBD',
    description: 'States pending determination',
    color: CSR_COLORS.tbd,
  },
  active: {
    name: 'Active',
    description: 'Active states with existing CSR tracking',
    color: CSR_COLORS.active,
  },
};

// Helper to get all states in a category
export function getStatesInCategory(category: CSRCategory): string[] {
  if (category === 'tbd') {
    return CSR_DATA.tbd.map(s => s.stateId);
  }
  if (category === 'active') {
    return CSR_DATA.active.map(s => s.stateId);
  }
  return CSR_DATA[category].map(s => s.stateId);
}

// Helper to get provider type for a state in a category
export function getProviderType(stateId: string, category: CSRCategory): ProviderType | null {
  if (category === 'tbd' || category === 'active') return null;
  const state = CSR_DATA[category].find(s => s.stateId === stateId);
  return state?.providerType || null;
}

// Helper to get all CSR states
export function getAllCSRStates(): string[] {
  const controlled = CSR_DATA.controlled.map(s => s.stateId);
  const nonControlled = CSR_DATA.nonControlled.map(s => s.stateId);
  const tbd = CSR_DATA.tbd.map(s => s.stateId);
  const active = CSR_DATA.active.map(s => s.stateId);
  return [...new Set([...controlled, ...nonControlled, ...tbd, ...active])];
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
  if (CSR_DATA.active.some(s => s.stateId === stateId)) {
    categories.push('active');
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

  const active = CSR_DATA.active.find(s => s.stateId === stateId);
  if (active) return active.licenseRequirement;

  return null;
}

// Helper to get notes for a state (like "Prescriptive Authority", "RX Authority")
export function getStateNotes(stateId: string, category: CSRCategory): string | null {
  if (category === 'tbd') return null;
  if (category === 'active') {
    const state = CSR_DATA.active.find(s => s.stateId === stateId);
    return state?.notes || null;
  }
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
