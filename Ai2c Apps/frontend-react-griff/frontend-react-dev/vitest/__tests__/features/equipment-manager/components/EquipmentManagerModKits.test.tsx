/* eslint-disable @typescript-eslint/no-explicit-any */

import { vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import EquipmentManagerModKits from '@features/equipment-manager/components/EquipmentManagerModKits';

import { ThemedTestingComponent } from '@vitest/helpers';

// Mock PmxAccordion to just render its children
vi.mock('@components/PmxAccordion', () => ({
  default: ({ children, ...props }: any) => <div data-testid={props['data-testid']}>{children}</div>,
}));

// Mock AddModificationModal
vi.mock('@features/equipment-manager/mods/AddModificationModal', () => ({
  default: ({ open }: any) => (open ? <div data-testid="add-mod-modal">Modification and Kits</div> : null),
}));

// Dummy child component to test mkToggle prop injection
const DummyChild = ({ mkToggle }: { mkToggle: string }) => <div data-testid="dummy-child">{mkToggle}</div>;

describe('EquipmentManagerModKits', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <EquipmentManagerModKits isLoading={false} />
      </ThemedTestingComponent>,
    );
  });
  it('renders the accordion and heading', () => {
    expect(screen.getByTestId('mods-kits-accordion')).toBeInTheDocument();
    expect(screen.getByText('Click a modification to filter your equipment')).toBeInTheDocument();
  });

  it('renders the info text and Add Modification button', () => {
    expect(screen.getByText('Click a modification to filter your equipment')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add modification/i })).toBeInTheDocument();
  });

  it('opens the AddModificationModal when button is clicked', () => {
    expect(screen.queryByTestId('add-mod-modal')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /add modification/i }));
    expect(screen.getByTestId('add-mod-modal')).toBeInTheDocument();
    expect(screen.getByText('Modification and Kits')).toBeInTheDocument();
  });
});

describe('EquipmentManagerModKits dummy child', () => {
  it('renders children and injects mkToggle prop', () => {
    render(
      <ThemedTestingComponent>
        <EquipmentManagerModKits isLoading={false}>
          <DummyChild mkToggle="" />
        </EquipmentManagerModKits>
      </ThemedTestingComponent>,
    );
    // mkToggle should be 'modifications' as per the component
    expect(screen.getByTestId('dummy-child')).toHaveTextContent('modifications');
  });
});
