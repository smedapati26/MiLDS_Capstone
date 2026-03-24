import { describe, expect, it } from 'vitest';
import { RenderHelper } from 'vitest/helpers/RenderHelper';

import { screen } from '@testing-library/react';

import { SoldierManagerMain } from '@features/soldier-manager';

// If TabsLayout is complex or deeply integrated, you may want to mock it:
vi.mock('@components/layout/TabsLayout', () => ({
  TabsLayout: () => <div data-testid="mock-soldier-tabs-layout">Mock TabsLayout</div>,
}));

describe('SoldierManagerMain', () => {
  it('renders the Soldier Management heading', () => {
    RenderHelper(<SoldierManagerMain />);
    expect(screen.getByRole('heading', { level: 4 })).toHaveTextContent('Soldier Manager');
  });

  it('renders the TabsLayout component', () => {
    RenderHelper(<SoldierManagerMain />);
    expect(screen.getByTestId('mock-soldier-tabs-layout')).toBeInTheDocument();
  });
});
