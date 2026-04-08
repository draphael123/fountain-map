/**
 * License Cost Data
 * Compiled from state medical boards, nursing boards, and DEA
 * Last updated: April 2026
 *
 * Sources:
 * - State Medical Boards (individual state websites)
 * - State Nursing Boards (individual state websites)
 * - DEA Diversion Control Division (dea.gov)
 * - Medicus Healthcare Solutions (medicushcs.com)
 * - Federation of State Medical Boards (fsmb.org)
 *
 * Note: Fees are subject to change. Verify with individual boards for current rates.
 */

export interface LicenseCostRow {
  stateId: string;
  stateLabel: string;
  mdInitial: number;       // MD initial application fee
  mdRenewal: number;       // MD renewal fee
  mdRenewalYears: number;  // MD renewal cycle in years
  npInitial: number;       // NP/APRN initial application fee
  npRenewal: number;       // NP/APRN renewal fee
  npRenewalYears: number;  // NP/APRN renewal cycle in years
  notes: string;
}

// DEA Registration (Federal - same for all states)
export const DEA_COSTS = {
  applicationFee: 888,     // Initial application
  renewalFee: 888,         // Renewal fee
  renewalYears: 3,         // 3-year cycle
  annualEquivalent: 296,   // $888 / 3 years
  description: 'DEA Registration (Practitioners)'
};

