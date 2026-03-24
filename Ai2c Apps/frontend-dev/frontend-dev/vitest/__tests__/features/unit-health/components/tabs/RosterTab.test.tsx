import { describe, expect, it } from 'vitest';
import { RenderHelper } from 'vitest/helpers/RenderHelper';

import { screen } from '@testing-library/react';

import RosterTab from '@features/unit-health/components/tabs/RosterTab';

describe('RosterTab Tests', () => {
  it('renders correctly', () => {
    RenderHelper(<RosterTab />);

    const divElements = screen.getByLabelText("Roster Tab");
    const unitSelect = screen.getByRole('textbox', {name:'Unit'});
    const asOfDate = screen.getByLabelText('As Of Date');
    const rosterTable = screen.getByLabelText("Unit Roster Table");

    expect(divElements).toBeInTheDocument();
    expect(unitSelect).toBeInTheDocument();
    expect(asOfDate).toBeInTheDocument();
    expect(rosterTable).toBeInTheDocument();
  });
});
