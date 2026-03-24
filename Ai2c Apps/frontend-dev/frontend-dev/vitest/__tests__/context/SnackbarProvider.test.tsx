import SnackbarProvider, { useSnackbar } from '@context/SnackbarProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const TestComponent = () => {
  const { showAlert } = useSnackbar();

  return (
    <button
      onClick={() => showAlert('Test message', 'success', true, 'Click Me', 'info', () => alert('Label Clicked'))}
    >
      Trigger Snackbar
    </button>
  );
};

describe('SnackbarProvider', () => {
  it('should display the Snackbar with correct content when showAlert is called', async () => {
    render(
      <SnackbarProvider>
        <TestComponent />
      </SnackbarProvider>,
    );

    // Click the button to trigger the Snackbar
    fireEvent.click(screen.getByText('Trigger Snackbar'));

    // Assert that Snackbar appears with correct message
    expect(await screen.findByText('Test message')).toBeInTheDocument();

    // Assert that the label button is rendered
    expect(screen.getByText('Click Me')).toBeInTheDocument();

    // Simulate label click
    fireEvent.click(screen.getByText('Click Me'));

    // Simulate Snackbar close icon click
    const closeButton = screen.getByLabelText('close');
    fireEvent.click(closeButton);

    // Assert Snackbar is dismissed
    await waitFor(() => {
      expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    });
  });
});
