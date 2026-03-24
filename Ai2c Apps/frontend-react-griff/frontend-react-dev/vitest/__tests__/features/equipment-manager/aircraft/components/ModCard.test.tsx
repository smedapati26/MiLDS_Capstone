import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import ModCard from '@features/equipment-manager/aircraft/components/ModCard';

import { ThemedTestingComponent } from '@vitest/helpers';

const mockOnClick = vi.fn(); // Mock function for onClick
const props = {
  title: 'Mod 1',
  count: 5,
  isSelected: false,
  onClick: mockOnClick,
};

describe('ModCard Component', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <ModCard {...props} />
      </ThemedTestingComponent>,
    );
  });

  it('should renders card correctly', () => {
    expect(screen.getByText('Mod 1')).toBeInTheDocument();

    // Check if the count is rendered
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('calls onClick with the correct argument when clicked', () => {
    const card = screen.getByTestId('mod-card'); // The card is clickable

    // Simulate clicking the card
    fireEvent.click(card);

    // Verify that the onClick callback was called with the correct argument
    expect(mockOnClick).toHaveBeenCalledWith('Mod 1');
  });
});

describe('when clicked', () => {
  it('changes border color based on isSelected prop', () => {
    const selectedProps = { ...props, isSelected: true };

    render(
      <ThemedTestingComponent>
        <ModCard {...selectedProps} />
      </ThemedTestingComponent>,
    );

    const card = screen.getByTestId('mod-card');

    // Verify that the card has the selected border color
    expect(card).toHaveStyle(`border-color: rgb(77, 166, 255)`);
  });
});
