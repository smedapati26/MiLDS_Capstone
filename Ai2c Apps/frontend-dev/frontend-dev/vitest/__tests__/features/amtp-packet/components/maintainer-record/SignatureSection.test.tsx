import React, { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, render, screen } from '@testing-library/react';

import SignatureSection from '@features/amtp-packet/components/maintainer-record/SignatureSection';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={createTheme()}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>,
  );
};

// Test Wrapper to manage real state updates
const TestWrapper = () => {
  const [signature, setSignature] = useState({ signatureOne: false, signatureTwo: false });

  // Mock app user & maintainer data for labels
  vi.mocked(useAppSelector).mockImplementation((selector) => {
    if (selector.name === 'appSettings') return { appUser: { rank: 'Sgt', firstName: 'John', lastName: 'Doe' } };
    if (selector.name === 'amtpPacket') return { maintainer: { name: 'Maintainer Name' } };
    return null;
  });

  return <SignatureSection signature={signature} setSignature={setSignature} />;
};

describe('SignatureSection Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders confirmation text and checkboxes', () => {
    renderWithProviders(<TestWrapper />);

    expect(screen.getByText('Confirmation*')).toBeInTheDocument();
    expect(screen.getByText('Signature needed from both parties')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  });

  it('updates signatureOne when checkbox is clicked', () => {
    renderWithProviders(<TestWrapper />);

    const signatureOneCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(signatureOneCheckbox);

    expect(signatureOneCheckbox).toBeChecked();
  });

  it('updates signatureTwo when checkbox is clicked', () => {
    renderWithProviders(<TestWrapper />);

    const signatureTwoCheckbox = screen.getAllByRole('checkbox')[1];
    fireEvent.click(signatureTwoCheckbox);

    expect(signatureTwoCheckbox).toBeChecked();
  });
});
