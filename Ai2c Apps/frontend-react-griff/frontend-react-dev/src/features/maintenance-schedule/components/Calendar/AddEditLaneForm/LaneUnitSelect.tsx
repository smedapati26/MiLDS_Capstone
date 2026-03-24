import React, { useMemo } from 'react';

import { Checkbox, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, SelectProps } from '@mui/material';

import { IUnitBrief } from '@store/griffin_api/auto_dsr/models';

interface Props {
  units: IUnitBrief[];
  value?: string; // selected unit UIC
  onChange: (unit: IUnitBrief) => void;
  label?: string;
  selectProps?: Partial<SelectProps>;
}

const LaneUnitDropdown: React.FC<Props> = ({ units, value, onChange, label = 'Select Unit', selectProps = {} }) => {
  const unitMap = useMemo(() => {
    const map = new Map<string, IUnitBrief & { children: IUnitBrief[] }>();
    units.forEach((unit) => {
      map.set(unit.uic, { ...unit, children: [] });
    });
    map.forEach((unit) => {
      if (unit.parentUic && map.has(unit.parentUic)) {
        map.get(unit.parentUic)!.children.push(unit);
      }
    });
    return map;
  }, [units]);

  const rootUnits = useMemo(() => {
    const minLevel = Math.min(...units.map((u) => u.level));
    return [...unitMap.values()].filter((u) => u.level === minLevel);
  }, [unitMap, units]);

  const handleChange = (event: SelectChangeEvent<unknown>, _: React.ReactNode) => {
    const selected = units.find((u) => u.uic === event.target.value);
    if (selected) onChange(selected);
  };

  const renderOptions = (unit: IUnitBrief & { children?: IUnitBrief[] }, indentLevel = 1): React.ReactNode[] => {
    const item = (
      <MenuItem key={unit.uic} value={unit.uic} sx={{ pl: indentLevel * 4, display: 'flex', alignItems: 'center' }}>
        <Checkbox checked={value === unit.uic} disableRipple sx={{ padding: 0, marginRight: 1 }} />
        {unit.shortName}
      </MenuItem>
    );

    const children = unit.children || [];
    return [item, ...children.flatMap((child) => renderOptions(child, indentLevel + 1))];
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="unit-select-label">{label}</InputLabel>
      <Select
        labelId="unit-select-label"
        value={value || ''}
        label={label}
        onChange={handleChange}
        renderValue={(selected) => {
          const selectedUnit = units.find((u) => u.uic === selected);
          return selectedUnit?.shortName || label;
        }}
        {...selectProps}
      >
        {rootUnits.flatMap((unit) => renderOptions(unit))}
      </Select>
    </FormControl>
  );
};

export default LaneUnitDropdown;
