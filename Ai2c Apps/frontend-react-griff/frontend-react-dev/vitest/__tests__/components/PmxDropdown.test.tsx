import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import PmxDropdown from '@components/PmxDropdown';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

const SAMPLE_OPTIONS = ['Option 1', 'Option 2', 'Option 3'];

type WrapperProps = {
  options?: string[];
  initialValue?: string;
  label?: string;
};

const Wrapper: React.FC<WrapperProps> = ({ options = SAMPLE_OPTIONS, initialValue = '', label = 'Test Label' }) => {
  const [value, setValue] = useState(initialValue);
  return (
    <ThemedTestingComponent>
      <PmxDropdown options={options} value={value} label={label} onChange={setValue} />
    </ThemedTestingComponent>
  );
};

describe('PmxDropdown', () => {
  it('renders with label and initial value', () => {
    render(<Wrapper initialValue="Option 1" />);

    const select = screen.getByLabelText('Test Label');
    expect(select).toBeInTheDocument();
    expect(screen.getByText('Option 1')).toBeInTheDocument();
  });

  it('renders all options', async () => {
    const user = userEvent.setup();
    render(<Wrapper />);

    const select = screen.getByRole('combobox');
    await user.click(select);

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(
      <ThemedTestingComponent>
        <PmxDropdown options={SAMPLE_OPTIONS} value="" label="Test Label" onChange={mockOnChange} />
      </ThemedTestingComponent>,
    );

    const select = screen.getByRole('combobox');
    await user.click(select);
    await user.click(screen.getByText('Option 2'));

    expect(mockOnChange).toHaveBeenCalledWith('Option 2');
  });

  it('handles empty options array', () => {
    render(<Wrapper options={[]} />);

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });

  it('applies containerSx and dropdownSx without errors', () => {
    render(
      <ThemedTestingComponent>
        <PmxDropdown
          options={SAMPLE_OPTIONS}
          value="Option 1"
          label="Test Label"
          onChange={() => {}}
          containerSx={{ margin: '10px' }}
          dropdownSx={{ backgroundColor: 'red' }}
        />
      </ThemedTestingComponent>,
    );

    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
  });
});
