/**
 * Export Utilities
 * Handles CSV and PDF export functionality for all dashboards
 */

export interface ExportColumn {
  key: string;
  label: string;
}

/**
 * Export data to CSV format
 */
export const exportToCSV = (
  data: any[],
  columns: ExportColumn[],
  filename: string
): void => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = columns.map((col) => col.label).join(',');
  
  const rows = data.map((item) =>
    columns
      .map((col) => {
        const value = item[col.key];
        if (value === null || value === undefined) return '';
        const stringValue = String(value);
        return stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')
          ? `"${stringValue.replace(/"/g, '""')}"`
          : stringValue;
      })
      .join(',')
  );

  const csv = [headers, ...rows].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to Excel-compatible CSV format
 */
export const exportToExcel = (
  data: any[],
  columns: ExportColumn[],
  filename: string
): void => {
  exportToCSV(data, columns, filename);
};

/**
 * Export data to PDF format (requires jsPDF library)
 * This is a basic implementation - install jspdf and jspdf-autotable for full functionality
 */
export const exportToPDF = async (
  data: any[],
  columns: ExportColumn[],
  filename: string,
  title?: string
): Promise<void> => {
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF() as any;

    if (title) {
      doc.setFontSize(16);
      doc.text(title, 14, 15);
    }

    const tableColumn = columns.map((col) => col.label);
    const tableRows = data.map((item) =>
      columns.map((col) => {
        const value = item[col.key];
        return value !== null && value !== undefined ? String(value) : '';
      })
    );

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: title ? 25 : 15,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [252, 255, 244],
      },
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF export error:', error);
    console.log('PDF export requires jspdf and jspdf-autotable packages');
    console.log('Install with: npm install jspdf jspdf-autotable');
    exportToCSV(data, columns, filename);
  }
};

/**
 * Print data table
 */
export const printTable = (
  data: any[],
  columns: ExportColumn[],
  title?: string
): void => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print');
    return;
  }

  const headers = columns.map((col) => `<th style="border: 1px solid #ddd; padding: 8px; background-color: #22c55e; color: white;">${col.label}</th>`).join('');
  
  const rows = data
    .map(
      (item) =>
        `<tr>${columns
          .map((col) => {
            const value = item[col.key];
            return `<td style="border: 1px solid #ddd; padding: 8px;">${value !== null && value !== undefined ? value : ''}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title || 'Print'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        h1 {
          color: #22c55e;
          margin-bottom: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        @media print {
          button {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      ${title ? `<h1>${title}</h1>` : ''}
      <table>
        <thead>
          <tr>${headers}</tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <br>
      <button onclick="window.print()" style="padding: 10px 20px; background-color: #22c55e; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Print
      </button>
      <button onclick="window.close()" style="padding: 10px 20px; background-color: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
        Close
      </button>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};

/**
 * Copy data to clipboard
 */
export const copyToClipboard = (
  data: any[],
  columns: ExportColumn[]
): void => {
  const headers = columns.map((col) => col.label).join('\t');
  const rows = data
    .map((item) =>
      columns
        .map((col) => {
          const value = item[col.key];
          return value !== null && value !== undefined ? String(value) : '';
        })
        .join('\t')
    )
    .join('\n');

  const text = `${headers}\n${rows}`;

  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert('Data copied to clipboard! You can paste it into Excel or Google Sheets.');
    })
    .catch((error) => {
      console.error('Failed to copy:', error);
      alert('Failed to copy data to clipboard');
    });
};

/**
 * Download JSON data
 */
export const exportToJSON = (
  data: any[],
  filename: string
): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format data for export (clean null/undefined values)
 */
export const formatDataForExport = (data: any[]): any[] => {
  return data.map((item) => {
    const formatted: any = {};
    Object.keys(item).forEach((key) => {
      const value = item[key];
      if (value === null || value === undefined) {
        formatted[key] = '';
      } else if (typeof value === 'object') {
        formatted[key] = JSON.stringify(value);
      } else {
        formatted[key] = value;
      }
    });
    return formatted;
  });
};
