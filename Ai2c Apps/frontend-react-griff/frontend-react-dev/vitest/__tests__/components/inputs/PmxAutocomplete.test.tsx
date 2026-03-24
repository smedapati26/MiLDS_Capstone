import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { PmxAutocomplete } from '@components/inputs/PmxAutocomplete';

import { ThemedTestingComponent } from '../../../helpers/ThemedTestingComponent';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemedTestingComponent>{component}</ThemedTestingComponent>);
};

const mockOptions = [
  { label: 'Option 1', value: 'value1' },
  { label: 'Option 2', value: 'value2' },
  { label: 'Option 3', value: 'value3' },
];

describe('PmxAutocomplete', () => {
  describe('Basic Rendering', () => {
    it('renders the autocomplete input', () => {
      const handleChange = vi.fn();
      renderWithTheme(<PmxAutocomplete options={mockOptions} value={null} onChange={handleChange} />);

      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders label when provided', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <PmxAutocomplete options={mockOptions} value={null} onChange={handleChange} label="Test Label" />,
      );

      expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    });

    it('does not render label when not provided', () => {
      const handleChange = vi.fn();
      renderWithTheme(<PmxAutocomplete options={mockOptions} value={null} onChange={handleChange} />);

      expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
    });

    it('displays helper text when provided', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <PmxAutocomplete options={mockOptions} value={null} onChange={handleChange} helperText="Helper text" />,
      );

      expect(screen.getByText('Helper text')).toBeInTheDocument();
    });
  });

  describe('Props Forwarding', () => {
    it('forwards additional props to Autocomplete', () => {
      const handleChange = vi.fn();
      renderWithTheme(
        <PmxAutocomplete
          options={mockOptions}
          value={null}
          onChange={handleChange}
          data-testid="custom-autocomplete"
        />,
      );

      expect(screen.getByTestId('custom-autocomplete')).toBeInTheDocument();
    });
  });
});
