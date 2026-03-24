import { renderWithProviders } from 'vitest/helpers';

import CircleIcon from '@mui/icons-material/Circle';
import { screen } from '@testing-library/react';

import { PmxIconLink } from '@components/PmxIconLink';

describe('PMX Icon Link', () => {
  it('renders correctly', () => {
    renderWithProviders(
      <PmxIconLink
        ComponentIcon={CircleIcon}
        onClick={() => {}}
        text="Test Icon Link"
        key="Test"
        label="Test Icon Label"
      />,
    );

    const linkObject = screen.getByLabelText('Test Icon Label');
    const linkText = screen.getByText('Test Icon Link');

    expect(linkObject).toBeInTheDocument();
    expect(linkText).toBeInTheDocument();
  });
});
