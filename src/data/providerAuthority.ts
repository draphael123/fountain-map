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

export interface ProviderLicensingData {
  providers: string[];
  rows: ProviderLicensingRow[];
  stateIds: string[];
}

export async function loadProviderLicensingData(): Promise<ProviderLicensingData> {
  const res = await fetch('/provider-licensing.csv');
  if (!res.ok) throw new Error('Failed to load provider licensing data');
  const text = await res.text();
  const rows = parseCSV(text);
  if (rows.length < 2) return { providers: [], rows: [], stateIds: [] };

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
  const dataStartRow = hasServiceRow ? 2 : 1;

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
  return { providers, rows: dataRows, stateIds };
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
