import { describe, expect, it } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import { PmxClickableTooltip } from '@components/data-tables';

describe('PmxClickableTooltip', () => {
  it('should render "--" when value is not provided', () => {
    render(<PmxClickableTooltip title="Tooltip Title" />);
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('should render the value and show tooltip on click', () => {
    render(<PmxClickableTooltip value="Test Value" title="Tooltip Title" />);
    const link = screen.getByText('Test Value');
    expect(link).toBeInTheDocument();

    fireEvent.click(link);
    expect(screen.getByTestId('table-value-with-tooltip')).toBeInTheDocument();
    expect(screen.getByText('Tooltip Title')).toBeInTheDocument();
  });
});
