# Fountain Map

Internal Fountain Vitality service availability and licensing maps (Vite + React).

## Updating state licensing data (Excel → app)

**State rules** and **CS refill guidelines** are generated from the Provider Compliance Dashboard spreadsheet:

1. Install Python dependency: `pip install openpyxl`
2. Edit `scripts/export-licensing-sheets.py` if your `.xlsx` path or filename changes.
3. Run from the project root:

```bash
python scripts/export-licensing-sheets.py
```

This overwrites:

- `src/data/stateRulesData.ts`
- `src/data/stateCSRefillData.ts`

Then commit the updated files and deploy as usual.

## Scripts

| Script | Purpose |
|--------|---------|
| `scripts/export-licensing-sheets.py` | Regenerate state rules + CS refill TypeScript data from Excel |

## Development

```bash
npm install
npm run dev
```

```bash
npm run build
```
