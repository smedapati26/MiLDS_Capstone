import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import PmxContainer from '@components/PmxContainer';

describe('PmxContainer', () => {
  it('renders children inside CardContent', () => {
    render(
      <PmxContainer>
        <div>Test Content</div>
      </PmxContainer>,
    );

    const content = screen.getByText('Test Content');
    expect(content).toBeInTheDocument();
  });
});