// State-by-state license costs
export const LICENSE_COSTS: LicenseCostRow[] = [
  { stateId: "AK", stateLabel: "Alaska", mdInitial: 500, mdRenewal: 450, mdRenewalYears: 2, npInitial: 200, npRenewal: 200, npRenewalYears: 2, notes: "" },
  { stateId: "AL", stateLabel: "Alabama", mdInitial: 175, mdRenewal: 175, mdRenewalYears: 1, npInitial: 175, npRenewal: 104, npRenewalYears: 2, notes: "MD-only state for controlled substances" },
  { stateId: "AR", stateLabel: "Arkansas", mdInitial: 500, mdRenewal: 225, mdRenewalYears: 2, npInitial: 125, npRenewal: 125, npRenewalYears: 2, notes: "" },
  { stateId: "AZ", stateLabel: "Arizona", mdInitial: 500, mdRenewal: 500, mdRenewalYears: 2, npInitial: 150, npRenewal: 150, npRenewalYears: 2, notes: "" },
  { stateId: "CA", stateLabel: "California", mdInitial: 1151, mdRenewal: 1206, mdRenewalYears: 2, npInitial: 150, npRenewal: 215, npRenewalYears: 2, notes: "Includes CURES fee ($30) and Thompson Program fee ($25)" },
  { stateId: "CO", stateLabel: "Colorado", mdInitial: 390, mdRenewal: 273, mdRenewalYears: 2, npInitial: 75, npRenewal: 75, npRenewalYears: 2, notes: "" },
  { stateId: "CT", stateLabel: "Connecticut", mdInitial: 565, mdRenewal: 455, mdRenewalYears: 2, npInitial: 200, npRenewal: 200, npRenewalYears: 1, notes: "" },
  { stateId: "DC", stateLabel: "Washington D.C.", mdInitial: 803, mdRenewal: 550, mdRenewalYears: 2, npInitial: 180, npRenewal: 130, npRenewalYears: 2, notes: "" },
  { stateId: "DE", stateLabel: "Delaware", mdInitial: 378, mdRenewal: 378, mdRenewalYears: 2, npInitial: 255, npRenewal: 172, npRenewalYears: 2, notes: "" },
  { stateId: "FL", stateLabel: "Florida", mdInitial: 424, mdRenewal: 355, mdRenewalYears: 2, npInitial: 110, npRenewal: 60, npRenewalYears: 2, notes: "" },
  { stateId: "GA", stateLabel: "Georgia", mdInitial: 500, mdRenewal: 275, mdRenewalYears: 2, npInitial: 275, npRenewal: 125, npRenewalYears: 2, notes: "MD-only for controlled substances" },
  { stateId: "HI", stateLabel: "Hawaii", mdInitial: 392, mdRenewal: 221, mdRenewalYears: 2, npInitial: 194, npRenewal: 126, npRenewalYears: 2, notes: "" },
  { stateId: "IA", stateLabel: "Iowa", mdInitial: 450, mdRenewal: 400, mdRenewalYears: 2, npInitial: 81, npRenewal: 81, npRenewalYears: 3, notes: "" },
  { stateId: "ID", stateLabel: "Idaho", mdInitial: 400, mdRenewal: 400, mdRenewalYears: 2, npInitial: 120, npRenewal: 90, npRenewalYears: 1, notes: "" },
  { stateId: "IL", stateLabel: "Illinois", mdInitial: 500, mdRenewal: 300, mdRenewalYears: 3, npInitial: 125, npRenewal: 50, npRenewalYears: 2, notes: "" },
  { stateId: "IN", stateLabel: "Indiana", mdInitial: 250, mdRenewal: 150, mdRenewalYears: 2, npInitial: 50, npRenewal: 50, npRenewalYears: 2, notes: "" },
  { stateId: "KS", stateLabel: "Kansas", mdInitial: 300, mdRenewal: 210, mdRenewalYears: 2, npInitial: 150, npRenewal: 85, npRenewalYears: 2, notes: "" },
  { stateId: "KY", stateLabel: "Kentucky", mdInitial: 300, mdRenewal: 200, mdRenewalYears: 2, npInitial: 330, npRenewal: 100, npRenewalYears: 1, notes: "" },
  { stateId: "LA", stateLabel: "Louisiana", mdInitial: 382, mdRenewal: 262, mdRenewalYears: 2, npInitial: 150, npRenewal: 100, npRenewalYears: 1, notes: "NP requires prescriptive authority add-on ($50)" },
  { stateId: "MA", stateLabel: "Massachusetts", mdInitial: 600, mdRenewal: 600, mdRenewalYears: 2, npInitial: 150, npRenewal: 150, npRenewalYears: 2, notes: "" },
  { stateId: "MD", stateLabel: "Maryland", mdInitial: 790, mdRenewal: 512, mdRenewalYears: 1, npInitial: 75, npRenewal: 210, npRenewalYears: 2, notes: "Includes MHCC assessment ($26)" },
  { stateId: "ME", stateLabel: "Maine", mdInitial: 600, mdRenewal: 400, mdRenewalYears: 2, npInitial: 100, npRenewal: 100, npRenewalYears: 2, notes: "" },
  { stateId: "MI", stateLabel: "Michigan", mdInitial: 368, mdRenewal: 270, mdRenewalYears: 3, npInitial: 200, npRenewal: 120, npRenewalYears: 2, notes: "" },
  { stateId: "MN", stateLabel: "Minnesota", mdInitial: 200, mdRenewal: 192, mdRenewalYears: 2, npInitial: 105, npRenewal: 95, npRenewalYears: 2, notes: "" },
  { stateId: "MO", stateLabel: "Missouri", mdInitial: 75, mdRenewal: 75, mdRenewalYears: 2, npInitial: 150, npRenewal: 80, npRenewalYears: 2, notes: "" },
  { stateId: "MS", stateLabel: "Mississippi", mdInitial: 550, mdRenewal: 325, mdRenewalYears: 2, npInitial: 100, npRenewal: 100, npRenewalYears: 2, notes: "" },
  { stateId: "MT", stateLabel: "Montana", mdInitial: 500, mdRenewal: 400, mdRenewalYears: 2, npInitial: 175, npRenewal: 130, npRenewalYears: 2, notes: "NP prescriptive authority add-on ($100)" },
  { stateId: "NC", stateLabel: "North Carolina", mdInitial: 400, mdRenewal: 250, mdRenewalYears: 1, npInitial: 100, npRenewal: 100, npRenewalYears: 1, notes: "" },
  { stateId: "ND", stateLabel: "North Dakota", mdInitial: 400, mdRenewal: 325, mdRenewalYears: 3, npInitial: 160, npRenewal: 100, npRenewalYears: 2, notes: "" },
  { stateId: "NE", stateLabel: "Nebraska", mdInitial: 350, mdRenewal: 300, mdRenewalYears: 2, npInitial: 68, npRenewal: 68, npRenewalYears: 2, notes: "" },
  { stateId: "NH", stateLabel: "New Hampshire", mdInitial: 300, mdRenewal: 300, mdRenewalYears: 2, npInitial: 100, npRenewal: 110, npRenewalYears: 2, notes: "" },
  { stateId: "NJ", stateLabel: "New Jersey", mdInitial: 805, mdRenewal: 400, mdRenewalYears: 2, npInitial: 260, npRenewal: 160, npRenewalYears: 2, notes: "" },
  { stateId: "NM", stateLabel: "New Mexico", mdInitial: 400, mdRenewal: 250, mdRenewalYears: 2, npInitial: 100, npRenewal: 75, npRenewalYears: 2, notes: "" },
  { stateId: "NV", stateLabel: "Nevada", mdInitial: 1425, mdRenewal: 600, mdRenewalYears: 2, npInitial: 200, npRenewal: 150, npRenewalYears: 2, notes: "Highest initial MD fee in US" },
  { stateId: "NY", stateLabel: "New York", mdInitial: 735, mdRenewal: 530, mdRenewalYears: 2, npInitial: 85, npRenewal: 85, npRenewalYears: 3, notes: "" },
  { stateId: "OH", stateLabel: "Ohio", mdInitial: 305, mdRenewal: 305, mdRenewalYears: 2, npInitial: 150, npRenewal: 100, npRenewalYears: 2, notes: "" },
  { stateId: "OK", stateLabel: "Oklahoma", mdInitial: 500, mdRenewal: 350, mdRenewalYears: 2, npInitial: 70, npRenewal: 70, npRenewalYears: 2, notes: "Async only" },
  { stateId: "OR", stateLabel: "Oregon", mdInitial: 375, mdRenewal: 556, mdRenewalYears: 2, npInitial: 150, npRenewal: 150, npRenewalYears: 2, notes: "High renewal relative to initial" },
  { stateId: "PA", stateLabel: "Pennsylvania", mdInitial: 35, mdRenewal: 35, mdRenewalYears: 2, npInitial: 100, npRenewal: 45, npRenewalYears: 2, notes: "Lowest MD fees in US" },
  { stateId: "RI", stateLabel: "Rhode Island", mdInitial: 1090, mdRenewal: 440, mdRenewalYears: 2, npInitial: 145, npRenewal: 100, npRenewalYears: 2, notes: "" },
  { stateId: "SC", stateLabel: "South Carolina", mdInitial: 580, mdRenewal: 300, mdRenewalYears: 2, npInitial: 145, npRenewal: 80, npRenewalYears: 2, notes: "" },
  { stateId: "SD", stateLabel: "South Dakota", mdInitial: 400, mdRenewal: 300, mdRenewalYears: 2, npInitial: 100, npRenewal: 75, npRenewalYears: 2, notes: "" },
  { stateId: "TN", stateLabel: "Tennessee", mdInitial: 510, mdRenewal: 255, mdRenewalYears: 2, npInitial: 210, npRenewal: 115, npRenewalYears: 2, notes: "" },
  { stateId: "TX", stateLabel: "Texas", mdInitial: 817, mdRenewal: 317, mdRenewalYears: 2, npInitial: 150, npRenewal: 94, npRenewalYears: 2, notes: "" },
  { stateId: "UT", stateLabel: "Utah", mdInitial: 200, mdRenewal: 150, mdRenewalYears: 2, npInitial: 135, npRenewal: 65, npRenewalYears: 2, notes: "" },
  { stateId: "VA", stateLabel: "Virginia", mdInitial: 302, mdRenewal: 217, mdRenewalYears: 2, npInitial: 125, npRenewal: 90, npRenewalYears: 2, notes: "" },
  { stateId: "VT", stateLabel: "Vermont", mdInitial: 650, mdRenewal: 300, mdRenewalYears: 2, npInitial: 125, npRenewal: 75, npRenewalYears: 2, notes: "" },
  { stateId: "WA", stateLabel: "Washington", mdInitial: 491, mdRenewal: 491, mdRenewalYears: 2, npInitial: 135, npRenewal: 135, npRenewalYears: 2, notes: "Includes HEALWA ($16) and WCN ($8) surcharges" },
  { stateId: "WI", stateLabel: "Wisconsin", mdInitial: 60, mdRenewal: 60, mdRenewalYears: 2, npInitial: 82, npRenewal: 82, npRenewalYears: 2, notes: "Very low MD fees" },
  { stateId: "WV", stateLabel: "West Virginia", mdInitial: 400, mdRenewal: 300, mdRenewalYears: 2, npInitial: 35, npRenewal: 35, npRenewalYears: 2, notes: "Lowest NP fees in US" },
  { stateId: "WY", stateLabel: "Wyoming", mdInitial: 400, mdRenewal: 250, mdRenewalYears: 2, npInitial: 325, npRenewal: 150, npRenewalYears: 2, notes: "NP includes prescriptive authority ($70)" },
];

