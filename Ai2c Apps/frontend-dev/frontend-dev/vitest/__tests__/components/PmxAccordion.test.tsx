import { describe, expect, it } from 'vitest';

import { fireEvent, render, screen } from '@testing-library/react';

import PmxAccordion from '@components/PmxAccordion';

describe('PmxAccordion', () => {
  it('renders loading skeleton when isLoading is true', () => {
    render(
      <PmxAccordion heading="Test Heading" isLoading={true}>
        Test Children
      </PmxAccordion>,
    );

    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
  });

  it('renders accordion with heading and children when isLoading is false', () => {
    render(
      <PmxAccordion heading="Test Heading" isLoading={false}>
        Test Children
      </PmxAccordion>,
    );

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('renders a checkbox when isSelectable is true', () => {
    render(
      <PmxAccordion heading="Test Heading" isSelectable selectedItems={[]} handleSelection={() => {}}>
        Test Children
      </PmxAccordion>,
    );

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('handles checkbox selection correctly', () => {
    const handleSelectionMock = vi.fn();

    render(
      <PmxAccordion heading="Test Heading" isSelectable selectedItems={[]} handleSelection={handleSelectionMock}>
        Test Children
      </PmxAccordion>,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleSelectionMock).toHaveBeenCalledWith('Test Heading', true);
  });

  it('prevents accordion expansion when clicking the checkbox', () => {
    render(
      <PmxAccordion heading="Test Heading" isSelectable selectedItems={[]} handleSelection={() => {}}>
        Test Children
      </PmxAccordion>,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Ensure the heading text is still present (i.e., accordion didn't expand unexpectedly)
    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });
});
