import { US_STATES, getServicesForState } from './serviceAvailability';
import { ProviderLicensingData, buildProviderCountMap } from './providerAuthority';

export type GapSeverity = 'high' | 'medium' | 'low';
export type GapType = 'no_service' | 'single_provider' | 'single_service' | 'low_coverage';

export interface GapIssue {
  type: GapType;
  description: string;
  providerCount?: number;
  serviceCount?: number;
  services?: string[];
}

export interface StateGap {
  stateId: string;
  stateName: string;
  severity: GapSeverity;
  issues: GapIssue[];
  providerCount: number;
  serviceCount: number;
}

export const GAP_SEVERITY_COLORS: Record<GapSeverity, string> = {
  high: '#EF4444',    // Red - critical risk
  medium: '#F59E0B',  // Amber - moderate risk
  low: '#3B82F6',     // Blue - informational
};

export const GAP_COLORBLIND_COLORS: Record<GapSeverity, string> = {
  high: '#D55E00',    // Orange-red
  medium: '#E69F00',  // Orange
  low: '#0072B2',     // Blue
};

const SEVERITY_ORDER: Record<GapSeverity, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function determineSeverity(issues: GapIssue[]): GapSeverity {
  const types = issues.map(i => i.type);
  if (types.includes('no_service')) return 'high';
  if (types.includes('single_provider')) return 'medium';
  return 'low';
}

export function analyzeGaps(providerData: ProviderLicensingData): StateGap[] {
  const gaps: StateGap[] = [];
  const providerCountMap = buildProviderCountMap(providerData);

  US_STATES.forEach(state => {
    const issues: GapIssue[] = [];
    const providerCount = providerCountMap[state.id] || 0;
    const services = getServicesForState(state.id).filter(s => s !== 'Planning');
    const serviceCount = services.length;

    // Check: Has providers but no services
    if (providerCount > 0 && serviceCount === 0) {
      issues.push({
        type: 'no_service',
        description: `${providerCount} provider${providerCount > 1 ? 's' : ''} licensed but no services active`,
        providerCount,
        serviceCount: 0,
      });
    }

    // Check: Single provider (risk if they leave)
    if (providerCount === 1 && serviceCount > 0) {
      issues.push({
        type: 'single_provider',
        description: 'Only 1 provider - coverage risk if unavailable',
        providerCount: 1,
        serviceCount,
      });
    }

    // Check: Only 1 service active (limited offering)
    if (serviceCount === 1 && providerCount > 0) {
      issues.push({
        type: 'single_service',
        description: `Only ${services[0]} service active`,
        serviceCount: 1,
        services,
      });
    }

    // Check: Low coverage (2 or fewer services with multiple providers)
    if (serviceCount === 2 && providerCount >= 2) {
      issues.push({
        type: 'low_coverage',
        description: `Only 2 of 4 services active (${services.join(', ')})`,
        serviceCount: 2,
        services,
      });
    }

    if (issues.length > 0) {
      const severity = determineSeverity(issues);
      gaps.push({
        stateId: state.id,
        stateName: state.name,
        severity,
        issues,
        providerCount,
        serviceCount,
      });
    }
  });

  // Sort by severity (high first), then by state name
  return gaps.sort((a, b) => {
    const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    if (severityDiff !== 0) return severityDiff;
    return a.stateName.localeCompare(b.stateName);
  });
}

export function getGapsByType(gaps: StateGap[], type: GapType): StateGap[] {
  return gaps.filter(gap => gap.issues.some(i => i.type === type));
}

export function getGapsBySeverity(gaps: StateGap[], severity: GapSeverity): StateGap[] {
  return gaps.filter(gap => gap.severity === severity);
}

export function getGapStats(gaps: StateGap[]): {
  total: number;
  high: number;
  medium: number;
  low: number;
  noService: number;
  singleProvider: number;
  singleService: number;
} {
  return {
    total: gaps.length,
    high: gaps.filter(g => g.severity === 'high').length,
    medium: gaps.filter(g => g.severity === 'medium').length,
    low: gaps.filter(g => g.severity === 'low').length,
    noService: gaps.filter(g => g.issues.some(i => i.type === 'no_service')).length,
    singleProvider: gaps.filter(g => g.issues.some(i => i.type === 'single_provider')).length,
    singleService: gaps.filter(g => g.issues.some(i => i.type === 'single_service')).length,
  };
}

export function getSeverityColor(severity: GapSeverity, colorblindMode: boolean): string {
  return colorblindMode ? GAP_COLORBLIND_COLORS[severity] : GAP_SEVERITY_COLORS[severity];
}
