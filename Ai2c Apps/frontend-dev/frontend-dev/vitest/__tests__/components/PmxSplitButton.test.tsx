import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import PmxSplitButton, { SplitButtonProps } from '@components/PmxSplitButton';

describe('PmxSplitButton Component', () => {
  const handleClickMock = vi.fn();

  const mockOptions = [
    {
      label: 'Mass Training',
    },
    {
      label: 'Initial Upload',
      children: [{ label: 'Manual Entry' }, { label: 'File Upload' }],
    },
  ];

  const setup = (props: Partial<SplitButtonProps> = {}) => {
    const defaultProps: SplitButtonProps = {
      buttonTitle: 'Add Event',
      options: mockOptions,
      handleClick: handleClickMock,
      startIcon: null,
    };

    return render(<PmxSplitButton {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the main button with the correct title', () => {
    setup();

    expect(screen.getByText('Add Event')).toBeInTheDocument();
  });

  it('should call handleClick when the main button is clicked', () => {
    setup();

    fireEvent.click(screen.getByText('Add Event')); // Simulate main button click

    expect(handleClickMock).toHaveBeenCalledWith('Add Event');
  });

  it('should display nested options when a parent menu item with children is clicked', async () => {
    setup();

    // Open parent menu
    fireEvent.click(screen.getByLabelText('split-button-dropdown-button'));
    fireEvent.click(screen.getByText('Initial Upload')); // Simulate click on "Initial Upload"

    // Verify nested menu options
    await waitFor(() => {
      expect(screen.getByText('Manual Entry')).toBeInTheDocument();
      expect(screen.getByText('File Upload')).toBeInTheDocument();
    });
  });

  it('should call handleClick when a nested menu option is clicked', async () => {
    setup();

    // Open parent menu
    fireEvent.click(screen.getByLabelText('split-button-dropdown-button'));
    fireEvent.click(screen.getByText('Initial Upload')); // Open nested menu

    // Simulate click on "Manual Entry"
    fireEvent.click(await screen.findByText('Manual Entry'));

    expect(handleClickMock).toHaveBeenCalledWith('Manual Entry');
  });
});
