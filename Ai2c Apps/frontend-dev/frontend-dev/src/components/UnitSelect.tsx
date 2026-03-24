import React, { useEffect, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Divider, FormControl, InputAdornment, OutlinedInput, Popover, styled, TextField } from '@mui/material';
import Stack from '@mui/material/Stack';
import { TreeViewItemId } from '@mui/x-tree-view/models';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

import { IUnitBrief } from '@store/amap_ai/units/models';

/* Styled OutlinedInput */
const StyledSearchField = styled(OutlinedInput)(({ theme }) => ({
  marginTop: theme.spacing(2),
  borderRadius: theme.spacing(3),
  backgroundColor:
    theme.palette.mode === 'dark' ? theme.palette.layout?.background16 : theme.palette.layout?.background5,
  '& .MuiInputAdornment-positionStart': {
    color: theme.palette.text.primary,
  },
  '& .MuiInputAdornment-positionEnd': {
    color: theme.palette.text.secondary,
    '&:hover': { color: theme.palette.text.primary },
  },
}));

/* Styled Popover */
const StyledPopper = styled(Popover)(() => ({
  '& .MuiPopover-paper': {
    maxHeight: 500,
    width: 400,
    borderColor: 'transparent',
  },
}));

/* Styled Tree Item */
const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  '& .MuiTreeItem-content': {
    padding: theme.spacing(1),
    borderRadius: 0,
    marginLeft: ' -100%',
    paddingLeft: 'calc(100% + 5px) !important',
    width: '300%',
    paddingRight: '100%',
  },
  '& .MuiTreeItem-iconContainer': {
    width: `${theme.spacing(6)} !important`,
  },
  '& .MuiSvgIcon-root': {
    height: theme.spacing(8),
    width: theme.spacing(8),
    marginTop: '-4px',
  },
}));

/* Extended Unit Model for fuzzy search capability */
export interface FuzzySearchUnit extends IUnitBrief {
  searchValue?: string;
}

/**
 * @typedef UnitSelectProps
 * @prop { Array<IUnitBrief>} units - Units Data
 * @prop { Function } handleOnChange - Callback function to handle in parent component: @return selected IUnitBrief
 * @prop { string | IUnitBrief } [defaultValue] - Default selected IUnitBrief; If string then lookup from units data
 */
export interface UnitSelectProps {
  units: Array<IUnitBrief>;
  showShortName?: boolean;
  onChange: (selection: IUnitBrief) => void;
  value?: IUnitBrief;
  label?: string;
  readOnly?: boolean;
  disabled?: boolean;
  width?: string;
  error?: boolean;
  helperText?: string;
  displayEmpty?: boolean;
}

/**
 * UnitSelect Functional Component
 *
 * @param { UnitSelectProps } props
 */
