/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, expect, it } from 'vitest';

import { useSnackbar } from '@context/SnackbarProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import DownloadPacketDialog from '@features/amtp-packet/components/DownloadPacketDialog';
import { useDownloadPacketMutation } from '@store/amap_ai/readiness';
import { useGetUnitSoldiersQuery } from '@store/amap_ai/soldier';
import { useAppSelector } from '@store/hooks';

vi.mock('@hooks/useUnitAccess', () => ({
  default: () => ({
    hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
  }),
}));

vi.mock('@store/hooks', () => ({
  useAppSelector: vi.fn(),
}));

vi.mock('@store/amap_ai/readiness', async () => {
  return {
    useDownloadPacketMutation: vi.fn(),
  };
});

vi.mock('@store/amap_ai/soldier', async () => {
  return {
    useGetUnitSoldiersQuery: vi.fn(),
  };
});

vi.mock('@context/SnackbarProvider', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    // @ts-expect-error
    ...actual,
    useSnackbar: vi.fn(),
  };
});

const sampleUnitSoldiersData = {
  soldiers: [
    {
      userId: '123',
      firstName: 'John',
      lastName: 'Doe',
      birthMonth: 'January',
      unit: 'Unit A',
    },
    {
      userId: '456',
      firstName: 'Jane',
      lastName: 'Smith',
      birthMonth: 'February',
      unit: 'Unit B',
    },
  ],
};

describe('DownloadPacketDialog', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    (useAppSelector as unknown as ReturnType<typeof vi.fn>).mockReturnValue('someUser');
    (useGetUnitSoldiersQuery as ReturnType<typeof vi.fn>).mockImplementation(() => ({
      data: sampleUnitSoldiersData,
      isLoading: false,
    }));
    vi.mock('@hooks/useUnitAccess', () => ({
      default: () => ({
        // eslint-disable-next-line sonarjs/no-nested-functions
        hasRole: vi.fn().mockImplementation((role) => role === 'manager'),
      }),
    }));
    (useSnackbar as unknown as ReturnType<typeof vi.fn>).mockReturnValue(vi.fn());
    (useDownloadPacketMutation as ReturnType<typeof vi.fn>).mockImplementation(() => [vi.fn(), { isLoading: false }]);
  });

  it('opens and closes the dialog', async () => {
    render(<DownloadPacketDialog />);

    // Open the dialog
    const button = screen.getByText('Download Packet');
    fireEvent.click(button);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    // Close the dialog
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Use waitFor to ensure state update is complete
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('renders dropdown and checkboxes correctly', () => {
    render(<DownloadPacketDialog />);

    // Open the dialog
    const button = screen.getByText('Download Packet');
    fireEvent.click(button);

    // Verify dropdown is rendered correctly
    expect(screen.getByRole('combobox', { name: 'Soldier' })).toBeInTheDocument();
    const dropdown = screen.getByRole('combobox', { name: 'Soldier' });
    fireEvent.mouseDown(dropdown);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);

    // Verify checkboxes are rendered correctly
    expect(screen.getByLabelText('All CTLS')).toBeInTheDocument();
    expect(screen.getByLabelText('UCTLS')).toBeInTheDocument();
    expect(screen.getByLabelText('ICTLS')).toBeInTheDocument();
    expect(screen.getByLabelText('Maintainer Record (DA 7817)')).toBeInTheDocument();
    expect(screen.getByLabelText('Counselings (DA 4856)')).toBeInTheDocument();
    expect(screen.getByLabelText('Supporting Documents')).toBeInTheDocument();
  });
});
