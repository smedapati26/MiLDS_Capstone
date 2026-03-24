import { useEffect } from 'react';

import { Unit } from '@ai2c/pmx-mui';

import { IUnitBrief } from '@store/amap_ai/units/models';
import { IAppUser } from '@store/amap_ai/user/models';
import { useAppDispatch } from '@store/hooks';
import { setAllUnits, setAppUser, setCurrentUnit } from '@store/slices/appSettingsSlice';
import { mapUnitsWithTaskforceHierarchy } from '@utils/helpers';

const useInitializeUser = (appUser: IAppUser, units: Unit[], isSuccess: boolean) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setAppUser(appUser));

    if (!isSuccess || !units.length) return;

    const defaultUnit = typeof appUser.unit === 'object' ? appUser.unit : undefined;
    const appUserUnit = defaultUnit ?? units.find((u) => u.uic === appUser.uic);

    const fallback = units.find((u) => u.level === 0);

    dispatch(setCurrentUnit(appUserUnit ?? fallback));
    dispatch(setAllUnits(mapUnitsWithTaskforceHierarchy(units as IUnitBrief[])));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [units, isSuccess, dispatch]);
};

export default useInitializeUser;
