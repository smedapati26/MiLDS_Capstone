import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// import userEvent from '@testing-library/user-event';
import LocationDropdown from '@components/dropdowns/LocationDropdown';

import { useGetAutoDsrLocationQuery } from '@store/griffin_api/auto_dsr/slices';

// Mock RTK Query
vi.mock('@store/griffin_api/auto_dsr/slices', () => ({
  useGetAutoDsrLocationQuery: vi.fn(),
}));

const mockLocations = [
  { id: 1, code: 'LOC1', name: 'Location 1' },
  { id: 2, code: 'LOC2', name: 'Location 2' },
  { id: 3, code: 'LOC3', name: 'Location 3' },
];

describe('LocationDropdown', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { items: mockLocations, count: 3 },
      isLoading: false,
    });

    render(<LocationDropdown defaultValue={null} />);
    expect(screen.getByTestId('location-paginated-dropdown')).toBeInTheDocument();
  });

  // it('displays loading state when fetching data', () => {
  //   (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
  //     data: null,
  //     isLoading: true,
  //   });

  //   render(<LocationDropdown defaultValue={null} />);
  //   expect(screen.getByTestId('location-paginated-dropdown')).toBeInTheDocument();
  //   expect(screen.getByRole('progressbar')).toBeInTheDocument(); // CircularProgress
  // });

  // it('displays options correctly when data is fetched', async () => {
  //   (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
  //     data: { items: mockLocations, count: 3 },
  //     isLoading: false,
  //   });

  //   render(<LocationDropdown defaultValue={null} />);
  //   const dropdown = screen.getByTestId('location-paginated-dropdown-textfield');

  //   // Simulate opening the dropdown

  //   // Wait for options to appear
  //   await waitFor(() => {
  //     userEvent.click(dropdown);
  //     expect(screen.getByText('Location 1')).toBeInTheDocument();
  //     expect(screen.getByText('Location 2')).toBeInTheDocument();
  //     expect(screen.getByText('Location 3')).toBeInTheDocument();
  //   });
  // });

  // it('calls onChange with the correct value when an option is selected', async () => {
  //   const mockOnChange = vi.fn();

  //   (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
  //     data: { items: mockLocations, count: 3 },
  //     isLoading: false,
  //   });

  //   render(<LocationDropdown defaultValue={null} onChange={mockOnChange} />);
  //   const dropdown = screen.getByTestId('location-paginated-dropdown');

  //   // Simulate opening the dropdown
  //   fireEvent.mouseDown(dropdown);

  //   // Wait for options to appear
  //   await waitFor(() => {
  //     expect(screen.getByText('Location 1')).toBeInTheDocument();
  //   });

  //   // Simulate selecting an option
  //   fireEvent.click(screen.getByText('Location 1'));

  //   // Assert that onChange was called with the correct value
  //   expect(mockOnChange).toHaveBeenCalledWith({
  //     id: 1,
  //     code: 'LOC1',
  //     name: 'Location 1',
  //   });
  // });

  // it('handles input changes and fetches data correctly', async () => {
  //   const mockOnChange = vi.fn();

  //   (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
  //     data: { items: mockLocations, count: 3 },
  //     isLoading: false,
  //   });

  //   render(<LocationDropdown defaultValue={null} onChange={mockOnChange} />);
  //   const input = screen.getByRole('textbox');

  //   // Simulate typing in the input
  //   fireEvent.change(input, { target: { value: 'Loc' } });

  //   // Assert that the input value is updated
  //   expect(input).toHaveValue('Loc');

  //   // Wait for the query to be triggered
  //   await waitFor(() => {
  //     expect(useGetAutoDsrLocationQuery).toHaveBeenCalledWith(
  //       expect.objectContaining({ name: 'Loc' }),
  //       expect.anything(),
  //     );
  //   });
  // });

  // it('handles default value correctly', () => {
  //   const defaultValue = { id: 1, code: 'LOC1', name: 'Location 1' };

  //   (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
  //     data: { items: mockLocations, count: 3 },
  //     isLoading: false,
  //   });

  //   render(<LocationDropdown defaultValue={defaultValue} />);
  //   const input = screen.getByRole('textbox');

  //   // Assert that the default value is displayed
  //   expect(input).toHaveValue('Location 1');
  // });

  it('handles empty data gracefully', async () => {
    (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { items: [], count: 0 },
      isLoading: false,
    });

    render(<LocationDropdown defaultValue={null} />);
    const dropdown = screen.getByTestId('location-paginated-dropdown');

    // Simulate opening the dropdown
    fireEvent.mouseDown(dropdown);

    // Wait for options to appear
    await waitFor(() => {
      expect(screen.queryByText('Location 1')).not.toBeInTheDocument();
    });
  });

  // it('handles scroll to load more data', async () => {
  //   const mockDataPage1 = { items: mockLocations.slice(0, 2), count: 3 };
  //   const mockDataPage2 = { items: mockLocations.slice(2), count: 3 };

  //   (useGetAutoDsrLocationQuery as unknown as ReturnType<typeof vi.fn>)
  //     .mockReturnValueOnce({ data: mockDataPage1, isLoading: false })
  //     .mockReturnValueOnce({ data: mockDataPage2, isLoading: false });

  //   render(<LocationDropdown defaultValue={null} />);
  //   const dropdown = screen.getByTestId('location-paginated-dropdown');

  //   // Simulate opening the dropdown
  //   fireEvent.mouseDown(dropdown);

  //   // Wait for the first page of options to appear
  //   await waitFor(() => {
  //     expect(screen.getByText('Location 1')).toBeInTheDocument();
  //     expect(screen.getByText('Location 2')).toBeInTheDocument();
  //   });

  //   // Simulate scrolling to the bottom
  //   fireEvent.scroll(screen.getByRole('listbox'), { target: { scrollTop: 100 } });

  //   // Wait for the second page of options to appear
  //   await waitFor(() => {
  //     expect(screen.getByText('Location 3')).toBeInTheDocument();
  //   });
  // });
});
