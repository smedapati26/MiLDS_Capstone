import { FixedSizeList } from 'react-window';

import {
  Box,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlProps,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from '@mui/material';

interface OptionType {
  label: string;
  value: string;
}

export interface OptionsMapType {
  [key: string]: OptionType;
}

interface MultiSelectProps {
  readonly isLoading: boolean;
  readonly options: OptionsMapType;
  readonly onSelectionChange: (selectedValues: string[]) => void;
  readonly value?: string[];
  readonly menuItemHeight?: number;
  readonly visibleItems?: number;
  readonly width?: string;
  readonly label: string;
  readonly multiSelect?: boolean;
  readonly size?: FormControlProps['size'];
}

interface RenderOptionProps {
  readonly index: number;
  readonly style: React.CSSProperties | undefined;
  readonly data: {
    options: OptionsMapType;
    value: string[];
    handleOptionClick: (key: string) => void;
    multiSelect: boolean;
  };
}

function RenderOption({ index, style, data }: RenderOptionProps) {
  const { options, value, handleOptionClick, multiSelect } = data;
  const key = Object.keys(options)[index];
  const isSelected = value?.indexOf(key) > -1;

  return (
    <MenuItem
      data-testid={key}
      key={key}
      value={key}
      style={{ ...style, padding: 0 }}
      onClick={() => handleOptionClick(key)}
    >
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', width: '100%' }}>
        {multiSelect && <Checkbox checked={isSelected} />}
        <ListItemText primary={options[key].label} />
      </div>
    </MenuItem>
  );
}

function MultiSelectDropDown({
  isLoading,
  options,
  onSelectionChange,
  value = [],
  menuItemHeight = 48,
  visibleItems = 8,
  width = '100%',
  label,
  multiSelect = true,
  size = 'medium',
}: MultiSelectProps) {
  const handleOptionClick = (key: string) => {
    let newSelectedValues: string[];
    if (multiSelect) {
      if (value.includes(key)) {
        newSelectedValues = value.filter((item) => item !== key);
      } else {
        newSelectedValues = [...value, key];
      }
    } else {
      newSelectedValues = value.includes(key) ? [] : [key];
    }
    onSelectionChange(newSelectedValues);
  };

  const loadingIcon = () => (
    <Box ml={'-10px'}>
      <CircularProgress
        data-testid="loading-icon"
        sx={{ height: '36px !important', width: '36px !important', marginTop: '7px', marginRight: '10px' }}
      />
    </Box>
  );

  return (
    <FormControl sx={{ width }} size={size}>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        multiple={multiSelect}
        value={value}
        renderValue={(selected: string[]) => selected.map((item) => options[item]?.label || item).join(', ')}
        IconComponent={isLoading ? loadingIcon : undefined}
        disabled={isLoading}
      >
        <FixedSizeList
          height={Math.min(Object.keys(options).length * menuItemHeight, menuItemHeight * visibleItems)}
          width="100%"
          itemSize={menuItemHeight}
          itemCount={Object.keys(options).length}
          overscanCount={5}
          itemData={{
            options,
            value,
            handleOptionClick,
            multiSelect,
          }}
        >
          {RenderOption}
        </FixedSizeList>
      </Select>
    </FormControl>
  );
}

export default MultiSelectDropDown;
