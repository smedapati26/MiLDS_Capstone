import { render } from '@testing-library/react';

import PmxAccordionItemTemplate from '@components/PmxAccordionItemTemplate';

describe('PmxAccordionItemTemplate', () => {
  const mockProps = {
    title: 'Test Accordion',
    isError: false,
    total: 5,
    isFetching: false,
    refetch: vi.fn(),
    onAccordionChange: vi.fn(),
  };

  it('should render loading icon when isFetching is true', () => {
    const fetchProps = { ...mockProps, isFetching: true };
    const { getByText } = render(
      <PmxAccordionItemTemplate {...fetchProps}>
        <span>Data</span>
      </PmxAccordionItemTemplate>,
    );

    const loadingIcon = getByText('Loading...');
    expect(loadingIcon).toBeInTheDocument();
  });

  it('should render error icon when isError is true', () => {
    const errorProps = { ...mockProps, isError: true };
    const { getByTestId } = render(
      <PmxAccordionItemTemplate {...errorProps}>
        <span>Data</span>
      </PmxAccordionItemTemplate>,
    );

    const errorIcon = getByTestId('error-icon');
    expect(errorIcon).toBeInTheDocument();
  });
});
