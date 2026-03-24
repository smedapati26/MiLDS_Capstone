// src/tests/MultiEditModal.test.tsx
import { describe, expect, it } from 'vitest';
import { ProviderWrapper } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';

import AircraftTransferTab from '@features/equipment-transfer/Transfer/Aircraft/AircraftTransferTab';

vi.mock('@ai2c/pmx-mui', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    ScrollableLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  };
});

describe('AircraftTransferTab Tests', () => {
  beforeEach(() => {
    render(
      <ProviderWrapper>
        <AircraftTransferTab />
      </ProviderWrapper>,
    );
  });

  it('should include transfer columns and buttons', () => {
    expect(screen.getByText('Transfer From')).toBeInTheDocument();
    expect(screen.getByText('Transfer To')).toBeInTheDocument();
    expect(screen.getByTestId('transfer-add-btn')).toBeInTheDocument();
    expect(screen.getByTestId('transfer-remove-btn')).toBeInTheDocument();
  });
});