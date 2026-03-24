import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import ReturnByToggle from '@features/maintenance-schedule/components/PhaseFlow/Component/PhaseFlowToggle';

import { ReturnByType } from '@store/griffin_api/aircraft/slices';

const Wrapper: React.FC = () => {
  const [value, setValue] = useState<ReturnByType>('unit');
  return <ReturnByToggle returnBy={value} setReturnBy={setValue} data-testid="testing-toggle" />;
};

describe('ReturnByToggle', () => {
  beforeEach(() => {
    render(<Wrapper />);
  });

  it('test it renders', () => {
    const toggleElement = screen.getByTestId('testing-toggle');
    expect(toggleElement).toBeInTheDocument();
  });
  it('test button toggling', () => {
    const leftBtn = screen.getByTestId('unit-toggle-btn');
    const middleBtn = screen.getByTestId('sub-toggle-btn');
    const rightBtn = screen.getByTestId('mds-toggle-btn');

    expect(leftBtn).toHaveAttribute('aria-pressed', 'true');
    expect(middleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(rightBtn).toHaveAttribute('aria-pressed', 'false');

    // click on middle
    fireEvent.click(middleBtn);
    expect(middleBtn).toHaveAttribute('aria-pressed', 'true');
    expect(leftBtn).toHaveAttribute('aria-pressed', 'false');
    expect(rightBtn).toHaveAttribute('aria-pressed', 'false');

    // click on right
    fireEvent.click(rightBtn);

    expect(leftBtn).toHaveAttribute('aria-pressed', 'false');
    expect(middleBtn).toHaveAttribute('aria-pressed', 'false');
    expect(rightBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('check text abbreviation', () => {
    const subText = screen.getByText('subordinate');
    expect(subText).toBeInTheDocument();

    const modelText = screen.getByText('model');
    expect(modelText).toBeInTheDocument();

    render(
      <ReturnByToggle returnBy={'unit'} setReturnBy={() => vi.fn()} data-testid="abv-testing-toggle" abbreviated />,
    );
    const subTextAbv = screen.getByText('subord.');
    expect(subTextAbv).toBeInTheDocument();

    const modelTextAbv = screen.getByText('mds');
    expect(modelTextAbv).toBeInTheDocument();
  });
});
