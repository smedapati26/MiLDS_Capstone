import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LastUpdated, Props } from '@components/data-tables/LastUpdated';

describe('LastUpdated Component', () => {
  it('renders the formatted lastUpdateDate when provided', () => {
    const date = dayjs('2024-06-15T14:30:00');
    render(<LastUpdated lastUpdateDate={date} />);
    expect(screen.getByText(/Last Updated:/i)).toBeInTheDocument();
    expect(screen.getByText('Last Updated: 06/15/2024 14:30:00')).toBeInTheDocument();
  });

  it('renders no date text when lastUpdateDate is null', () => {
    render(<LastUpdated lastUpdateDate={null} />);
    expect(screen.getByText(/Last Updated:/i)).toBeInTheDocument();
    // Should not show anything after "Last Updated: "
    expect(screen.getByText(/^Last Updated:$/).textContent).toBe('Last Updated: ');
  });

  it('renders tooltip title and extraUpdates in tooltip', async () => {
    const user = userEvent.setup();
    const extraUpdates: Props['extraUpdates'] = [
      { label: 'Update 1', value: 'Value 1' },
      { label: 'Update 2', value: 'Value 2' },
    ];

    render(
      <LastUpdated lastUpdateDate={dayjs()} tooltipTitle={<span>Tooltip Title</span>} extraUpdates={extraUpdates} />,
    );

    // The InfoIcon is the tooltip trigger
    const infoIcon = screen.getByTestId('InfoIcon') || screen.getByLabelText(/info/i);
    // Since the icon may not have aria-label, simply find by title by hovering on the InfoIcon/icon
    // But since MUI tooltip renders in portal, better to hover the icon to show tooltip content
    // Using userEvent to hover the icon
    await user.hover(infoIcon);

    // Check for tooltip title text
    expect(await screen.findByText('Tooltip Title')).toBeInTheDocument();

    // Check for extraUpdates labels and values
    expect(await screen.findByText('Update 1')).toBeInTheDocument();
    expect(await screen.findByText('Value 1')).toBeInTheDocument();
    expect(await screen.findByText('Update 2')).toBeInTheDocument();
    expect(await screen.findByText('Value 2')).toBeInTheDocument();
  });
});
