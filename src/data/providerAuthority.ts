import { US_STATES } from './serviceAvailability';

/** Parse CSV text handling quoted fields with embedded newlines */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (!inQuotes && (c === '\n' || c === '\r')) {
      if (cell || row.length > 0) row.push(cell.trim());
      cell = '';
      if (row.length > 0) rows.push(row);
      row = [];
      if (c === '\r' && text[i + 1] === '\n') i++;
      continue;
    }
    if (!inQuotes && c === ',') {
      row.push(cell.trim());
      cell = '';
      continue;
    }
    cell += c;
  }
  if (cell || row.length > 0) {
    row.push(cell.trim());
    rows.push(row);
  }
  return rows;
}

function stateNameToId(stateName: string): string | null {
  const n = stateName.trim();
  if (!n) return null;
  const byName = US_STATES.find((s) => s.name === n);
  if (byName) return byName.id;
  if (n === 'DC') return 'DC';
  return null;
}

const PROVIDERS_EXCLUDED_FROM_MAP = new Set(
  [
    'Sanjay Khubchandari', 'Teresa', 'Adriane', 'Ebony', 'Kendra', 'Jessica',
    'Josh Faucett', 'Joshua Faucett', 'LaShundra', 'Rukayat Oluwadamilola Bojuwon',
    'Rukayat', 'Megan P', 'Michelle Dymond', 'Kefah', 'Frankie', 'Rachel Recore',
    'Casey Herschell', 'Wilmyne Leger', 'Charlotte K',
  ].map((n) => n.toLowerCase())
);

function isProviderColumn(header: string): boolean {
  const h = header.trim();
  if (!h || h === 'State') return false;
  if (/^(TRT|GLP|HRT)\s*[-/]/.test(h)) return false;
  if (h.includes('Promoting') && h.includes('Open') && h.includes('Closed')) return false;
  if (/^(TRT|GLP|HRT)\/?/.test(h) && h.includes('/')) return false;
  return true;
}

function isExcludedProvider(normalizedName: string): boolean {
  return PROVIDERS_EXCLUDED_FROM_MAP.has(normalizedName.toLowerCase());
}

export interface ProviderLicensingRow {
  stateId: string;
  stateName: string;
  providers: Record<string, string>;
}

function parseServiceString(s: string): string[] {
  if (!s || !s.trim()) return [];
  return s
    .split(/[\/\s,]+/)
    .map((x) => x.trim().toUpperCase())
    .filter((x) => ['TRT', 'HRT', 'GLP'].includes(x));
}

export interface ProviderLicensingData {
  providers: string[];
  rows: ProviderLicensingRow[];
  stateIds: string[];
  providerToServices: Record<string, string[]>;
  providersByService: Record<string, string[]>;
}

export async function loadProviderLicensingData(): Promise<ProviderLicensingData> {
  const res = await fetch('/provider-licensing.csv');
  if (!res.ok) throw new Error('Failed to load provider licensing data');
  const text = await res.text();
  const rows = parseCSV(text);
  if (rows.length < 2) return { providers: [], rows: [], stateIds: [], providerToServices: {}, providersByService: {} };

  const headers = rows[0];
  const providerIndices: { index: number; name: string }[] = [];
  headers.forEach((h, i) => {
    const name = h.replace(/\s+/g, ' ').trim();
    if (isProviderColumn(name) && !isExcludedProvider(name)) providerIndices.push({ index: i, name });
  });

  const providerSet = new Set(providerIndices.map((p) => p.name));
  const providers = Array.from(providerSet).sort((a, b) => a.localeCompare(b));

  const hasServiceRow =
    rows.length > 1 && rows[1] && (!rows[1][0]?.trim() || rows[1][0] === 'State') &&
    rows[1].some((cell) => /\b(TRT|HRT|GLP)\b/i.test(cell ?? ''));
  const serviceRow = hasServiceRow ? rows[1] : null;
  const dataStartRow = hasServiceRow ? 2 : 1;

  const providerToServices: Record<string, string[]> = {};
  const providersByService: Record<string, string[]> = { TRT: [], HRT: [], GLP: [] };
  if (serviceRow) {
    providerIndices.forEach(({ index, name }) => {
      const svcStr = serviceRow[index]?.trim() ?? '';
      const services = parseServiceString(svcStr);
      if (services.length > 0) {
        providerToServices[name] = services;
        services.forEach((s) => {
          if (!providersByService[s].includes(name)) providersByService[s].push(name);
        });
      }
    });
  }

  const stateIdsSet = new Set<string>();
  const dataRows: ProviderLicensingRow[] = [];

  for (let r = dataStartRow; r < rows.length; r++) {
    const row = rows[r];
    const stateName = row[0]?.trim() ?? '';
    const stateId = stateNameToId(stateName);
    if (!stateId) continue;

    stateIdsSet.add(stateId);
    const providersInState: Record<string, string> = {};
    providerIndices.forEach(({ index, name }) => {
      const value = row[index]?.trim() ?? '';
      if (value) providersInState[name] = value;
    });
    dataRows.push({ stateId, stateName, providers: providersInState });
  }

  const stateIds = US_STATES.map((s) => s.id).filter((id) => stateIdsSet.has(id));
  return { providers, rows: dataRows, stateIds, providerToServices, providersByService };
}

export function stateHasSelectedProviders(
  row: ProviderLicensingRow | undefined,
  selectedProviders: string[]
): boolean {
  if (!row || selectedProviders.length === 0) return false;
  return selectedProviders.some((p) => row.providers[p]);
}

export function getProviderValueInState(
  row: ProviderLicensingRow | undefined,
  provider: string
): string | undefined {
  return row?.providers[provider];
}

export function parseLicenseDate(value: string): Date | null {
  const v = (value ?? '').trim().toLowerCase();
  if (!v || v === 'pending') return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

export function isExpiringWithinDays(date: Date | null, days: number): boolean {
  if (!date) return false;
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return date <= cutoff && date >= now;
}

export function isExpired(date: Date | null): boolean {
  if (!date) return false;
  return date < new Date();
}
