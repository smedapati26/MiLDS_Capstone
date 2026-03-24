import { render } from '@testing-library/react';

import { DateAdapterTestingComponent } from '@ai2c/pmx-mui/helpers/DateAdapterTestingComponent';

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