export const UnitSelect: React.FC<UnitSelectProps> = ({
  units,
  onChange,
  value,
  disabled,
  readOnly,
  width,
  error,
  helperText,
  showShortName = false,
  label = 'Unit',
  displayEmpty = false,
}) => {
  const [searchableUnits, setSearchableUnits] = useState<Array<FuzzySearchUnit>>([]);
  const [filteredUnits, setFilteredUnits] = useState<Array<FuzzySearchUnit>>([]);
  const [expandedItems, setExpandedItems] = useState<Array<string>>([]);

  const [searchValue, setSearchValue] = useState<string>('');

  const [selection, setSelection] = useState<FuzzySearchUnit | undefined>(undefined);

  useEffect(() => {
    setSelection(value ? { ...value, searchValue: getFuzzySearchString(value) } : undefined);
  }, [value]);

  const [unitSearchAnchorEl, setUnitSearchAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const openUnitSearch = Boolean(unitSearchAnchorEl);

  useEffect(() => {
    const fuzzyUnits = units.map((unit) => ({
      ...unit,
      searchValue: getFuzzySearchString(unit),
    }));
    setSearchableUnits(fuzzyUnits);
  }, [units]);

  // When [searchable] units or search value changes, we need to reapply search criteria
  useEffect(() => {
    updateFilteredUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue, searchableUnits]);

  // Using declarative function syntax for supporting functions to avoid need to specifically sequence
  // function definitions due to hoisting:
  // Create search string
  function getFuzzySearchString(unit: IUnitBrief): string {
    return `${unit.uic?.toLocaleLowerCase()} ${unit.shortName?.toLocaleLowerCase()} ${unit.displayName?.toLocaleLowerCase()} ${unit.nickName?.toLocaleLowerCase()}`;
  }

  /* Recursive get parent unit */
  function getParentUnit(parentUic: string | undefined) {
    if (!parentUic) {
      return [];
    }
    let units = searchableUnits.filter((unit) => unit.uic === parentUic);

    units.forEach((unit) => {
      units = [...units, ...getParentUnit(unit.parentUic)];
    });

    return units;
  }

  function updateFilteredUnits() {
    let filtered: Array<FuzzySearchUnit> = [...searchableUnits];

    if (filtered.length && searchValue) {
      filtered = filtered.filter((unit) => unit.searchValue?.includes(searchValue.toLocaleLowerCase()));
    }

    let units: Array<FuzzySearchUnit> = [];
    // Getting parent units and combining with filtered units
    filtered.forEach((unit) => {
      units = [...units, ...getParentUnit(unit.parentUic)];
    });
    // remove duplicates from array
    units = [...new Set([...filtered, ...units])];

    // only set expanded items if < units threshold to improve render time
    if (units.length < 500) {
      const itemIds: TreeViewItemId[] = units.map((unit) => unit.uic);
      setExpandedItems(itemIds);
    }

    setFilteredUnits(units);
  }

  // Unit Search Field handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUnitSearch = (event: React.MouseEvent<any>) => {
    setUnitSearchAnchorEl(event.currentTarget);
  };
  const handleUnitSearchClose = () => {
    setUnitSearchAnchorEl(null);
  };

  // Unit selection
  const handleSelection = (event: React.ChangeEvent<HTMLElement>, unit: IUnitBrief) => {
    if (event.target.tagName === 'DIV') {
      setSelection(unit);
      setUnitSearchAnchorEl(null);
      onChange(unit);
    }
  };

  /**
   * Handling Search input changes
   * - Sets search value and units to be shown in dropdown tree
   */
  const handleOnSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  /* Setting expanded item id's */
  const handleExpandedItemsChange = (_event: React.SyntheticEvent, itemIds: string[]) => {
    setExpandedItems(itemIds);
  };

  /* Clear search field, expanded items, and filtered units displayed in dropdown */
  const clearFilters = () => {
    setSearchValue('');
    setExpandedItems([]);
    setFilteredUnits(searchableUnits);
  };

  /* Recursive render TreeItem */
  const renderChildTreeItem = (unit: IUnitBrief) => {
    return filteredUnits
      ?.filter((parent) => parent.parentUic === unit.uic)
      .map((unit) => (
        <StyledTreeItem
          key={unit.uic}
          id={`tree-item-${unit.uic}`}
          data-testid={`tree-item-${unit.uic}`}
          itemId={unit.uic}
          label={unit.displayName}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={(event) => handleSelection(event as any, unit)}
        >
          {renderChildTreeItem(unit)}
        </StyledTreeItem>
      ));
  };

  return (
    <>
      {/* Unit Select Button/Span */}
      <Stack>
        {/* Select Label/Input */}
        <TextField
          id="unit-select-text-field"
          data-testid="unit-select-text-field"
          aria-label={label}
          label={displayEmpty ? undefined : label}
          fullWidth={!width}
          sx={width ? { width: width } : {}}
          required
          InputLabelProps={{ shrink: true }}
          value={selection?.displayName}
          onClick={!readOnly ? handleUnitSearch : () => {}}
          inputProps={{ readOnly }}
          disabled={disabled}
          error={error}
          helperText={helperText}
        />
        {/* Tree Select Dropdown box */}
        <StyledPopper
          id="unit-search"
          data-testid="unit-search"
          open={openUnitSearch}
          anchorEl={unitSearchAnchorEl}
          onClose={handleUnitSearchClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          spacing={1}
        >
          {/* Search Input */}
          <FormControl sx={{ mx: 2, mt: 0, pr: 2, width: '97%' }}>
            <StyledSearchField
              id="unit-search-field"
              data-testid="unit-search-field"
              size="small"
              placeholder="Search By UIC or Name..."
              sx={{ border: 'none !important' }}
              startAdornment={
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <ClearIcon onClick={clearFilters} />
                </InputAdornment>
              }
              value={searchValue}
              onChange={handleOnSearchChange}
            />
          </FormControl>
          <Divider sx={{ mb: 2, ml: '8px' }} />
          <SimpleTreeView
            data-testid="tree-select"
            expansionTrigger="iconContainer"
            expandedItems={expandedItems}
            onExpandedItemsChange={handleExpandedItemsChange}
            slots={{
              expandIcon: ArrowDropUpIcon,
              collapseIcon: ArrowDropDownIcon,
            }}
            sx={{
              width: '100%',
              overflow: 'hidden',
              overflowY: 'scroll',
            }}
          >
            {filteredUnits.map((unit) => {
              if (unit.level === 0) {
                return (
                  <StyledTreeItem
                    data-testid={`tree-item-${unit.uic}`}
                    key={unit.uic}
                    itemId={unit.uic}
                    label={!showShortName ? unit.displayName : unit.shortName}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={(event) => handleSelection(event as any, unit)}
                  >
                    {renderChildTreeItem(unit)}
                  </StyledTreeItem>
                );
              }
            })}
          </SimpleTreeView>
        </StyledPopper>
      </Stack>
    </>
  );
};
