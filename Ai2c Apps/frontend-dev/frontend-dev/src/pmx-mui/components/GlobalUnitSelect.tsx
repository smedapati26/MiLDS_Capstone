/* eslint-disable sonarjs/no-nested-conditional */
import { useCallback, useEffect, useRef, useState } from 'react';

import { useDebounce } from '@hooks/useDebounce';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ClearIcon from '@mui/icons-material/Clear';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import {
  Box,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  OutlinedInput,
  styled,
  TextField,
  useTheme,
} from '@mui/material';
import Button from '@mui/material/Button';
import MuiPopover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

import { Unit } from '@ai2c/pmx-mui';

/* Styled MUI Popover Component to look like Context Menu */
export const ContextPopover = styled(MuiPopover)(({ theme }) => ({
  '& .MuiBackdrop-root': {
    opacity: '0 !important',
  },
  '& .MuiBackdrop': {
    backgroundColor: 'transparent',
  },
  '& .MuiPopover-paper': {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.layout?.background11,
  },
}));

/* Styled MUI Popover Component to look like default Menu */
export const Popover = styled(MuiPopover)(({ theme, spacing }) => ({
  '& .MuiPopover-paper': {
    padding: spacing ? theme.spacing(spacing) : theme.spacing(0),
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.layout?.background11 : theme.palette.layout?.base,
    borderWidth: '1px',
    borderColor: theme.palette.layout?.background5,
  },
  '& .MuiBackdrop-root': {
    opacity: '0 !important',
  },
  '& .MuiBackdrop': {
    backgroundColor: 'transparent',
  },
}));

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
    width: '33vw',
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
  '& .Favorites-iconContainer .MuiSvgIcon-root': {
    height: theme.spacing(4),
    width: theme.spacing(4),
  },
  '& .MuiTreeItem-iconContainer .MuiSvgIcon-root': {
    height: theme.spacing(4),
    width: theme.spacing(4),
  },
}));

/* Extended Unit Model for fuzzy search capability */
export interface FuzzySearchUnit extends Unit {
  searchValue?: string;
}

/**
 * @typedef GlobalUnitSelectProps
 * @prop { Array<FuzzySearchUnit>} units - Units Data
 * @prop { string | Unit } [defaultValue] - Default selected Unit; If string then lookup from units data
 * @prop { Function } handleOnChange - Callback function to handle in parent component: @return selected Unit
 * @prop { Array<FuzzySearchUnit>} favoriteUnits - List of favorite units for user
 * @prop { Function } handleToggleFavorite - Function to handle favorite icon button click and toggle favorite unit selection
 */
export interface GlobalUnitSelectProps {
  units: Array<FuzzySearchUnit | Unit>;
  defaultValue?: string | Unit;
  handleOnChange?: (_selection: Unit) => void;
  favoriteUnits?: Array<FuzzySearchUnit | Unit>;
  handleToggleFavorite?: (_selection: Unit) => void;
}

/**
 * GlobalUnitSelect Functional Component
 *
 * @param { GlobalUnitSelectProps } props
 */
