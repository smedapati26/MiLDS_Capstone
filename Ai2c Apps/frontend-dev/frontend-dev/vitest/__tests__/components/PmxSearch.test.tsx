import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import PmxSearch from '@components/PmxSearch';

describe('PmxSearch Component', () => {
  const mockOnChange = vi.fn();

  const renderComponent = (props = {}) =>
    render(<PmxSearch placeholder="Search here..." value="" onChange={mockOnChange} {...props} />);

  it('renders correctly with the placeholder text', () => {
    renderComponent();

    const searchInput = screen.getByPlaceholderText('Search here...');
    expect(searchInput).toBeInTheDocument();
  });

  it('displays the correct value', () => {
    renderComponent({ value: 'Test Query' });

    const searchInput = screen.getByPlaceholderText('Search here...');
    expect(searchInput).toHaveValue('Test Query');
  });

  it('renders the search icon', () => {
    renderComponent();

    const searchIcon = screen.getByTestId('SearchIcon');
    expect(searchIcon).toBeInTheDocument();
  });
});
