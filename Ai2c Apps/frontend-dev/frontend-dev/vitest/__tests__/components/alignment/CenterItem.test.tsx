import { describe, expect, it } from 'vitest';

import { render, screen } from '@testing-library/react';

import { CenterItem } from '@components/alignment';

describe('CenterItem', () => {
  it('renders children correctly', () => {
    render(
      <CenterItem>
        <div data-testid="child-element">Test Child</div>
      </CenterItem>,
    );

    const childElement = screen.getByTestId('child-element');
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent('Test Child');
  });

  it('applies correct styles', () => {
    render(
      <CenterItem>
        <div data-testid="child-element">Test Child</div>
      </CenterItem>,
    );

    const container = screen.getByTestId('child-element').parentElement;
    expect(container).toHaveStyle({
      display: 'flex',
      justifyContent: 'left',
      alignItems: 'center',
      height: '100%',
      width: '100%',
    });
  });
});
