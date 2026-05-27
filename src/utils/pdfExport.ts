import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProviderLicensingData } from '../data/providerAuthority';
import { SERVICE_AVAILABILITY, getStateName, ServiceType, getServicesForState } from '../data/serviceAvailability';

export interface ComplianceReportOptions {
  title: string;
  states: string[];
  providers?: string[];
  includeServiceStatus?: boolean;
  includeLicenseExpiry?: boolean;
}

export interface BulkExportOptions {
  states: string[];
  providers: string[];
  format: 'csv' | 'json';
  includeServices?: boolean;
}

export function generateCompliancePDF(
  options: ComplianceReportOptions,
  providerData: ProviderLicensingData
): void {
  const doc = new jsPDF();
  const { title, states, providers, includeServiceStatus = true } = options;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(45, 90, 61); // Fountain green
  doc.text(title || 'Compliance Report', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);
  doc.text(`States: ${states.length} | Providers: ${providers?.length || 'All'}`, 14, 36);

  // Build table data
  const tableData: string[][] = [];
  const filteredRows = providerData.rows.filter(row => states.includes(row.stateId));

  filteredRows.forEach(row => {
    const stateProviders = providers?.length
      ? providers.filter(p => row.providers[p])
      : Object.keys(row.providers);

    stateProviders.forEach(provider => {
      const value = row.providers[provider] || '';
      const rowData: string[] = [
        row.stateName,
        provider,
        value,
      ];

      if (includeServiceStatus) {
        const services = getServicesForState(row.stateId).filter(s => s !== 'Planning');
        rowData.push(services.join(', ') || 'None');
      }

      tableData.push(rowData);
    });
  });

  // Define columns
  const columns: string[] = ['State', 'Provider', 'License Status'];
  if (includeServiceStatus) {
    columns.push('Active Services');
  }

  // Generate table
  autoTable(doc, {
    startY: 45,
    head: [columns],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [45, 90, 61], // Fountain green
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 45 },
      2: { cellWidth: 50 },
      3: { cellWidth: 50 },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount} | Fountain Vitality Compliance Report`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const filename = `compliance-report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

export function generateBulkExportCSV(
  options: BulkExportOptions,
  providerData: ProviderLicensingData
): void {
  const { states, providers, includeServices = true } = options;

  // Build CSV content
  const headers = ['State', 'State Name', 'Provider', 'License Status'];
  if (includeServices) {
    headers.push('Active Services');
  }

  const rows: string[][] = [];
  const filteredRows = providerData.rows.filter(row => states.includes(row.stateId));

  filteredRows.forEach(row => {
    const stateProviders = providers.length
      ? providers.filter(p => row.providers[p])
      : Object.keys(row.providers);

    stateProviders.forEach(provider => {
      const value = row.providers[provider] || '';
      const rowData = [row.stateId, row.stateName, provider, value];

      if (includeServices) {
        const services = getServicesForState(row.stateId).filter(s => s !== 'Planning');
        rowData.push(services.join('; ') || 'None');
      }

      rows.push(rowData);
    });
  });

  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  // Download
  downloadFile(csvContent, 'text/csv;charset=utf-8;', `provider-export-${Date.now()}.csv`);
}

export function generateBulkExportJSON(
  options: BulkExportOptions,
  providerData: ProviderLicensingData
): void {
  const { states, providers, includeServices = true } = options;

  const exportData = {
    exportedAt: new Date().toISOString(),
    filters: {
      states: states,
      providers: providers.length ? providers : 'all',
    },
    data: providerData.rows
      .filter(row => states.includes(row.stateId))
      .map(row => {
        const stateProviders = providers.length
          ? Object.fromEntries(
              Object.entries(row.providers).filter(([p]) => providers.includes(p))
            )
          : row.providers;

        const result: Record<string, unknown> = {
          stateId: row.stateId,
          stateName: row.stateName,
          providers: stateProviders,
        };

        if (includeServices) {
          result.activeServices = getServicesForState(row.stateId).filter(s => s !== 'Planning');
        }

        return result;
      }),
  };

  // Download
  downloadFile(
    JSON.stringify(exportData, null, 2),
    'application/json;charset=utf-8',
    `provider-export-${Date.now()}.json`
  );
}

function downloadFile(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateServiceAvailabilityPDF(): void {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(45, 90, 61);
  doc.text('Fountain Service Availability Report', 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  const services: ServiceType[] = ['TRT', 'HRT', 'GLP', 'Async'];
  let yPos = 45;

  services.forEach(service => {
    const states = SERVICE_AVAILABILITY[service];

    doc.setFontSize(14);
    doc.setTextColor(45, 90, 61);
    doc.text(`${service} - ${states.length} States`, 14, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setTextColor(60);
    const stateNames = states.map(id => `${id} (${getStateName(id)})`);
    const chunked = [];
    for (let i = 0; i < stateNames.length; i += 4) {
      chunked.push(stateNames.slice(i, i + 4).join(', '));
    }
    chunked.forEach(line => {
      doc.text(line, 14, yPos);
      yPos += 5;
    });
    yPos += 8;

    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
  });

  doc.save(`service-availability-${new Date().toISOString().split('T')[0]}.pdf`);
}
