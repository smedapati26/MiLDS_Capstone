import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

import { Column } from '@ai2c/pmx-mui';

export const handleExportCsv = <T extends object>(exportData: T[], fileTitle: string) => {
  const csvContent = 'data:text/csv;charset=utf-8,' + exportData.map((row) => Object.values(row).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${fileTitle}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const handleExportExcel = <T extends object>(headers: Column<T>[], exportData: T[], fileTitle: string) => {
  const headerLabels = headers.map((col) => col.header);
  const rows = exportData.map((row) => headers.map((col) => row[col.field as keyof T] || 'N/A'));

  const worksheet = XLSX.utils.aoa_to_sheet([headerLabels, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${fileTitle}.xlsx`);
};

export const handleExportPdf = <T extends object>(pdfHeaders: Column<T>[], exportData: T[], fileTitle: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 10;
  const cellPadding = 2;
  const startY = 20;
  let currentY = startY;

  const headers = pdfHeaders.map((col) => col.header);
  const columnWidths = headers.map(() => (pageWidth - margin * 2) / headers.length);

  // Draw headers
  let currentX = margin;
  doc.setFontSize(10);
  headers.forEach((header, index) => {
    doc.rect(currentX, currentY, columnWidths[index], 10);
    doc.text(header, currentX + cellPadding, currentY + 7);
    currentX += columnWidths[index];
  });
  currentY += 10;

  // Draw rows
  exportData.forEach((row) => {
    currentX = margin;
    let rowHeight = 10;

    pdfHeaders.forEach((col, index) => {
      const cellData = (row[col.field as keyof T] || 'N/A').toString();
      const cellTextLines = doc.splitTextToSize(cellData, columnWidths[index] - cellPadding * 2);
      const cellHeight = cellTextLines.length * 5 + cellPadding * 2;
      rowHeight = Math.max(rowHeight, cellHeight);
    });

    // Page-break check
    if (currentY + rowHeight > doc.internal.pageSize.height - margin) {
      doc.addPage();
      currentY = margin;
    }

    pdfHeaders.forEach((col, index) => {
      const cellData = (row[col.field as keyof T] || 'N/A').toString();
      const cellTextLines = doc.splitTextToSize(cellData, columnWidths[index] - cellPadding * 2);
      doc.rect(currentX, currentY, columnWidths[index], rowHeight);
      doc.text(cellTextLines, currentX + cellPadding, currentY + 5);
      currentX += columnWidths[index];
    });

    currentY += rowHeight;
  });

  doc.save(`${fileTitle}.pdf`);
};

export const handleCopy = <T extends object>(headers: Column<T>[], exportData: T[]) => {
  const textToCopy = exportData
    .map((row) => headers.map((col) => row[col.field as keyof T] || 'N/A').join('\t'))
    .join('\n');
  navigator.clipboard.writeText(textToCopy);
};

export const handlePrint = <T extends object>(headers: Column<T>[], exportData: T[], fileTitle: string) => {
  const headerRow = headers.map((col) => `<th>${col.header}</th>`).join('');
  const bodyRows = exportData
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    .map((row) => `<tr>${headers.map((col) => `<td>${row[col.field as keyof T] || 'N/A'}</td>`).join('')}</tr>`)
    .join('');

  const printWindow = window.open('', '', 'width=800,height=600');
  const printableContent = `
      <html>
        <head>
          <title>${fileTitle}</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <table>
            <thead><tr>${headerRow}</tr></thead>
            <tbody>${bodyRows}</tbody>
          </table>
        </body>
      </html>`;
  printWindow?.document.write(printableContent);
  printWindow?.document.close();
  printWindow?.focus();
  printWindow?.print();
  printWindow?.close();
};
