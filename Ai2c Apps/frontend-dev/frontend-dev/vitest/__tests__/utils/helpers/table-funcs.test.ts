import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as XLSX from 'xlsx';

import {
  handleCopy,
  handleExportCsv,
  handleExportExcel,
  handleExportPdf,
  handlePrint,
} from '@utils/helpers/table-funcs';

vi.mock('xlsx', () => ({
  utils: {
    aoa_to_sheet: vi.fn(),
    book_new: vi.fn(),
    book_append_sheet: vi.fn(),
  },
  writeFile: vi.fn(),
}));

import { Column } from '@ai2c/pmx-mui';

const columns: Column<{ column1: string; column2: string }>[] = [
  { field: 'column1', header: 'Column 1' },
  { field: 'column2', header: 'Column 2' },
];

describe('Utility Functions Tests', () => {
  const mockExportData = [
    { column1: 'Value1', column2: 'Value2' },
    { column1: 'Value3', column2: 'Value4' },
  ];
  const mockHeaders = [
    { field: 'column1', header: 'Column 1' },
    { field: 'column2', header: 'Column 2' },
  ];
  const mockFileTitle = 'TestFile';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('exports CSV correctly', () => {
    const mockElement = {
      setAttribute: vi.fn(),
      click: vi.fn(),
    };

    const createElementSpy = vi
      .spyOn(document, 'createElement')
      .mockReturnValue(mockElement as unknown as HTMLAnchorElement);

    const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => {
      return node;
    });

    const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => {
      return node;
    });

    handleExportCsv(mockExportData, mockFileTitle);

    const expectedCsvContent =
      'data:text/csv;charset=utf-8,' + mockExportData.map((row) => Object.values(row).join(',')).join('\n');

    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockElement.setAttribute).toHaveBeenCalledWith('href', encodeURI(expectedCsvContent));
    expect(mockElement.setAttribute).toHaveBeenCalledWith('download', `${mockFileTitle}.csv`);
    expect(mockElement.click).toHaveBeenCalled();
    expect(appendChildSpy).toHaveBeenCalledWith(mockElement);
    expect(removeChildSpy).toHaveBeenCalledWith(mockElement);
  });

  it('exports Excel correctly', () => {
    const mockWorksheet = {};
    const mockWorkbook = {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: {},
      },
    };

    // Mock XLSX utils methods
    vi.spyOn(XLSX.utils, 'aoa_to_sheet').mockReturnValue(mockWorksheet);

    vi.spyOn(XLSX.utils, 'book_new').mockReturnValue(mockWorkbook);

    handleExportExcel(columns, mockExportData, mockFileTitle);
  });

  it('exports PDF correctly', () => {
    handleExportPdf(columns, mockExportData, mockFileTitle);
  });

  it('copies data to clipboard', async () => {
    const mockClipboard = {
      writeText: vi.fn(),
    };
    Object.assign(navigator, { clipboard: mockClipboard });

    handleCopy(columns, mockExportData);

    const expectedText = mockExportData
      .map((row) => mockHeaders.map((col) => row[col.field as keyof typeof row] || 'N/A').join('\t'))
      .join('\n');

    expect(mockClipboard.writeText).toHaveBeenCalledWith(expectedText);
  });

  it('handles Print functionality correctly', () => {
    const mockWrite = vi.fn();
    const mockClose = vi.fn();
    const mockFocus = vi.fn();
    const mockPrint = vi.fn();

    // Mock the return value of `window.open`
    const mockWindowOpen = vi.spyOn(window, 'open').mockImplementation(() => ({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-expect-error
      document: {
        write: mockWrite,
        close: mockClose,
      },
      focus: mockFocus,
      print: mockPrint,
      close: mockClose,
    }));

    handlePrint(columns, mockExportData, mockFileTitle);

    expect(mockWindowOpen).toHaveBeenCalledWith('', '', 'width=800,height=600');
    expect(mockWrite).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalledTimes(2);
    expect(mockFocus).toHaveBeenCalled();
    expect(mockPrint).toHaveBeenCalled();
  });
});
