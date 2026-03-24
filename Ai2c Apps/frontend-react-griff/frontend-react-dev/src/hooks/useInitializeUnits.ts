import { useEffect, useState } from 'react';

import { mapUnitsWithTaskforceHierarchy } from '@utils/helpers';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';
import { useGetUnitsQuery } from '@store/griffin_api/auto_dsr/slices';
import { IAppUser } from '@store/griffin_api/users/models';
import { useAppDispatch } from '@store/hooks';
import { setAllUnits, setCurrentUnit } from '@store/slices/appSettingsSlice';

/**
 * Custom hook to initialize and manage units data for the application.
 * This hook fetches units from the API, maps them with taskforce hierarchy,
 * sets the current unit based on the app user, and dispatches actions to update the Redux store.
 *
 * @param appUser - The current application user object containing user details like UIC.
 * @returns An object containing the mapped units array and the success status of the query.
 */
export const useInitializeUnits = (appUser: IAppUser) => {
  // Local state to hold the processed units array
  const [units, setUnits] = useState<IUnitBrief[]>([]);

  // Redux dispatch function to trigger actions
  const dispatch = useAppDispatch();

  // Query hook to fetch units data from the API
  const { data, isSuccess } = useGetUnitsQuery({});

  useEffect(() => {
    // Only proceed if the query was successful and data is available
    if (isSuccess && data) {
      // Find the unit that matches the app user's global or home unit UIC
      const appUserUnit = data.find(
        (unit) => unit.uic === (appUser.globalUnit ? appUser.globalUnit.uic : appUser.unit.uic),
      );

      // Map the units data with taskforce hierarchy for proper organization
      const mappedUnitsHierarchy = mapUnitsWithTaskforceHierarchy(data);

      const currentUic = localStorage.getItem('current_uic');
      // Set current unit from local storage current_uic
      if (currentUic) {
        const cachedUnit = data.find((u) => u.uic === currentUic);
        dispatch(setCurrentUnit(cachedUnit)); // Also setS current UIC
      } else if (appUserUnit) {
        // Set current unit from app user
        dispatch(setCurrentUnit(appUserUnit)); // Also setS current UIC
      }

      // Dispatch action to set all units in the store
      dispatch(setAllUnits(mappedUnitsHierarchy));

      // Update local state with the mapped units
      setUnits(mappedUnitsHierarchy);
    }
  }, [appUser, data, dispatch, isSuccess]); // Dependencies: re-run when these change

  // Return the units and query success status
  return { units, isSuccess };
};
