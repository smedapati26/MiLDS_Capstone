import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import PmxSlider from '@components/PmxSlider';

describe('PmxSlider', () => {
  const defaultProps = {
    label: 'Test Label',
    value: 50,
    handleChange: vi.fn(),
    min: 0,
    max: 100,
    isPercentage: false,
  };

  it('renders correctly with label', () => {
    render(<PmxSlider {...defaultProps} />);

    const labelElement = screen.getByText('Test Label');
    expect(labelElement).toBeInTheDocument();
  });

  it('handles input change correctly', () => {
    render(<PmxSlider {...defaultProps} hasInput />);
    const inputElement = screen.getByRole('spinbutton');

    fireEvent.change(inputElement, { target: { value: '75' } });
    expect(inputElement).toHaveValue(75);
    expect(defaultProps.handleChange).toHaveBeenCalledWith(null, 75);
  });

  it('displays error message when input is below min', () => {
    render(<PmxSlider {...defaultProps} hasInput min={10} />);
    const inputElement = screen.getByRole('spinbutton');

    fireEvent.change(inputElement, { target: { value: '5' } });
    expect(screen.getByText('Value must be at least 10')).toBeInTheDocument();
  });

  it('displays error message when input is above max', () => {
    render(<PmxSlider {...defaultProps} hasInput max={90} />);
    const inputElement = screen.getByRole('spinbutton');

    fireEvent.change(inputElement, { target: { value: '95' } });
    expect(screen.getByText('Value must be at most 90')).toBeInTheDocument();
  });

  it('handles slider change correctly', () => {
    render(<PmxSlider {...defaultProps} />);
    const slider = screen.getByRole('slider');

    fireEvent.change(slider, { target: { value: 60 } });
    expect(defaultProps.handleChange).toHaveBeenCalledWith(null, 60);
  });

  it('renders as percentage when isPercentage is true', () => {
    render(<PmxSlider {...defaultProps} isPercentage value={50} hasInput />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('50%');
  });
});
