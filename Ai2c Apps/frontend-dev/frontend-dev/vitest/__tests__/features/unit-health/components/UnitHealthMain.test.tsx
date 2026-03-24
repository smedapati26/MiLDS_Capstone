import { describe, expect, it } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';

import { screen } from '@testing-library/react';

import UnitHealthMain from '@features/unit-health/components/UnitHealthMain';

  vi.mock("@ai2c/pmx-mui", async (importOriginal) => {
    const actual = await importOriginal()
    return {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
      ...actual,
      TabsLayout: () => <div data-testid="mock-tabs-layout">Mock TabsLayout</div>
      // your mocked methods
    }
  })
  

describe('UnitHealthMain', () => {
  it('renders UnitHealthMain component correctly', () => {
    renderWithProviders(<UnitHealthMain />);

    // Verify the title is rendered
    expect(screen.getByText('Unit Health')).toBeInTheDocument();

    // Verify the Mock Tab layout is rendered
    expect(screen.getByText('Mock TabsLayout')).toBeInTheDocument();
    
    // // Verify the Dashboard Tab is rendered
    // expect(screen.getByText('DashboardTab')).toBeInTheDocument();

    // // Verify the Roster Tab is rendered
    // expect(screen.getByText('Roster')).toBeInTheDocument();

    // // Verify the Reports Tab component is rendered
    // expect(screen.getByText('Reports')).toBeInTheDocument();
  });
});
