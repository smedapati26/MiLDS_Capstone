import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import AGSECard from '@features/equipment-manager/agse/components/AGSECard';

import { mockAggregateCondition } from '@vitest/mocks/griffin_api_handlers/agse/mock_data';

describe('AGSECard', () => {
  it('testing component renders correctly', () => {
    render(
      <ThemedTestingComponent>
        <AGSECard data={mockAggregateCondition[0]} />
      </ThemedTestingComponent>,
    );

    expect(screen.getByText('FMC')).toBeInTheDocument();
    expect(screen.getByText('PMC')).toBeInTheDocument();
    expect(screen.getByText('NMC')).toBeInTheDocument();

    expect(screen.getByText('129')).toBeInTheDocument();
    expect(screen.getAllByText('\u2014').length).toEqual(2);
  });
});
