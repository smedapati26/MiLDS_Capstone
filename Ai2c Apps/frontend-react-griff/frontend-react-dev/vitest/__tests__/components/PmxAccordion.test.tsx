import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

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
});
