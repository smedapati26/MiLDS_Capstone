import { describe, expect, it } from 'vitest';
import { ThemedTestingComponent } from 'vitest/helpers';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import StatusCard from '@features/equipment-manager/components/StatusCard';

describe('Equipment Manager StatusCard and Tooltip testing', () => {
  beforeEach(() => {
    render(
      <ThemedTestingComponent>
        <StatusCard title="C-12-test" percentage="20%" total={8} status="PMC" label={'Aircraft'} />
      </ThemedTestingComponent>,
    );
  });

  it('test status card is rendered', () => {
    expect(screen.getByTestId('em-status-card')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.getByText('PMC')).toBeInTheDocument();
    expect(screen.getByTestId('AirplanemodeActiveIcon')).toBeInTheDocument();
  });
  it('test status card tooltip is rendered on hover', async () => {
    const card = screen.getByTestId('em-status-card');

    await userEvent.hover(card);

    expect(await screen.findByTestId('em-status-tooltip')).toBeInTheDocument();

    expect(await screen.getByText('# of Aircraft in Status:')).toBeInTheDocument();
    expect(await screen.getByText('% of Aircraft in Status:')).toBeInTheDocument();
  });
});
