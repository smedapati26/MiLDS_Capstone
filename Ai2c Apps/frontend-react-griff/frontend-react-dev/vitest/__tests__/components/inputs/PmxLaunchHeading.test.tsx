import React from 'react';
import { BrowserRouter } from 'react-router-dom';

import { render, screen } from '@testing-library/react';

import { PmxLaunchHeading } from '@components/inputs/PmxLaunchHeading';

import { ThemedTestingComponent } from '@vitest/helpers/ThemedTestingComponent';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemedTestingComponent>{component}</ThemedTestingComponent>
    </BrowserRouter>,
  );
};

describe('PmxLaunchHeading', () => {
  it('renders heading when provided', () => {
    renderWithTheme(<PmxLaunchHeading heading="Test Heading" />);

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
  });

  it('renders PmxLaunchButton when path is provided', () => {
    renderWithTheme(<PmxLaunchHeading path="/test-path" />);

    const button = screen.getByTestId('launch-nav-link');
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('href')).toBe('/test-path');
  });

  it('renders children when provided', () => {
    renderWithTheme(<PmxLaunchHeading>Test Child</PmxLaunchHeading>);

    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('renders heading, button, and children together', () => {
    renderWithTheme(
      <PmxLaunchHeading heading="Test Heading" path="/test-path">
        Test Child
      </PmxLaunchHeading>,
    );

    expect(screen.getByText('Test Heading')).toBeInTheDocument();
    const button = screen.getByTestId('launch-nav-link');
    expect(button).toBeInTheDocument();
    expect(button.getAttribute('href')).toBe('/test-path');
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('does not render anything when no props provided', () => {
    const { container } = renderWithTheme(<PmxLaunchHeading />);

    expect(container.firstChild).toBeEmptyDOMElement();
  });
});
