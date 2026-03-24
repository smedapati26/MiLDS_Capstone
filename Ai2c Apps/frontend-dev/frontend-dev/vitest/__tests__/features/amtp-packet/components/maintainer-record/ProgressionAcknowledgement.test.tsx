import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import ProgressionAcknowledgement from '@features/amtp-packet/components/maintainer-record/ProgressionAcknowledgement';

describe('ProgressionAcknowledgement Component', () => {
  let isAcknowledged: boolean;
  let setIsAcknowledged: (value: boolean) => void;

  beforeEach(() => {
    isAcknowledged = false;
    setIsAcknowledged = vi.fn();
  });

  it('renders the ML change warning', () => {
    render(<ProgressionAcknowledgement isAcknowledged={isAcknowledged} setIsAcknowledged={setIsAcknowledged} />);
    expect(screen.getByText('ML Change')).toBeInTheDocument();
  });

  it('displays a warning message about ML designation change', () => {
    render(<ProgressionAcknowledgement isAcknowledged={isAcknowledged} setIsAcknowledged={setIsAcknowledged} />);
    expect(
      screen.getByText(
        "By removing Progression from this event, the soldier's current ML designation will be affected. To maintain an accurate record of this soldier's ML progression you can:",
      ),
    ).toBeInTheDocument();
  });

  it('renders an acknowledgment checkbox', () => {
    render(<ProgressionAcknowledgement isAcknowledged={isAcknowledged} setIsAcknowledged={setIsAcknowledged} />);
    expect(screen.getByLabelText('Acknowledge*')).toBeInTheDocument();
  });

  it('calls setIsAcknowledged when checkbox is clicked', () => {
    render(<ProgressionAcknowledgement isAcknowledged={isAcknowledged} setIsAcknowledged={setIsAcknowledged} />);
    fireEvent.click(screen.getByLabelText('Acknowledge*'));
    expect(setIsAcknowledged).toBeCalledTimes(1);
  });
});
