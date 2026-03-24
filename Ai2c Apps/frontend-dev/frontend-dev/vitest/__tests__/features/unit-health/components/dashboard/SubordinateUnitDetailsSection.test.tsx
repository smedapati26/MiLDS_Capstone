import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, ThemedTestingComponent } from 'vitest/helpers';

import { screen } from '@testing-library/react';

import { Echelon } from '@ai2c/pmx-mui';

import SubordinateUnitDetailsSection from '@features/unit-health/components/dashboard/SubordinateUnitDetailsSection';

describe('Dashboard Tests', () => {
  it('renders correctly with unloaded/undefined data', () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <SubordinateUnitDetailsSection
          loading={false}
          childUnits={[]}
          asOfDate={dayjs('05/12/2100')}
          setSelectedUnit={() => {}}
          setUnitTraversal={() => {}}
        />
      </ThemedTestingComponent>,
    );

    const divElements = screen.queryByLabelText('Subordinate Unit Details Section');
    const subordinateUnitSelect = screen.queryByRole('combobox', { name: 'Subordinate' });
    const subordinateUnitEvaluations = screen.queryByLabelText('Subordinate Unit Evaluations');
    const subordinateUnitAvailability = screen.queryByLabelText('Subordinate Unit Availability');

    expect(divElements).not.toBeInTheDocument();
    expect(subordinateUnitSelect).not.toBeInTheDocument();
    expect(subordinateUnitEvaluations).not.toBeInTheDocument();
    expect(subordinateUnitAvailability).not.toBeInTheDocument();
  });

  it('renders correctly with data', () => {
    renderWithProviders(
      <ThemedTestingComponent>
        <SubordinateUnitDetailsSection
          loading={false}
          childUnits={[
            {
              uic: '12345',
              echelon: Echelon.BATTALION,
              component: 'Component',
              level: 1,
              shortName: 'Short Name',
              displayName: 'Display Name',
              nickName: 'Nick Name',
              state: 'State',
              parentUic: 'Parent Unit',
            },
          ]}
          asOfDate={dayjs('05/12/2100')}
          setSelectedUnit={() => {}}
          setUnitTraversal={() => {}}
        />
      </ThemedTestingComponent>,
    );

    const divElements = screen.getByLabelText('Subordinate Unit Details Section');
    // const subordinateUnitSelect = screen.getByRole('combobox', { name: 'Subordinate' });
    const subordinateUnitEvaluations = screen.getByLabelText('Subordinate Unit Evaluations');
    const subordinateUnitAvailability = screen.getByLabelText('Subordinate Unit Availability');

    expect(divElements).toBeInTheDocument();
    // expect(subordinateUnitSelect).toBeInTheDocument();
    expect(subordinateUnitEvaluations).toBeInTheDocument();
    expect(subordinateUnitAvailability).toBeInTheDocument();
  });
});
