import { describe } from 'vitest';
import { renderWithProviders } from 'vitest/helpers';
import { mockDA4856s } from 'vitest/mocks/handlers/amtp-packet/counselings/mock_data';

import { screen } from '@testing-library/react';

import PreviewCounselingDocumentDialog from '@features/amtp-packet/components/counselings/PreviewCounselingDocumentDialog';
import { mapToIDA4856 } from '@store/amap_ai/counselings';

const mockSetOpen = vi.fn();

describe('PreviewCounselingDocumentDialog Tests', () => {
  it('Does not render when not open', () => {
    renderWithProviders(
      <PreviewCounselingDocumentDialog counseling={mapToIDA4856(mockDA4856s[0])} open={false} setOpen={mockSetOpen} />,
    );

    const dialogElements = screen.queryByLabelText('Preview Counseling Document Dialog');

    expect(dialogElements).not.toBeInTheDocument();
  });

  it('Renders title when open', () => {
    renderWithProviders(
      <PreviewCounselingDocumentDialog counseling={mapToIDA4856(mockDA4856s[0])} open={true} setOpen={mockSetOpen} />,
    );

    const dialogElements = screen.queryByLabelText('Preview Counseling Document Dialog');

    expect(dialogElements).toBeInTheDocument();
  });
});
