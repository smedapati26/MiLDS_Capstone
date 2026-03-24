import { render, screen } from '@testing-library/react';

import { ComponentManagementTableFilters } from '@features/component-management/components';

describe('ComponentManagementTableFilters', () => {
  it('renders children inside the styled container', () => {
    render(
      <ComponentManagementTableFilters>
        <div data-testid="child-element">Test Child</div>
      </ComponentManagementTableFilters>
    );

    const child = screen.getByTestId('child-element');
    expect(child).toBeInTheDocument();
    expect(child).toHaveTextContent('Test Child');
  });
});
