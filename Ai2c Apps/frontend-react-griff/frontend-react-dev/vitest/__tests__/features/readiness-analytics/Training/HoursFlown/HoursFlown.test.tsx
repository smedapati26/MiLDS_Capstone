import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { configureStore } from '@reduxjs/toolkit';
import { render } from '@testing-library/react';
import { fireEvent } from '@testing-library/react';

import HoursFlown from '@features/readiness-analytics/Training/HoursFlown/HoursFlown';

import { unitsApi } from '@store/griffin_api/auto_dsr/slices';
import { hoursFlownApi } from '@store/griffin_api/readiness/slices';

let wrapper: React.ComponentType<{ children: React.ReactNode }>;

let store: ReturnType<typeof configureStore>;

const exampleUnits = [
  {
    uic: 'W899AA',
    short_name: 'AASF #3, CA ARNG',
    display_name: 'Army Aviation Support Facility #3, California Army National Guard',
    nick_name: null,
    echelon: 'BN',
    parent_unit: 'W8AYFFASF',
    level: 4,
  },
  {
    uic: 'W89BAA',
    short_name: 'AASF #1, CO ARNG',
    display_name: 'Army Aviation Support Facility #1, Colorado Army National Guard',
    nick_name: null,
    echelon: 'BN',
    parent_unit: 'W8AZFF',
    level: 3,
  },
];

const HoursFlownParams = {
  uic: '1234567890',
  start_date: dayjs().toString(),
  end_date: dayjs().toString(),
  validDateRange: false,
};

describe('HoursFlown component', () => {
  beforeEach(() => {
    store = configureStore({
      reducer: {
        [unitsApi.reducerPath]: unitsApi.reducer,
        [hoursFlownApi.reducerPath]: hoursFlownApi.reducer,
        appSettings: (state = { allUnits: exampleUnits }) => state,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(unitsApi.middleware).concat(hoursFlownApi.middleware),
      preloadedState: {
        appSettings: {
          allUnits: exampleUnits,
        },
      },
    });

    wrapper = ({ children }) => <Provider store={store}>{children}</Provider>;
  });

  describe('HoursFlown Component', () => {
    it('renders the component', () => {
      const { getByText } = render(
        <BrowserRouter>
          <HoursFlown {...HoursFlownParams} />
        </BrowserRouter>,
        { wrapper },
      );

      expect(getByText('UNIT')).toBeInTheDocument();
      expect(getByText('SUBORDINATES')).toBeInTheDocument();
      expect(getByText('MODEL')).toBeInTheDocument();
    });

    it('renders the correct graph based on the view type', () => {
      const { getByText } = render(
        <BrowserRouter>
          <HoursFlown {...HoursFlownParams} />
        </BrowserRouter>,
        { wrapper },
      );

      expect(getByText('UNIT')).toBeInTheDocument();
      expect(getByText('SUBORDINATES')).toBeInTheDocument();
      expect(getByText('MODEL')).toBeInTheDocument();

      const unitButton = getByText('UNIT');
      const subordinatesButton = getByText('SUBORDINATES');
      const modelButton = getByText('MODEL');

      fireEvent.click(subordinatesButton);

      expect(getByText('Choose similar units to compare your subordinate flight hours to.')).toBeInTheDocument();

      fireEvent.click(modelButton);

      expect(getByText('Choose the models you want to view.')).toBeInTheDocument();

      fireEvent.click(unitButton);

      expect(getByText("Choose similar units to compare your unit's flight hours to.")).toBeInTheDocument();
    });
  });
});
