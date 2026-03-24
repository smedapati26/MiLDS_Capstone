import { CheckboxTableFilter, CheckboxTableFilterProps } from '@pmx-mui-components/CheckboxTableFilter';
import { fireEvent, render } from '@testing-library/react';

describe('CheckboxTableFilter', () => {
  const mockOptions = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
  ];

  const mockOnCheckboxChange = vi.fn();

  const renderComponent = (props: Partial<CheckboxTableFilterProps> = {}) => {
    const defaultProps: CheckboxTableFilterProps = {
      label: 'Test Label',
      options: mockOptions,
      onCheckboxChange: mockOnCheckboxChange,
    };

    return render(<CheckboxTableFilter {...defaultProps} {...props} />);
  };

  it('should render the component with given label', () => {
    const { getByText } = renderComponent();
    expect(getByText('Test Label')).toBeInTheDocument();
  });

  it('should open the filter menu when clicking the label', () => {
    const { getByTestId, getByText } = renderComponent();
    fireEvent.click(getByText('Test Label'));
    expect(getByTestId('filter-menu')).toBeVisible();
  });

  it('should call onCheckboxChange with selected values when a checkbox is clicked', () => {
    const { getByLabelText, getByText } = renderComponent();
    fireEvent.click(getByText('Test Label'));
    fireEvent.click(getByLabelText('Option 1'));
    expect(mockOnCheckboxChange).toHaveBeenCalledWith(['option1']);
  });

  it('should update the selected state when a checkbox is clicked', () => {
    const { getByLabelText, getByText } = renderComponent();
    fireEvent.click(getByText('Test Label'));
    fireEvent.click(getByLabelText('Option 1'));
    fireEvent.click(getByLabelText('Option 2'));
    expect(mockOnCheckboxChange).toHaveBeenCalledWith(['option1', 'option2']);
  });

  it('should deselect a checkbox when clicked again', () => {
    const { getByLabelText, getByText } = renderComponent();
    fireEvent.click(getByText('Test Label'));
    fireEvent.click(getByLabelText('Option 1'));
    fireEvent.click(getByLabelText('Option 1'));
    expect(mockOnCheckboxChange).toHaveBeenCalledWith([]);
  });
});
