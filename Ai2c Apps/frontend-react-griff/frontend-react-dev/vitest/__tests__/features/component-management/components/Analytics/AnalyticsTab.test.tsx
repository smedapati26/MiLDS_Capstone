import { Suspense } from 'react';
import { vi } from 'vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import AnalyticsTab from '@features/component-management/components/Analytics/AnalyticsTab';

// Mock the lazy-loaded components
vi.mock('@features/component-management/components/Analytics/AnalyticsUnitView', () => ({
  default: () => <div data-testid="unit-view">Unit View Content</div>,
}));

vi.mock('@features/component-management/components/Analytics/AnalyticsAircraftView', () => ({
  default: () => <div data-testid="aircraft-view">Aircraft View Content</div>,
}));

vi.mock('@features/component-management/components/Analytics/AnalyticsComponentView', () => ({
  default: () => <div data-testid="component-view">Component View Content</div>,
}));

describe('AnalyticsTab', () => {
  const renderComponent = () => {
    return render(
      <Suspense fallback={<div>Loading...</div>}>
        <AnalyticsTab />
      </Suspense>,
    );
  };

  it('renders without crashing', () => {
    expect(() => renderComponent()).not.toThrow();
  });

  it('shows Unit view by default', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId('unit-view')).toBeInTheDocument();
    });
  });

  it('switches between views correctly', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Initial state - Unit view
    await waitFor(() => {
      expect(screen.getByTestId('unit-view')).toBeInTheDocument();
    });

    // Switch to Aircraft view
    const aircraftButton = screen.getByRole('button', { name: /aircraft/i });
    await user.click(aircraftButton);
    await waitFor(() => {
      expect(screen.getByTestId('aircraft-view')).toBeInTheDocument();
      expect(screen.queryByTestId('unit-view')).not.toBeInTheDocument();
    });

    // Switch back to Unit view
    const unitButton = screen.getByRole('button', { name: /unit/i });
    await user.click(unitButton);
    await waitFor(() => {
      expect(screen.getByTestId('unit-view')).toBeInTheDocument();
      expect(screen.queryByTestId('aircraft-view')).not.toBeInTheDocument();
    });
  });

  it('maintains selected tab state', async () => {
    renderComponent();
    const user = userEvent.setup();

    // Click Aircraft tab
    const aircraftButton = screen.getByRole('button', { name: /aircraft/i });
    await user.click(aircraftButton);

    expect(aircraftButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /unit/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('handles component tab click', async () => {
    renderComponent();
    const user = userEvent.setup();

    const componentButton = screen.getByRole('button', { name: /component/i });

    await user.click(componentButton);

    await waitFor(() => {
      expect(componentButton).toHaveAttribute('aria-pressed', 'true');
    });

    cleanup();
  });

  it('has correct button styling', () => {
    renderComponent();
    const buttons = screen.getAllByRole('button');

    buttons.forEach((button) => {
      expect(button).toHaveStyle({
        minWidth: '120px',
      });
    });
  });
});