export const GlobalUnitSelect: React.FC<GlobalUnitSelectProps> = (props: GlobalUnitSelectProps) => {
  const { units, favoriteUnits, handleToggleFavorite, handleOnChange, defaultValue } = props;

  const { palette } = useTheme();

  const [searchableUnits, setSearchableUnits] = useState<Array<FuzzySearchUnit>>([]);
  const [filteredUnits, setFilteredUnits] = useState<Array<FuzzySearchUnit>>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Array<FuzzySearchUnit>>([]);
  const [expandedItems, setExpandedItems] = useState<Array<string>>([]);

  const [unit, setUnit] = useState<FuzzySearchUnit>();
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<FuzzySearchUnit>();

  const [debouncedSearchValue] = useDebounce(searchValue, 200);

  const treeRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const [unitSearchAnchorEl, setUnitSearchAnchorEl] = useState<HTMLButtonElement | null>(null);
  const openUnitSearch = Boolean(unitSearchAnchorEl);

  // Using declarative function syntax for supporting functions to avoid need to specifically sequence
  // function definitions due to hoisting:
  // Create search string
  const getFuzzySearchString = useCallback((unit: Unit): string => {
    return `${unit.uic.toLocaleLowerCase()} ${unit.shortName.toLocaleLowerCase()} ${unit.displayName.toLocaleLowerCase()} ${unit.nickname?.toLocaleLowerCase()}`;
  }, []);

  // IF default value get default unit and set as selectedUnit
  useEffect(() => {
    let defaultUnit: FuzzySearchUnit | undefined;

    if (defaultValue) {
      if (typeof defaultValue === 'string') {
        defaultUnit = units.find((unit) => unit.uic === defaultValue);
      } else {
        defaultUnit = { ...defaultValue, searchValue: getFuzzySearchString(defaultValue) };
      }
    }

    if (defaultUnit) {
      setUnit(defaultUnit);
      setSelectedUnit(defaultUnit);
    }
  }, [defaultValue, getFuzzySearchString, units]);

  /* Recursive get parent unit */
  const getParentUnit = useCallback(
    (parentUic: string) => {
      let units = searchableUnits.filter((unit) => unit.uic === parentUic);

      units.forEach((unit) => {
        if (unit.parentUic) {
          units = [...units, ...getParentUnit(unit.parentUic)];
        }
      });

      return units;
    },
    [searchableUnits],
  );

  const updateFilteredUnits = useCallback(() => {
    if (debouncedSearchValue && debouncedSearchValue.length > 1) {
      let filtered: Array<FuzzySearchUnit> = [];
      filtered = searchableUnits.filter((unit) => unit.searchValue?.includes(debouncedSearchValue.toLocaleLowerCase()));

      let units: Array<FuzzySearchUnit> = [];
      // Getting parent units and combining with filtered units
      filtered.forEach((unit) => {
        if (unit.parentUic) {
          units = [...units, ...getParentUnit(unit.parentUic)];
        }
      });
      // remove duplicates from array
      units = [...new Set([...filtered, ...units])];

      setFilteredUnits(units);
      setExpandedItems(units.map((unit) => unit.uic));
    } else {
      setFilteredUnits(searchableUnits);
      setExpandedItems([]);
    }
  }, [searchableUnits, debouncedSearchValue, getParentUnit]);

  // Restructures favorites under nearest ancestor based on filtered units
  const updateFilteredFavorites = useCallback(() => {
    // builds nested and filtered favorites
    const allUnits = new Map(filteredUnits.map((unit) => [unit.uic, unit]));
    const favUics = new Set(favoriteUnits?.map((unit) => unit.uic));
    const updatedFavorites = favoriteUnits?.map((unit) => ({ ...unit })) || [];

    for (const unit of updatedFavorites) {
      let currentParentUic: string | undefined = unit.parentUic;

      while (currentParentUic) {
        if (favUics.has(currentParentUic)) {
          // Found nearest ancestor - update parentUic and stop
          unit.parentUic = currentParentUic;
          break;
        }

        const parent = allUnits.get(currentParentUic);
        currentParentUic = parent?.parentUic;
      }

      if (!currentParentUic) {
        unit.parentUic = '';
      }
    }
    setFilteredFavorites(updatedFavorites);
  }, [filteredUnits, favoriteUnits]);

  useEffect(() => {
    const fuzzyUnits = units.map((unit) => ({
      ...unit,
      searchValue: getFuzzySearchString(unit),
    }));
    setSearchableUnits(fuzzyUnits);
  }, [units, getFuzzySearchString]);

  // When [searchable] units or search value changes, we need to reapply search criteria
  useEffect(() => {
    updateFilteredUnits();
  }, [debouncedSearchValue, searchableUnits, updateFilteredUnits]);

  useEffect(() => {
    if (favoriteUnits) {
      updateFilteredFavorites();
    }
  }, [filteredUnits, favoriteUnits, updateFilteredFavorites]);

  useEffect(() => {
    if (selectedUnit) {
      setExpandedItems(getParentUnit(selectedUnit.uic).map((unit) => unit.uic));
    }
  }, [selectedUnit, getParentUnit]);

  useEffect(() => {
    if (openUnitSearch && (selectedUnit || defaultValue)) {
      const id = `tree-item-${selectedUnit?.uic}`;

      let attempts = 0;
      const maxAttempts = 5;
      const interval = setInterval(() => {
        const el = treeRef.current?.querySelector(`#${id}`);
        if (el && treeRef.current) {
          const container = treeRef.current;
          const elTop = (el as HTMLElement).offsetTop;
          const elHeight = (el as HTMLElement).offsetHeight;
          const containerHeight = treeRef.current.clientHeight;

          container.scrollTop = elTop - containerHeight / 2 + elHeight / 2;
          clearInterval(interval);
        } else if (++attempts > maxAttempts) {
          clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [defaultValue, openUnitSearch, selectedUnit]);

  // Unit Select Button handlers
  const handleUnitSelect = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Unit Search Field handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUnitSearch = (event: React.MouseEvent<any>) => {
    setUnitSearchAnchorEl(event.currentTarget);
  };

  const handleUnitSearchClose = () => {
    setUnitSearchAnchorEl(null);
  };

  // Unit selection
  const handleSelection = (event: React.ChangeEvent<HTMLElement>, unit: Unit) => {
    if (event.target.closest('.MuiTreeItem-iconContainer')) return;
    if (event.target.closest('[data-action-button]')) return;

    setSelectedUnit(unit);
    setUnitSearchAnchorEl(null);
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

  /* Render conditional dropdown label with favorites icons */
  const renderDropdownLabel = (unit: Unit, usingFavorites: boolean, favorite?: boolean) => {
    const isFavorite = favorite
      ? favorite
      : usingFavorites && favoriteUnits?.find((favUnit) => favUnit.uic === unit.uic) !== undefined;

    return usingFavorites && handleToggleFavorite ? (
      <Stack direction="row" alignItems="center" justifyContent={'space-between'} className="Favorites-iconContainer">
        <Typography>{unit.displayName}</Typography>
        <IconButton
          data-testid={`iconButton-${unit.uic}-${favorite ? 'selected' : 'unselected'}`}
          onClick={() => handleToggleFavorite(unit)}
          data-action-button
        >
          {isFavorite ? <StarIcon /> : <StarOutlineIcon />}
        </IconButton>
      </Stack>
    ) : (
      <Typography>{unit.displayName}</Typography>
    );
  };

  /* Recursive render TreeItem */
  const renderChildTreeItem = (unit: Unit, allUnits: Unit[], idPrefix: string = '') => {
    return allUnits
      ?.filter((parent) => parent.parentUic === unit.uic)
      .map((unit) => (
        <StyledTreeItem
          key={`${idPrefix}${unit.uic}`}
          id={`tree-item-${idPrefix}${unit.uic}`}
          data-testid={`tree-item-${idPrefix}${unit.uic}`}
          itemId={`${idPrefix}${unit.uic}`}
          label={renderDropdownLabel(unit, favoriteUnits !== undefined)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={(event) => handleSelection(event as any, unit)}
        >
          {renderChildTreeItem(unit, allUnits, idPrefix)}
        </StyledTreeItem>
      ));
  };

  // On apply return uic
  const handleApplyClick = () => {
    if (selectedUnit) {
      setUnit(selectedUnit);
      handleOnChange && handleOnChange(selectedUnit);
      setAnchorEl(null);
    }
  };

  return (
    <>
      {/* Unit Select Button/Span */}
      <Box
        data-testid="unit-select-button"
        component="button"
        display="flex"
        flexDirection="row"
        alignItems="center"
        onClick={handleUnitSelect}
        sx={{
          backgroundColor: 'transparent',
          border: 'none',
          color: palette.text.primary,
        }}
      >
        <Typography data-testid="unit-select-label">
          {unit?.shortName || unit?.displayName || 'Select a Unit'}
        </Typography>
        <MoreVertIcon />
      </Box>
      {/* Unit Select Dropdown Popover */}
      <Popover
        id="unit-select"
        data-testid="unit-select"
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        spacing={3}
        sx={{
          '& .MuiPopover-paper': {
            overflow: 'visible',
          },
        }}
      >
        <Stack sx={{ my: 2, width: '33vw' }}>
          <Typography variant="body1" gutterBottom sx={{ mb: 4 }}>
            Select Global Unit
          </Typography>
          {/* Select Label/Input */}
          <TextField
            id="unit-select-text-field"
            data-testid="unit-select-text-field"
            label="Unit"
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            inputProps={{ 'data-testid': 'input-unit-select-text-field' }}
            value={selectedUnit?.displayName}
            onClick={handleUnitSearch}
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
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
            spacing={3}
          >
            {/* Search Input */}
            <FormControl sx={{ m: 2, mt: 0, pr: 2, width: '100%' }}>
              <StyledSearchField
                id="unit-search-field"
                data-testid="unit-search-field"
                size="small"
                placeholder="Search..."
                sx={{ border: 'none !important' }}
                startAdornment={
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                }
                endAdornment={
                  searchValue ? (
                    <InputAdornment position="end">
                      <ClearIcon onClick={clearFilters} />
                    </InputAdornment>
                  ) : (
                    <></>
                  )
                }
                value={searchValue}
                onChange={handleOnSearchChange}
              />
            </FormControl>
            <Divider sx={{ mb: 2, ml: '8px' }} />
            <div ref={treeRef} style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {favoriteUnits && handleToggleFavorite && (
                <SimpleTreeView
                  data-testid="favorites-tree-select"
                  expansionTrigger="iconContainer"
                  selectedItems={
                    defaultValue
                      ? typeof defaultValue === 'string'
                        ? `favorite-${defaultValue}`
                        : `favorite-${defaultValue.uic}`
                      : ''
                  }
                  expandedItems={expandedItems}
                  onExpandedItemsChange={handleExpandedItemsChange}
                  slots={{
                    expandIcon: ArrowDropUpIcon,
                    collapseIcon: ArrowDropDownIcon,
                  }}
                  sx={{
                    width: '100%',
                    overflow: 'hidden',
                  }}
                >
                  <StyledTreeItem
                    data-testid={'tree-item-favorites'}
                    key={'__favorites__'}
                    itemId={'__favorites__'}
                    label={
                      <Stack direction="row" alignItems="center" spacing={2} className="Favorites-iconContainer">
                        <StarIcon />
                        <Typography>Favorites</Typography>
                      </Stack>
                    }
                  >
                    {/* Show favorites without parentUic at root level */}
                    {filteredFavorites
                      .filter((unit) => !unit.parentUic)
                      .map((unit) => {
                        return (
                          <StyledTreeItem
                            data-testid={`tree-item-${unit.uic}`}
                            key={unit.uic}
                            itemId={unit.uic}
                            label={renderDropdownLabel(unit, true, true)}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            onClick={(event) => handleSelection(event as any, unit)}
                          >
                            {renderChildTreeItem(unit, filteredFavorites, 'favorite-')}
                          </StyledTreeItem>
                        );
                      })}
                  </StyledTreeItem>
                </SimpleTreeView>
              )}
              <SimpleTreeView
                data-testid="tree-select"
                expansionTrigger="iconContainer"
                selectedItems={defaultValue ? (typeof defaultValue === 'string' ? defaultValue : defaultValue.uic) : ''}
                expandedItems={expandedItems}
                onExpandedItemsChange={handleExpandedItemsChange}
                slots={{
                  expandIcon: ArrowDropUpIcon,
                  collapseIcon: ArrowDropDownIcon,
                }}
                sx={{
                  width: '100%',
                  overflow: 'hidden',
                }}
              >
                {filteredUnits.map((unit) => {
                  if (unit.level === 0) {
                    return (
                      <StyledTreeItem
                        data-testid={`tree-item-${unit.uic}`}
                        key={unit.uic}
                        itemId={unit.uic}
                        label={renderDropdownLabel(unit, favoriteUnits !== undefined)}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onClick={(event) => handleSelection(event as any, unit)}
                      >
                        {renderChildTreeItem(unit, filteredUnits)}
                      </StyledTreeItem>
                    );
                  }
                })}
              </SimpleTreeView>
            </div>
          </StyledPopper>
          {/* Apply Button */}
          <Button
            id="global-unit-select-apply-button"
            data-testid="global-unit-select-apply-button"
            variant="contained"
            disabled={!selectedUnit || selectedUnit.uic === unit?.uic}
            sx={{ mt: 2, alignSelf: 'flex-end' }}
            onClick={handleApplyClick}
          >
            Apply
          </Button>
        </Stack>
      </Popover>
    </>
  );
};
