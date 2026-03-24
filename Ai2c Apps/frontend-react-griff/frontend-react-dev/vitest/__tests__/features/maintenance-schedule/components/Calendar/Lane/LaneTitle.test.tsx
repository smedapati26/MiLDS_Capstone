import { Provider } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';

import { LaneTitle } from '@features/maintenance-schedule/components/Calendar';
import { maintenanceLaneReducer } from '@features/maintenance-schedule/slices/maintenanceLaneEditSlice';

import '@testing-library/jest-dom';

const lane = {
  id: 1,
  location: {
    name: 'Test Airfield',
    short_name: 'Test AF',
    code: 'TSTA',
  },
  unitUic: 'AAAAAA',
  airframeFamilies: ['APACHE'],
  subordinateUnits: ['AAAA01', 'AAAA02'],
  name: 'CH-47F Hanger 1',
  isContractor: false,
  isInternal: true,
};

describe('LaneTitleTest', () => {
  it('renders LaneTitle component text', () => {
    const store = configureStore({
      reducer: {
        maintenanceLane: maintenanceLaneReducer,
      },
    });

    render(
      <Provider store={store}>
        <LaneTitle lane={lane} />
      </Provider>
    );

    const component = screen.getByText(/CH-47F Hanger 1/i);
    expect(component).toBeInTheDocument();
  });
});
