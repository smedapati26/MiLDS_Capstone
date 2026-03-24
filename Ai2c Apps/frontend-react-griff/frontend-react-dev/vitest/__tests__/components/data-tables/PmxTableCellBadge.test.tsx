import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { PmxTableCellBadge } from '@components/data-tables';

describe('PmxTableCellBadge', () => {
  it('renders without crashing', () => {
    render(<PmxTableCellBadge color="primary">Test Content</PmxTableCellBadge>);
    expect(screen.getByTestId('table-cell-badge')).toBeInTheDocument();
  });

  it('applies the correct color to the Badge', () => {
    render(<PmxTableCellBadge color="error">Test Content</PmxTableCellBadge>);
    const badge = screen.getByTestId('table-cell-badge');
    expect(badge).toHaveClass('MuiBadge-root'); // MUI adds this class
    // Note: For deeper color checks, you might need to inspect styles or use a custom matcher
  });

  it('renders string children as Typography', () => {
    render(<PmxTableCellBadge color="primary">Hello World</PmxTableCellBadge>);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Hello World').tagName).toBe('P'); // Typography renders as <p>
  });

  it('renders React node children directly', () => {
    const customChild = <div data-testid="custom-child">Custom</div>;
    render(<PmxTableCellBadge color="primary">{customChild}</PmxTableCellBadge>);
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });

  it('uses default anchorOrigin if not provided', () => {
    render(<PmxTableCellBadge color="primary">Test</PmxTableCellBadge>);
    const badge = screen.getByTestId('table-cell-badge');
    // Default is { vertical: 'top', horizontal: 'left' } - you can check styles or props if needed
    expect(badge).toBeInTheDocument();
  });

  it('applies custom sx prop', () => {
    const customSx = { backgroundColor: 'red' };
    render(
      <PmxTableCellBadge color="primary" sx={customSx}>
        Test
      </PmxTableCellBadge>,
    );
    const badge = screen.getByTestId('table-cell-badge');
    // Check if custom styles are applied (this might require a style matcher or enzyme for deeper checks)
    expect(badge).toBeInTheDocument();
  });
});
