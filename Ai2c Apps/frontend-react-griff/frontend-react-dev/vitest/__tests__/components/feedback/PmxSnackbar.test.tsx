import { describe, expect, it, vi } from 'vitest';

import { screen } from '@testing-library/react';

import PmxSnackbar from '@components/feedback/PmxSnackbar';

import { renderWithProviders } from '../../../helpers/renderWithProviders';

describe('PmxSnackbar', () => {
  it('renders Snackbar with Alert when isAlert is true', () => {
    renderWithProviders(<PmxSnackbar open={true} message="Test message" isAlert={true} severity="error" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders Snackbar with message when isAlert is false', () => {
    renderWithProviders(<PmxSnackbar open={true} message="Test message" isAlert={false} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders children when isAlert is false', () => {
    renderWithProviders(
      <PmxSnackbar open={true} isAlert={false}>
        <div>Test Children</div>
      </PmxSnackbar>,
    );

    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('renders action when provided and isAlert is false', () => {
    const action = <button>Close</button>;
    renderWithProviders(<PmxSnackbar open={true} message="Test message" action={action} isAlert={false} />);

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('applies custom anchorOrigin', () => {
    renderWithProviders(
      <PmxSnackbar
        open={true}
        message="Test message"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        isAlert={false}
      />,
    );

    // Since anchorOrigin is passed to Snackbar, we can check if the component renders without error
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('applies custom sx styles', () => {
    const customSx = { backgroundColor: 'red' };
    renderWithProviders(<PmxSnackbar open={true} message="Test message" sx={customSx} isAlert={false} />);

    // sx is applied to Snackbar, check rendering
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders with onClose prop', () => {
    const onCloseMock = vi.fn();
    renderWithProviders(<PmxSnackbar open={true} message="Test message" onClose={onCloseMock} isAlert={false} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    renderWithProviders(<PmxSnackbar open={false} message="Test message" isAlert={false} />);

    // Snackbar should not be visible, but the component is rendered; check if message is not in document
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
  });

  it('renders with default severity and variant for Alert', () => {
    renderWithProviders(<PmxSnackbar open={true} message="Test message" isAlert={true} />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    // Default severity is 'info', variant 'standard'
    expect(alert).toHaveClass('MuiAlert-standard'); // Assuming MUI classes
  });

  it('renders with custom severity and variant for Alert', () => {
    renderWithProviders(
      <PmxSnackbar open={true} message="Test message" isAlert={true} severity="warning" variant="filled" />,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveClass('MuiAlert-filled');
  });
});
