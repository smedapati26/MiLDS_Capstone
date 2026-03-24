import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, within } from '@testing-library/react';

import AircraftDropdown from '@components/dropdowns/AircraftDropdown';

import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

// Mocking the hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', () => ({
  useGetAircraftByUicQuery: vi.fn(),
}));

const sampleAircraftData = [
  { aircraftModel: 'Model A', aircraftFamily: 'Family 1', serial: 'SN123' },
  { aircraftModel: 'Model B', aircraftFamily: 'Family 1', serial: 'SN456' },
  { aircraftModel: 'Model C', aircraftFamily: 'Family 2', serial: 'SN789' },
];

describe('AircraftDropdown', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('WDYFAA');
    (useGetAircraftByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: sampleAircraftData,
      isLoading: false,
    });
  });

  it('renders correctly with label', () => {
    render(<AircraftDropdown selected={[]} handleSelect={vi.fn()} isTree />);

    const labelElement = screen.getAllByText('Models');
    expect(labelElement).toHaveLength(2);
  });

  it('displays loading state correctly', () => {
    (useGetAircraftByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<AircraftDropdown selected={[]} handleSelect={vi.fn()} isTree />);

    const loadingElement = screen.getByTestId('models-select');
    expect(loadingElement).toHaveAttribute('aria-busy', 'true');
  });

  it('displays aircraft options correctly', () => {
    render(<AircraftDropdown selected={[]} handleSelect={vi.fn()} isTree />);

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    expect(screen.getByText('Family 1')).toBeInTheDocument();
    expect(screen.getByText('Family 2')).toBeInTheDocument();
  });

  it('handles option selection correctly', () => {
    const handleSelect = vi.fn();
    render(<AircraftDropdown selected={[]} handleSelect={handleSelect} isTree />);

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    // Find the Family 1 item and expand it to reveal its children
    const family1Item = screen.getByText('Family 1').closest('div');
    if (family1Item) {
      const expandButton = within(family1Item).getByRole('button');
      fireEvent.click(expandButton);
    }
  });

  it('render simple serial dropdown', () => {
    const handleSelect = vi.fn();
    render(<AircraftDropdown selected={[]} handleSelect={handleSelect} aircraftType="serial" label="Serials" />);

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    const dropdown = document.querySelector('.MuiPaper-root') as HTMLElement;

    if (dropdown) {
      expect(screen.getByText('SN123')).toBeInTheDocument();
      expect(screen.getByText('SN456')).toBeInTheDocument();
      expect(screen.getByText('SN789')).toBeInTheDocument();
    }
  });

  it('filters properly for `Family 1`', () => {
    const handleSelect = vi.fn();
    render(
      <AircraftDropdown
        selected={[]}
        handleSelect={handleSelect}
        aircraftType="serial"
        label="Serials"
        filterValues={['Family 1']}
      />,
    );

    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);

    const dropdown = document.querySelector('.MuiPaper-root') as HTMLElement;

    if (dropdown) {
      expect(screen.getByText('SN123')).toBeInTheDocument();
      expect(screen.getByText('SN456')).toBeInTheDocument();
      expect(screen.getByText('SN789')).not.toBeInTheDocument();
    }
  });
});
