import { Controller, FieldValues, Path, useFormContext } from 'react-hook-form';

import { IUnitBrief } from '../../store/griffin_api/auto_dsr/models';
import { UnitSelect, UnitSelectProps } from '../dropdowns/UnitSelect';

/**
 * A reusable React Hook Form (RHF) wrapper for UnitSelect.
 *
 * Props:
 * - name: string (RHF field name)
 * - units: Array<IUnitBrief> (units data)
 * - ...otherProps: Forwarded to UnitSelect (e.g., disabled, readOnly, etc.)
 */
interface Props<T extends FieldValues> extends Omit<UnitSelectProps, 'value' | 'onChange'> {
  field: Path<T>;
  label: string;
}

export const RHFUnitSelect = <T extends FieldValues>(props: Props<T>) => {
  const { field: name, label, units, ...otherProps } = props;
  // Access the form control from react-hook-form context
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value, ...fieldRest }, fieldState: { error } }) => {
        return (
          <UnitSelect
            label={label}
            units={units}
            value={value as IUnitBrief | undefined}
            onChange={onChange}
            error={!!error}
            helperText={error?.message}
            {...fieldRest}
            {...otherProps}
          />
        );
      }}
    />
  );
};
