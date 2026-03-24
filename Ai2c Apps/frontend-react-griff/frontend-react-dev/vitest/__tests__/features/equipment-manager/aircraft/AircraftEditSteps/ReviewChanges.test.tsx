import { beforeEach, describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import ReviewChangesStep from '@features/equipment-manager/aircraft/AircraftEditSteps/ReviewChanges';

const mockData = {
  model: [],
}

describe('ReviewChangesStep Test', () => {

  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <ReviewChangesStep data={mockData} columns={[]} />
      </ThemedTestingComponent>
    );
  });

  it('should render all components with their labels', () => {
    expect(screen.getByTestId('pmx-comparison-table')).toBeInTheDocument();
  });
});
