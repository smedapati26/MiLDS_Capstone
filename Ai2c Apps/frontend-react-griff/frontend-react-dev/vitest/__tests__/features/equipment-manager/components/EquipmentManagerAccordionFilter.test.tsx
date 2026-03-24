import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import EquipmentManagerAccordionFilter from '@features/equipment-manager/components/EquipmentManagerAccordionFilter';

describe('EquipmentManagerAccordionFilter', () => {
  const mockHandleToggle = vi.fn();
  const mockOnChange = vi.fn();

  it('renders correctly', () => {
    render(
      <EquipmentManagerAccordionFilter
        handleToggle={mockHandleToggle}
        toggle={false}
        searchOptions=""
        onChange={mockOnChange}
      />,
    );

    // Check that the Expand/Collapse All link is rendered
    expect(screen.getByText('Expand/Collapse All')).toBeInTheDocument();

    // Check that the FilterList button is rendered
    expect(screen.getByTestId('filter-button')).toBeInTheDocument();

    // Check that the SearchBar is rendered
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('calls handleToggle when clicking Expand/Collapse All link', () => {
    render(
      <EquipmentManagerAccordionFilter
        handleToggle={mockHandleToggle}
        toggle={false}
        searchOptions=""
        onChange={mockOnChange}
      />,
    );

    const expandCollapseLink = screen.getByText('Expand/Collapse All');
    fireEvent.click(expandCollapseLink);

    // Verify that handleToggle is called
    expect(mockHandleToggle).toHaveBeenCalledTimes(1);
  });

  it('calls handleToggle when clicking the FilterList button', () => {
    render(
      <EquipmentManagerAccordionFilter
        handleToggle={mockHandleToggle}
        toggle={false}
        searchOptions=""
        onChange={mockOnChange}
      />,
    );

    const filterButton = screen.getByTestId('filter-button');
    fireEvent.click(filterButton);

    // Verify that handleToggle is called
    expect(mockHandleToggle).toHaveBeenCalledTimes(2);
  });

  it('rotates the FilterList button based on toggle prop', () => {
    const { rerender } = render(
      <EquipmentManagerAccordionFilter
        handleToggle={mockHandleToggle}
        toggle={false}
        searchOptions=""
        onChange={mockOnChange}
      />,
    );

    const filterButton = screen.getByTestId('filter-button');

    // Initially, the button should not be rotated
    expect(filterButton).toHaveStyle('transform: rotate(0deg)');

    // Rerender with toggle set to true
    rerender(
      <EquipmentManagerAccordionFilter
        handleToggle={mockHandleToggle}
        toggle={true}
        searchOptions=""
        onChange={mockOnChange}
      />,
    );

    // Now, the button should be rotated
    expect(filterButton).toHaveStyle('transform: rotate(180deg)');
  });
});
