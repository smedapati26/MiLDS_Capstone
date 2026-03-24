import { DateAdapterTestingComponent } from '@helpers/DateAdapterTestingComponent';
import { render } from '@testing-library/react';

describe('DateAdapterTestingComponent', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <DateAdapterTestingComponent>
        <div>Test Child</div>
      </DateAdapterTestingComponent>,
    );

    expect(getByText('Test Child')).toBeInTheDocument();
  });
});
