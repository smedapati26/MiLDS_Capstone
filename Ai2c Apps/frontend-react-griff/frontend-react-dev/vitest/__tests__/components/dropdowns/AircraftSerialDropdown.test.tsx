import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import AircraftSerialDropdown from '@components/dropdowns/AircraftSerialDropdown';

import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

// Mocking the hooks
vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/griffin_api/aircraft/slices', () => ({
  useGetAircraftByUicQuery: vi.fn(),
}));

const sampleAircraftData = [{ serial: 'SN123' }, { serial: 'SN456' }, { serial: 'SN789' }];

describe('AircraftSerialDropdown', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('WDYFAA');
    (useGetAircraftByUicQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: sampleAircraftData,
      isLoading: false,
    });
  });

  it('renders correctly with label', () => {
    render(<AircraftSerialDropdown values={[]} handleSelect={vi.fn()} />);
    const labelElement = screen.getAllByText('Serial Numbers');
    expect(labelElement).toHaveLength(2);
  });

  it('displays aircraft serial options correctly', () => {
    render(<AircraftSerialDropdown values={[]} handleSelect={vi.fn()} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const dropdown = document.querySelector('.MuiPaper-root') as HTMLElement;

    if (dropdown) {
      expect(screen.getByText('SN123')).toBeInTheDocument();
      expect(screen.getByText('SN456')).toBeInTheDocument();
      expect(screen.getByText('SN789')).toBeInTheDocument();
    }
  });

  it('handles option selection correctly', () => {
    const handleSelect = vi.fn();
    render(<AircraftSerialDropdown values={[]} handleSelect={handleSelect} />);
    const combobox = screen.getByRole('combobox');
    fireEvent.mouseDown(combobox);
    const dropdown = document.querySelector('.MuiPaper-root') as HTMLElement;

    if (dropdown) {
      const option = screen.getByText('SN123');
      fireEvent.click(option);
      expect(handleSelect).toHaveBeenCalledWith(['SN123']);
    }
  });
});
