import { render, screen } from '@testing-library/react';

import PmxGridItemTemplate from '@components/PmxGridItemTemplate';

import '@testing-library/jest-dom';

interface TestData {
  id: number;
  name: string;
}

interface TestError {
  message: string;
}

const MockComponent = ({ data }: { data: TestData }) => <div>{data.name}</div>;

describe('PmxGridItemTemplate', () => {
  it('renders loading state', () => {
    render(<PmxGridItemTemplate dataHook={{ isFetching: true, isError: false }} RenderComponent={MockComponent} />);
    expect(screen.getByTestId('skeleton-loading')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const error: TestError = { message: 'Test error' };
    render(
      <PmxGridItemTemplate dataHook={{ isFetching: false, isError: true, error }} RenderComponent={MockComponent} />,
    );
    expect(
      screen.getByText('Issues loading data. Try refreshing, or contact support if the issue persists.'),
    ).toBeInTheDocument();
  });

  it('renders passed-in component with data', () => {
    const data: TestData = { id: 1, name: 'Test Data' };
    render(
      <PmxGridItemTemplate dataHook={{ isFetching: false, isError: false, data }} RenderComponent={MockComponent} />,
    );
    expect(screen.getByText('Test Data')).toBeInTheDocument();
  });

  it('renders unknown error message when error is undefined', () => {
    render(<PmxGridItemTemplate dataHook={{ isFetching: false, isError: true }} RenderComponent={MockComponent} />);
    expect(
      screen.getByText('Issues loading data. Try refreshing, or contact support if the issue persists.'),
    ).toBeInTheDocument();
  });
});
