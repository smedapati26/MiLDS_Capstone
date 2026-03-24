import { describe } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';
import { mockDA4856s } from 'vitest/mocks/handlers/amtp-packet/counselings/mock_data';

import SnackbarProvider from '@context/SnackbarProvider';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import EditCounselingDialog from '@features/amtp-packet/components/counselings/EditCounselingDialog';
import { mapToIDA4856 } from '@store/amap_ai/counselings';

const mockSetOpen = vi.fn();

const mockRefetchCounselings = vi.fn();

describe('EditCounselingDialog Tests', () => {
  it('Does not render when not open', () => {
    renderWithProviders(
      <SnackbarProvider>
        <EditCounselingDialog
          counseling={mapToIDA4856(mockDA4856s[0])}
          open={false}
          setOpen={mockSetOpen}
          refetchCounselings={mockRefetchCounselings}
        />
      </SnackbarProvider>,
    );

    const dialogElements = screen.queryByLabelText('Edit Counseling Dialog');

    expect(dialogElements).not.toBeInTheDocument();
  });

  it('Renders form fields when open', async () => {
    renderWithProviders(
      <SnackbarProvider>
        <EditCounselingDialog
          counseling={mapToIDA4856(mockDA4856s[0])}
          open={true}
          setOpen={mockSetOpen}
          refetchCounselings={mockRefetchCounselings}
        />
      </SnackbarProvider>,
    );

    const dialogElements = screen.getByLabelText('Edit Counseling Dialog');

    const counselingTitleForm = screen.getByLabelText('Counseling Title');
    const counselingDateForm = screen.getByLabelText('Counseling Date');
    const associateEventCheckbox = screen.getByRole('checkbox');
    const associatedEventForm = await waitFor(() => screen.getByRole('combobox', { name: 'Event' }));

    expect(dialogElements).toBeInTheDocument();
    expect(counselingTitleForm).toBeInTheDocument();
    expect(counselingDateForm).toBeInTheDocument();
    expect(associateEventCheckbox).toBeInTheDocument();
    expect(associatedEventForm).toBeInTheDocument();
  });

  it('Disables event form when checkbox is clicked', async () => {
    renderWithProviders(
      <SnackbarProvider>
        <EditCounselingDialog
          counseling={mapToIDA4856(mockDA4856s[0])}
          open={true}
          setOpen={mockSetOpen}
          refetchCounselings={mockRefetchCounselings}
        />
      </SnackbarProvider>,
    );

    const associateEventCheckbox = screen.getByRole('checkbox');
    const associatedEventForm = await waitFor(() => screen.getByRole('combobox', { name: 'Event' }));

    expect(associatedEventForm).not.toBeDisabled();

    fireEvent.click(associateEventCheckbox);

    await waitFor(() => expect(associatedEventForm).toHaveAttribute('aria-disabled', 'true'));
  });
});