// Helper functions for cost calculations
export function getAnnualMdCost(stateId: string): number {
  const state = LICENSE_COSTS.find(s => s.stateId === stateId);
  if (!state) return 0;
  return Math.round(state.mdRenewal / state.mdRenewalYears);
}

export function getAnnualNpCost(stateId: string): number {
  const state = LICENSE_COSTS.find(s => s.stateId === stateId);
  if (!state) return 0;
  return Math.round(state.npRenewal / state.npRenewalYears);
}

export function getTotalAnnualCost(stateId: string, includesDea: boolean = true): { md: number; np: number; dea: number; total: number } {
  const mdAnnual = getAnnualMdCost(stateId);
  const npAnnual = getAnnualNpCost(stateId);
  const deaAnnual = includesDea ? DEA_COSTS.annualEquivalent : 0;

  return {
    md: mdAnnual,
    np: npAnnual,
    dea: deaAnnual,
    total: mdAnnual + npAnnual + deaAnnual
  };
}

// Summary statistics
export function getLicenseCostStats() {
  const mdRenewals = LICENSE_COSTS.map(s => s.mdRenewal / s.mdRenewalYears);
  const npRenewals = LICENSE_COSTS.map(s => s.npRenewal / s.npRenewalYears);

  return {
    md: {
      min: Math.min(...mdRenewals),
      max: Math.max(...mdRenewals),
      avg: Math.round(mdRenewals.reduce((a, b) => a + b, 0) / mdRenewals.length),
      minState: LICENSE_COSTS.reduce((min, s) => (s.mdRenewal / s.mdRenewalYears) < (min.mdRenewal / min.mdRenewalYears) ? s : min).stateId,
      maxState: LICENSE_COSTS.reduce((max, s) => (s.mdRenewal / s.mdRenewalYears) > (max.mdRenewal / max.mdRenewalYears) ? s : max).stateId,
    },
    np: {
      min: Math.min(...npRenewals),
      max: Math.max(...npRenewals),
      avg: Math.round(npRenewals.reduce((a, b) => a + b, 0) / npRenewals.length),
      minState: LICENSE_COSTS.reduce((min, s) => (s.npRenewal / s.npRenewalYears) < (min.npRenewal / min.npRenewalYears) ? s : min).stateId,
      maxState: LICENSE_COSTS.reduce((max, s) => (s.npRenewal / s.npRenewalYears) > (max.npRenewal / max.npRenewalYears) ? s : max).stateId,
    },
    dea: DEA_COSTS.annualEquivalent
  };
}
