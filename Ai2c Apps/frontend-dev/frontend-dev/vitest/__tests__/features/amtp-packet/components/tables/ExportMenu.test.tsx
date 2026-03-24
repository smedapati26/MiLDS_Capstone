import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import ExportMenu from '@features/amtp-packet/components/tables/ExportMenu';

describe('ExportMenu Component', () => {
  it('should open the main menu when the export-btn is clicked', () => {
    render(
      <ExportMenu
        handleCsv={vi.fn()}
        handlePdf={vi.fn()}
        handleExcel={vi.fn()}
        handleCopy={vi.fn()}
        handlePrint={vi.fn()}
      />,
    );

    const menuButton = screen.getByLabelText('export-btn');
    fireEvent.click(menuButton);

    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Print')).toBeInTheDocument();
  });

  it('should open the submenu when "Export" is clicked', () => {
    render(
      <ExportMenu
        handleCsv={vi.fn()}
        handlePdf={vi.fn()}
        handleExcel={vi.fn()}
        handleCopy={vi.fn()}
        handlePrint={vi.fn()}
      />,
    );

    const menuButton = screen.getByLabelText('export-btn');
    fireEvent.click(menuButton);

    const exportMenuItem = screen.getByText('Export');
    fireEvent.click(exportMenuItem);

    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
  });
});
