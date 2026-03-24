import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';
import { RenderHelper } from 'vitest/helpers/RenderHelper';
import { unitSoldierFlagsMock } from 'vitest/mocks/handlers/transfer-requests/mock_data';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import ManageTab from '@features/soldier-manager/components/tabs/ManageTab';

vi.mock('@hooks/useUnitAccess', () => ({
  default: () => ({
    hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
  }),
}));

describe('ManageTab', () => {
  beforeEach(() => {
    vi.mock('@hooks/useUnitAccess', () => ({
      default: () => ({
        // eslint-disable-next-line sonarjs/no-nested-functions
        hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
      }),
    }));
  });
  it('Renders the tab correctly', () => {
    RenderHelper(
      <ThemedTestingComponent>
        <ManageTab />{' '}
      </ThemedTestingComponent>,
    );
    expect(screen.getByRole('button', { name: 'Create Soldier' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Flag Soldiers' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View Unit Flags' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('Flag Soldier Button Disable and Enable Functionality'),
    async () => {
      const flagSoldiersButton = screen.getByRole('button', { name: 'Flag Soldiers' });
      const checkAllSoldiersButton = screen.getByRole('checkbox', { name: 'Check All Soldiers' });
      const soldier1CheckBox = screen.getByRole('checkbox', { name: `${unitSoldierFlagsMock[0].dod_id}-checkBox` });

      expect(flagSoldiersButton).toBeInTheDocument();
      expect(flagSoldiersButton).toBeDisabled();
      expect(checkAllSoldiersButton).toBeInTheDocument();
      expect(soldier1CheckBox).toBeInTheDocument();

      await waitFor(() => {
        fireEvent.click(checkAllSoldiersButton);
        expect(flagSoldiersButton).toBeEnabled();

        fireEvent.click(checkAllSoldiersButton);
        expect(flagSoldiersButton).toBeDisabled();
      });

      await waitFor(() => {
        fireEvent.click(soldier1CheckBox);
        expect(flagSoldiersButton).toBeEnabled();

        fireEvent.click(soldier1CheckBox);
        expect(flagSoldiersButton).toBeDisabled();
      });
    };

  it('Filters correctly on search'),
    async () => {
      const searchInput = screen.getByPlaceholderText('Search...');
      const unitSoldierFlagsTable = screen.getByRole('table');
      const soldier1Row = screen.getByText('Test MeGee');
      const soldier2Row = screen.getByText('Tester MeGeer');

      expect(unitSoldierFlagsTable).toBeInTheDocument();
      expect(soldier1Row).toBeInTheDocument();
      expect(soldier2Row).toBeInTheDocument();

      await waitFor(() => {
        fireEvent.change(searchInput, { target: { value: 'Test MeGee' } });

        expect(soldier1Row).toBeInTheDocument();
        expect(soldier2Row).not.toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.change(searchInput, { target: { value: 'CPT' } });

        expect(soldier1Row).toBeInTheDocument();
        expect(soldier2Row).not.toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.change(searchInput, { target: { value: 'Available' } });

        expect(soldier1Row).toBeInTheDocument();
        expect(soldier2Row).not.toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.change(searchInput, { target: { value: 'TESTUNIT' } });

        expect(soldier1Row).toBeInTheDocument();
        expect(soldier2Row).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.change(searchInput, { target: { value: 'Viewer' } });

        expect(soldier1Row).toBeInTheDocument();
        expect(soldier2Row).not.toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.change(searchInput, { target: { value: 'TX' } });

        expect(soldier1Row).toBeInTheDocument();
        expect(soldier2Row).not.toBeInTheDocument();
      });
    };
});
