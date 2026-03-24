import { describe } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';
import { mockDA4856s } from 'vitest/mocks/handlers/amtp-packet/counselings/mock_data';

import { screen } from '@testing-library/react';

import DownloadAllCounselingDocumentsDialog from '@features/amtp-packet/components/counselings/DownloadAllCounselingDocumentsDialog';
import { mapToIDA4856 } from '@store/amap_ai/counselings';

const mockSetOpen = vi.fn();

describe('PreviewCounselingDocumentDialog Tests', () => {
  it('Does not render when not open', () => {
    renderWithProviders(
      <DownloadAllCounselingDocumentsDialog
        counselings={mockDA4856s.map(mapToIDA4856)}
        open={false}
        setOpen={mockSetOpen}
      />,
    );

    const dialogElements = screen.queryByLabelText('Download All Counseling Documents Dialog');

    expect(dialogElements).not.toBeInTheDocument();
  });

  it('Renders title when open and disables download when none are selected.', () => {
    renderWithProviders(
      <DownloadAllCounselingDocumentsDialog
        counselings={mockDA4856s.map(mapToIDA4856)}
        open={true}
        setOpen={mockSetOpen}
      />,
    );

    const dialogElements = screen.queryByLabelText('Download All Counseling Documents Dialog');
    const downloadButton = screen.getByRole('button', { name: 'Download' });

    expect(dialogElements).toBeInTheDocument();
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toBeDisabled();
  });
});
