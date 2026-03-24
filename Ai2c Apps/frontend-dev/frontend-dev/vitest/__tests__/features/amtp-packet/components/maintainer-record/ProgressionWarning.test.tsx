import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import ProgressionWarning from '@features/amtp-packet/components/maintainer-record/ProgressionWarning';
import { amtpPacketSlice } from '@features/amtp-packet/slices';
import { useAppSelector } from '@store/hooks';

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

const mockStore = configureStore({
  reducer: {
    [amtpPacketSlice.reducerPath]: amtpPacketSlice.reducer,
  },
});

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>,
  );
};

describe('ProgressionWarning Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      amtpPacket: {
        maintainer: { name: 'Cpt Test User' },
      },
    });
  });

  it('renders the doctrine update message', () => {
    renderWithProviders(<ProgressionWarning isReadOnly={false} />);
    expect(screen.getByText('Doctrine Update')).toBeInTheDocument();
  });

  it('renders progression event instructions when isReadOnly is false', () => {
    renderWithProviders(<ProgressionWarning isReadOnly={false} />);

    expect(screen.getByText('Change this event to an evaluation.')).toBeInTheDocument();
    expect(screen.getByText('Remove the progression from this event.')).toBeInTheDocument();
  });

  it('renders formatted maintainer contact information when isReadOnly is true', () => {
    renderWithProviders(<ProgressionWarning isReadOnly={true} />);

    expect(screen.getByText('Contact Support')).toBeInTheDocument();
  });
});
