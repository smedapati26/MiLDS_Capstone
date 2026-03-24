import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { SelectChangeEvent } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import InspectionsDropdown from '@components/dropdowns/InspectionsDropdown';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

const SAMPLE_INSPECTION_TYPES = [
  { id: 1, commonName: 'Visual Inspection', code: 'VI' },
  { id: 2, commonName: 'Functional Test', code: 'FT' },
  { id: 3, commonName: 'Maintenance Check', code: 'MC' },
  { id: 4, commonName: 'Safety Audit', code: 'SA' },
];

type WrapperProps = {
  inspectionTypes?: typeof SAMPLE_INSPECTION_TYPES;
  selectedInspectionReferenceId?: number | null;
  isLoading?: boolean;
  disabled?: boolean;
};

const Wrapper: React.FC<WrapperProps> = ({
  inspectionTypes = SAMPLE_INSPECTION_TYPES,
  selectedInspectionReferenceId = null,
  isLoading = false,
  disabled = false,
}) => {
  const [value, setValue] = useState<number | ''>(selectedInspectionReferenceId ?? '');
  const handleChange = (event: SelectChangeEvent<number>) => {
    setValue(event.target.value as number | '');
  };
  return (
    <ThemedTestingComponent>
      <InspectionsDropdown
        inspectionTypes={inspectionTypes}
        selectedInspectionReferenceId={value === '' ? null : value}
        onChange={handleChange}
        isLoading={isLoading}
        disabled={disabled}
      />
    </ThemedTestingComponent>
  );
};

describe('InspectionsDropdown', () => {
  it('renders with label "Inspection Type"', () => {
    render(<Wrapper />);

    expect(screen.getByLabelText('Inspection Type')).toBeInTheDocument();
  });

  it('renders Skeleton when isLoading is true', () => {
    render(<Wrapper isLoading={true} />);

    expect(screen.getByText('Inspection Type')).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders Select when not loading', () => {
    render(<Wrapper />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('Select is disabled when disabled prop is true', () => {
    render(<Wrapper disabled={true} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveAttribute('aria-disabled', 'true');
  });

  it('renders options correctly sorted', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    const select = screen.getByRole('combobox');
    await user.click(select);

    const menuItems = screen.getAllByRole('option');
    expect(menuItems).toHaveLength(4);
    // Assuming sorted: FT, MC, SA, VI (all distinct? Wait, all have different code)
    // In sample, all commonName != code, so sorted alpha: FT, MC, SA, VI
    expect(menuItems[0]).toHaveTextContent('Functional Test - FT');
    expect(menuItems[1]).toHaveTextContent('Maintenance Check - MC');
    expect(menuItems[2]).toHaveTextContent('Safety Audit - SA');
    expect(menuItems[3]).toHaveTextContent('Visual Inspection - VI');
  });

  it('calls onChange when an option is selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <ThemedTestingComponent>
        <InspectionsDropdown
          inspectionTypes={SAMPLE_INSPECTION_TYPES}
          selectedInspectionReferenceId={null}
          onChange={mockOnChange}
          isLoading={false}
          disabled={false}
        />
      </ThemedTestingComponent>,
    );

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('Functional Test - FT'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    // Check the event
  });

  it('handles empty inspectionTypes array', () => {
    render(<Wrapper inspectionTypes={[]} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});
