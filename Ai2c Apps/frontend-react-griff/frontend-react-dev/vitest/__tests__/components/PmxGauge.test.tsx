import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '@testing-library/react';

import { PmxGauge, PmxModularGauge } from '@components/PmxGauge';

describe('PmxGauge', () => {
  it('renders correctly', () => {
    render(<PmxGauge value={0.5} data-testid="testing-gauge" showAs="percentage" width={300} height={300} />);
    const gaugeElement = screen.getByTestId('testing-gauge');
    expect(gaugeElement).toBeInTheDocument();
  });

  it('renders proper label', () => {
    render(<PmxGauge value={0.5} data-testid="testing-gauge" showAs="percentage" width={300} height={300} />);

    let label = screen.getByText('50%');
    expect(label).toBeInTheDocument();

    render(<PmxGauge value={0.5} data-testid="testing-gauge" showAs="asIs" width={300} height={300} />);
    label = screen.getByText('0.50');
    expect(label).toBeInTheDocument();

    render(<PmxGauge value={0.9} data-testid="testing-gauge" showAs="namedResult" width={300} height={300} />);
    label = screen.getByText('Good');
    expect(label).toBeInTheDocument();

    render(<PmxGauge value={0.4} data-testid="testing-gauge" showAs="namedResult" width={300} height={300} />);
    label = screen.getByText('Poor');
    expect(label).toBeInTheDocument();

    render(<PmxGauge value={0.6} data-testid="testing-gauge" showAs="namedResult" width={300} height={300} />);
    label = screen.getByText('Fair');
    expect(label).toBeInTheDocument();
  });

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    height: 200,
    width: 300,
    top: 0,
    left: 0,
    bottom: 100,
    right: 150,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  it('test sizing', () => {
    render(<PmxGauge value={0.5} data-testid="testing-gauge" showAs="percentage" width={''} height={''} />);
    const gaugeElement = screen.getByTestId('testing-gauge');
    const rect = gaugeElement.getBoundingClientRect();
    expect(rect.width).toBe(300);
    expect(rect.height).toBe(200);
  });
});

describe('PmxModularGauge', () => {
  it('renders correctly', () => {
    render(<PmxModularGauge value={0.5} data-testid="testing-gauge" showAs="percentage" width={300} height={300} />);
    const gaugeElement = screen.getByTestId('testing-gauge');
    expect(gaugeElement).toBeInTheDocument();
  });

  it('renders proper label', () => {
    render(<PmxModularGauge value={0.5} data-testid="testing-gauge" showAs="percentage" width="100%" height={300} />);

    let label = screen.getByText('50%');
    expect(label).toBeInTheDocument();

    render(<PmxModularGauge value={0.5} data-testid="testing-gauge" showAs="asIs" width={300} height={300} />);
    label = screen.getByText('0.50');
    expect(label).toBeInTheDocument();

    render(<PmxModularGauge value={0.9} data-testid="testing-gauge" showAs="namedResult" width={300} height={300} />);
    label = screen.getByText('Good');
    expect(label).toBeInTheDocument();

    render(<PmxModularGauge value={0.4} data-testid="testing-gauge" showAs="namedResult" width={300} height={300} />);
    label = screen.getByText('Poor');
    expect(label).toBeInTheDocument();

    render(<PmxModularGauge value={0.6} data-testid="testing-gauge" showAs="namedResult" width={300} height={300} />);
    label = screen.getByText('Fair');
    expect(label).toBeInTheDocument();
  });

  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    height: 200,
    width: 300,
    top: 0,
    left: 0,
    bottom: 100,
    right: 150,
    x: 0,
    y: 0,
    toJSON: () => {},
  });

  it('test sizing', () => {
    render(<PmxModularGauge value={0.5} data-testid="testing-gauge" showAs="percentage" width={''} height={''} />);
    const gaugeElement = screen.getByTestId('testing-gauge');
    const rect = gaugeElement.getBoundingClientRect();
    expect(rect.width).toBe(300);
    expect(rect.height).toBe(200);
  });
});
