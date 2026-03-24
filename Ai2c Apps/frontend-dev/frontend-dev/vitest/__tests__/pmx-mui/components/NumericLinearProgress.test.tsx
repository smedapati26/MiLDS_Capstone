import { NumericLinearProgress } from '@pmx-mui-components/NumericLinearProgress';
import { render, screen } from '@testing-library/react';

/* Numeric Linear Progress Test */
describe('NumericLinearProgressTest', () => {
  it('has MUI Linear Progress class', () => {
    render(<NumericLinearProgress progress={50} />);
    const component = screen.getByRole('progressbar');
    expect(component.classList).toContain('MuiLinearProgress-root');
  });

  it('has progress of fifty percent', () => {
    render(<NumericLinearProgress progress={50} />);
    const component = screen.getByText(/50/i);
    expect(component.innerHTML).toEqual('50%');
  });
});
