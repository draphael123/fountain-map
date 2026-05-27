#!/usr/bin/env node
/**
 * Convert Provider Compliance Dashboard Excel to CSV format for Fountain Map
 *
 * Usage: node scripts/convert-excel.mjs [path-to-excel-file]
 * Default: Uses Downloads/Provider _ Compliance Dashboard (2).xlsx
 */

import XLSX from 'xlsx';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

// Default Excel file path
const defaultExcelPath = join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'Provider _ Compliance Dashboard (2).xlsx');
const excelPath = process.argv[2] || defaultExcelPath;

// Output path
const outputPath = join(projectRoot, 'public', 'provider-licensing.csv');

console.log('Excel to CSV Converter for Fountain Map');
console.log('========================================');
console.log(`Input:  ${excelPath}`);
console.log(`Output: ${outputPath}`);
console.log('');

if (!existsSync(excelPath)) {
  console.error(`Error: Excel file not found at ${excelPath}`);
  process.exit(1);
}

try {
  // Read the Excel file
  const workbook = XLSX.readFile(excelPath);

  console.log('Sheets found:', workbook.SheetNames.length, 'sheets');

  // Target sheet for provider licensing
  const targetSheet = 'Provider Licensing by State';

  if (!workbook.SheetNames.includes(targetSheet)) {
    console.error(`Error: Sheet "${targetSheet}" not found in workbook`);
    console.log('Available sheets:', workbook.SheetNames);
    process.exit(1);
  }

  const sheetName = targetSheet;
  const sheet = workbook.Sheets[sheetName];

  console.log(`Using sheet: "${sheetName}"`);

  // Get the range of the sheet
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  console.log(`Range: ${sheet['!ref']} (${range.e.r + 1} rows, ${range.e.c + 1} columns)`);

  // Convert to array of arrays first so we can clean up the data
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  // Clean up the data - replace newlines within cells with spaces
  const cleanedData = data.map(row =>
    row.map(cell => {
      if (typeof cell === 'string') {
        // Replace newlines with space and trim
        return cell.replace(/[\r\n]+/g, ' ').trim();
      }
      return cell;
    })
  );

  // Convert to CSV manually with proper quoting
  const csv = cleanedData.map(row =>
    row.map(cell => {
      const str = String(cell);
      // Quote if contains comma, quote, or newline
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  ).join('\n');

  // Write the CSV file
  writeFileSync(outputPath, csv, 'utf8');

  console.log('');
  console.log(`Successfully converted to: ${outputPath}`);
  console.log('');

  // Show first few lines for verification
  const lines = csv.split('\n').slice(0, 5);
  console.log('First 5 lines of output:');
  lines.forEach((line, i) => {
    const truncated = line.length > 100 ? line.substring(0, 100) + '...' : line;
    console.log(`  ${i + 1}: ${truncated}`);
  });

  // Also convert RN Licensing sheet if it exists
  const rnSheetName = 'RN Licensing by State';
  if (workbook.SheetNames.includes(rnSheetName)) {
    console.log('');
    console.log('Converting RN Licensing sheet...');

    const rnSheet = workbook.Sheets[rnSheetName];
    const rnData = XLSX.utils.sheet_to_json(rnSheet, { header: 1, defval: '' });

    const cleanedRNData = rnData.map(row =>
      row.map(cell => {
        if (typeof cell === 'string') {
          return cell.replace(/[\r\n]+/g, ' ').trim();
        }
        return cell;
      })
    );

    const rnCsv = cleanedRNData.map(row =>
      row.map(cell => {
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');

    const rnOutputPath = join(projectRoot, 'public', 'rn-licensing.csv');
    writeFileSync(rnOutputPath, rnCsv, 'utf8');
    console.log(`RN Licensing saved to: ${rnOutputPath}`);
  }

  console.log('');
  console.log('Conversion complete!');

} catch (error) {
  console.error('Error converting file:', error.message);
  process.exit(1);
}
