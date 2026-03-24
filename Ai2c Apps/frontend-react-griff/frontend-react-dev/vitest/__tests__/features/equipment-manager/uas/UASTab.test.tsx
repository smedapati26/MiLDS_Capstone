import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import * as EquipmentManagerContext from '@features/equipment-manager/EquipmentManagerContext';
import UASTab from '@features/equipment-manager/uas/UasTab';

import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@features/equipment-manager/uas/UasOverviewCarousel', () => ({
  default: () => <div data-testid="em-uas-carousel" />,
}));
vi.mock('@features/equipment-manager/uas/UasEquipmentDetailSection', () => ({
  default: () => <div data-testid="uas-equipment-details" />,
}));

describe('UASTab', () => {
  beforeEach(() => {
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('test');
    render(
      <ThemedTestingComponent>
        <EquipmentManagerContext.EquipmentManagerProvider>
          <UASTab />
        </EquipmentManagerContext.EquipmentManagerProvider>
      </ThemedTestingComponent>,
    );
  });

  it('test UASTab renders correctly', () => {
    // main container
    const layout = screen.getByTestId('em-uas-tab');
    expect(layout).toBeInTheDocument();

    // child components
    expect(screen.getByTestId('em-uas-carousel')).toBeInTheDocument();
    expect(screen.getByTestId('uas-equipment-details')).toBeInTheDocument();
  });
});
