import { render, screen } from '@testing-library/react';

import { VerticalTabPanel, VerticalTabPanelProps } from '@ai2c/pmx-mui/components/vertical_tabs/VerticalTabPanel';

import '@testing-library/jest-dom';

describe('VerticalTabPanel', () => {
  const renderComponent = (props: Partial<VerticalTabPanelProps> = {}) => {
    const defaultProps: VerticalTabPanelProps = {
      index: 0,
      value: 0,
      children: <div>Content</div>,
      ...props,
    };
    return render(<VerticalTabPanel {...defaultProps} />);
  };

  it('should render without crashing', () => {
    renderComponent();
    expect(screen.getByTestId('vertical-tab-panel-0')).toBeInTheDocument();
  });

  it('should be hidden when value does not match index', () => {
    renderComponent({ value: 1 });
    expect(screen.getByTestId('vertical-tab-panel-0')).toHaveAttribute('hidden');
  });

  it('should be visible when value matches index', () => {
    renderComponent({ value: 0 });
    expect(screen.getByTestId('vertical-tab-panel-0')).not.toHaveAttribute('hidden');
  });

  it('should render children when value matches index', () => {
    renderComponent({ value: 0 });
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should not render children when value does not match index', () => {
    renderComponent({ value: 1 });
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });
});
