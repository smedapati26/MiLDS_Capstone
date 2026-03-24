import React, { ReactNode, useEffect, useMemo, useState } from 'react';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {
  Box,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Theme,
  Typography,
  useTheme,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { EnumOption } from '@pmx-mui-models/EnumOption';

import { SearchBar } from './SearchBar';

/**
 * TreeNode defines the data type for a node in the PMxTreeDropdown component
 *
 * @type
 * @param {string} id - computed unique identifier
 * @param {string} value - the string to display in the dropdown
 * @param {number} level - an integer indicating what height in the tree this node is at
 * @param {TreeNode[]} children - an optional list of sub elements to this one in the tree
 */
export type TreeNode = {
  id: string;
  value: string;
  level?: number;
  children?: TreeNode[];
};

/**
 * calculateLevelPadding computes how much padding is needed to make the item appear properly nested in the tree
 *
 * @param isNested - a boolean indicating if the tree item is nested
 * @param itemDepth - the depth in the tree of the given item (either its level or the a counter of its depth based on component usage)
 * @param rootLevel - the root level of the tree this level will be rendered within
 * @returns a number representative of the padding for a node
 */
const calculateLevelPadding = (isNested: boolean, itemDepth: number, rootLevel: number): number => {
  if (isNested) {
    return (itemDepth - rootLevel) * 2;
  }

  // For non root elements, double the depth
  if (itemDepth > 1) {
    return itemDepth * 2;
  }

  return itemDepth - 1;
};

/**
 * renderTreeItem is the primary function used to render items in the tree
 *
 * @param {TreeNode} item - the TreeNode to display
 * @param {T[]} values - list of selected items
 * @param {{}} config - Configuration parameters
 * @param {T[]} config.expandedItems - list of expanded tree nodes
 * @param {(T) => void} config.handleToggleExpand - expansion toggle handler
 * @param {(T, TreeNode[]) => void} config.handleToggleItem - selection handler
 * @param {number} config.currentDepth - the current depth in the tree
 * @param {number} config.maxDepth - depth to stop rendering at
 * @param {boolean} config.isAllSelected - determines if all tree items are selected (select all used)
 * @param {boolean} config.isNested - A check if this item is nested within others in the tree
 * @param {number} config.rootLevel - the level of the root item in the tree
 * @returns {ReactNode} the UI element for this item in the tree dropdown
 */
const renderTreeItem = <T extends string | number>(
  item: TreeNode,
  values: T[],
  config: {
    expandedItems: T[];
    handleToggleExpand: (id: T) => void;
    handleToggleItem: (id: T, children?: TreeNode[]) => void;
    currentDepth?: number;
    maxDepth?: number;
    isAllSelected?: boolean;
    isNested?: boolean;
    rootLevel?: number;
  },
  theme: Theme,
): ReactNode => {
  const {
    expandedItems,
    handleToggleExpand,
    handleToggleItem,
    currentDepth = 1,
    maxDepth = 3,
    isAllSelected = false,
    isNested = false,
    rootLevel = 1,
  } = config;

  const isExpanded = expandedItems.includes(item.id as T);
  // Includes a check on maxDepth to enable the dropdown to dynamically reduce in recursive depth
  const displayDescendants = item.children && item.children.length > 0 && currentDepth < maxDepth;

  const basePadding = 3;
  const levelPadding = calculateLevelPadding(isNested, item.level || currentDepth, rootLevel);
  const iconOffset = displayDescendants ? 0 : 6.3;
  const totalPadding = basePadding + levelPadding + iconOffset;
  const isChecked = values.includes(item.id as T);

  const getAllDescendantIds = (node: TreeNode): Set<string> => {
    const ids = new Set<string>();
    if (node.children && currentDepth < maxDepth) {
      node.children.forEach((child) => {
        ids.add(child.id);
        getAllDescendantIds(child).forEach((id) => ids.add(id));
      });
    }
    return ids;
  };

  const descendantIds = displayDescendants ? getAllDescendantIds(item) : new Set<string>();
  // Set of all values selected across the entire tree
  const valuesSet = new Set(values.map((v) => v?.toString()));

  // Determines how many of the descendant ids are found in the values list
  const intersection = new Set([...descendantIds].filter((x) => valuesSet.has(x)));

  const allDescendantsSelected =
    displayDescendants && descendantIds.size > 0 && intersection.size === descendantIds.size;

  const someDescendantsSelected = displayDescendants && intersection.size > 0;
  const isIndeterminate = displayDescendants && someDescendantsSelected && !allDescendantsSelected && !isAllSelected;

  const shouldBeChecked = isChecked || allDescendantsSelected || isAllSelected;

  return (
    <Box key={item.id}>
      <MenuItem
        sx={{
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.d60 : theme.palette.primary.l60,
          },
        }}
        disableGutters
      >
        <Box data-testid="menu-item-box" display="flex" alignItems="center" width="100%" pl={totalPadding} pr={3}>
          {displayDescendants && (
            <IconButton
              size="large"
              onClick={(e) => {
                e.stopPropagation();
                handleToggleExpand(item.id as T);
              }}
            >
              {isExpanded ? (
                <ArrowDropUpIcon style={{ fontSize: '3rem' }} />
              ) : (
                <ArrowDropDownIcon style={{ fontSize: '3rem' }} />
              )}
            </IconButton>
          )}
          <Checkbox
            key={`${item.id}-${isExpanded}-${shouldBeChecked}-${isIndeterminate}`}
            checked={shouldBeChecked}
            indeterminate={isIndeterminate}
            onChange={(e) => {
              e.stopPropagation();
              handleToggleItem(item.id as T, currentDepth < maxDepth ? item.children : undefined);
            }}
          />
          <Typography>{item.value}</Typography>
        </Box>
      </MenuItem>
      {displayDescendants && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          {item.children?.map((child) =>
            renderTreeItem(
              child,
              values,
              {
                expandedItems,
                handleToggleExpand,
                handleToggleItem,
                currentDepth: currentDepth + 1,
                maxDepth,
                isAllSelected,
                isNested,
                rootLevel,
              },
              theme,
            ),
          )}
        </Collapse>
      )}
    </Box>
  );
};

const selectParentsWithAllDescendantsSelected = <T extends string | number>(
  values: T[],
  options: TreeNode[],
  onChange: (values: T[]) => void,
  maxDepth: number = 3,
) => {
  const parentIdsToAdd: T[] = [];
  const parentIdsToRemove: T[] = [];

  const checkNodeChildren = (nodes: TreeNode[], currentDepth = 1) => {
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0 && currentDepth < maxDepth) {
        const allDescendantsSelected = node.children.every((child) => {
          const isSelected = values.includes(child.id as unknown as T);
          if (child.children && child.children.length > 0 && currentDepth + 1 < maxDepth) {
            return checkAllDescendants(child, currentDepth + 1);
          }
          return isSelected;
        });

        const noDescendantsSelected = node.children.every((child) => {
          const isSelected = !values.includes(child.id as unknown as T);
          if (child.children && child.children.length > 0 && currentDepth + 1 < maxDepth) {
            return checkNoDescendants(child, currentDepth + 1);
          }
          return isSelected;
        });

        if (allDescendantsSelected && !values.includes(node.id as unknown as T)) {
          parentIdsToAdd.push(node.id as unknown as T);
        } else if (noDescendantsSelected && values.includes(node.id as unknown as T)) {
          parentIdsToRemove.push(node.id as unknown as T);
        }

        checkNodeChildren(node.children, currentDepth + 1);
      }
    });
  };

  const checkAllDescendants = (node: TreeNode, depth: number): boolean => {
    const isSelected = values.includes(node.id as unknown as T);
    if (!node.children || depth >= maxDepth) return isSelected;
    return node.children.every((child) => checkAllDescendants(child, depth + 1));
  };

  const checkNoDescendants = (node: TreeNode, depth: number): boolean => {
    const isSelected = !values.includes(node.id as unknown as T);
    if (!node.children || depth >= maxDepth) return isSelected;
    return node.children.every((child) => checkNoDescendants(child, depth + 1));
  };

  checkNodeChildren(options);

  if (parentIdsToAdd.length > 0 || parentIdsToRemove.length > 0) {
    const updatedValues = [...values, ...parentIdsToAdd].filter((id) => !parentIdsToRemove.includes(id));
    onChange(updatedValues);
  }
};

interface PmxTreeDropdownProps<T extends string | number> {
  label: string;
  values: T[];
  onChange: (val: T[]) => void;
  options: TreeNode[];
  renderChips?: boolean;
  minWidth?: number;
  maxWidth?: number;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  hasSearch?: boolean;
  maxDepth?: number;
  isNested?: boolean;
  rootLevel?: number;
}

/**
 * PmxTreeDropdown component renders a Tree Select Dropdown.
 *
 * @component
 * @param {PmxTreeDropdownProps} props - The properties interface.
 * @param {string} props.label - Label for select dropdown
 * @param {T[]} props.values - Generic array of values to track selection options in the state
 * @param {TreeOption[]} props.options - Generic array of tree options to select in the dropdown
 * @param {number} props.minWidth - Changes the width of the dropdown.
 * @param {boolean} props.renderChips - Boolean to change the display value of select values to rendered chips
 * @param {number} props.minWidth - Minimum width to pass to the dropdown component styling
 * @param {number} props.maxWidth - Maximum width to pass to dropdown component styling
 * @param {boolean} props.fullWidth - indicates if the dropdown should expand to full
 * @param {boolean} props.disabled - Disables the dropdown
 * @param {boolean} props.loading - Flag to indicate if the dropdown is loading.
 * @param {boolean} props.hasSearch - Flag to indicate if a search exists
 * @param {number} props.maxDepth - Maximum tree depth to render
 * @param {number} props.rootLevel - Level of the root node used in the dropdown
 * @param {function(T[]: void)} props.onChange - Callback function for dropdown state management
 *
 * @returns {ReactNode} The rendered tree select dropdown component.
 */
export const PmxTreeDropdown = <T extends string | number>({
  label,
  values,
  options,
  renderChips,
  fullWidth,
  maxWidth = 800,
  minWidth = 240,
  disabled,
  loading,
  onChange,
  hasSearch = true,
  maxDepth = 3,
  isNested = false,
  rootLevel = 1,
}: PmxTreeDropdownProps<T>): ReactNode => {
  const theme = useTheme();
  const [expandedItems, setExpandedItems] = useState<T[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!maxDepth || !isNested) return;
    selectParentsWithAllDescendantsSelected(values, options, onChange, maxDepth);
  }, [values, options, onChange, maxDepth, isNested]);

  const searchOptions = useMemo(() => {
    const allOptions = new Set<string>();

    const addOptionToSet = (node: TreeNode, depth = 1) => {
      if (depth > maxDepth) return;
      allOptions.add(node.value?.toString() ?? '');
      node.children?.forEach((child) => {
        addOptionToSet(child, depth + 1);
      });
    };

    options.forEach((option) => addOptionToSet(option, 1));

    return Array.from(allOptions).map((value) => ({
      value,
      label: value,
    }));
  }, [options, maxDepth]);

  const handleSearch = (_event: React.SyntheticEvent, value: EnumOption | null) => {
    setSearchQuery(value ? value?.value?.toString() : '');
  };

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;

    const filterNodesBySearch = (nodes: TreeNode[], depth: number): TreeNode[] => {
      return nodes
        .map((node) => {
          const matchesSearch = node.value?.toString()?.toLowerCase()?.includes(searchQuery.toLowerCase());
          const filteredChildren =
            node.children && depth < maxDepth ? filterNodesBySearch(node.children, depth + 1) : undefined;

          if (matchesSearch || (filteredChildren && filteredChildren.length > 0)) {
            return {
              ...node,
              children: filteredChildren,
            };
          }
          return null;
        })
        .filter((node): node is NonNullable<typeof node> => node !== null);
    };

    return filterNodesBySearch(options, 1);
  }, [options, searchQuery, maxDepth]);

  const getAllIds = (items: TreeNode[], currentDepth = 1): T[] => {
    const getNestedIds = (item: TreeNode, depth: number): T[] => {
      if (!item.children || depth >= maxDepth) return [item.id as unknown as T];

      const childIds = item.children.flatMap((child) => getNestedIds(child, depth + 1));
      return [item.id as unknown as T, ...childIds];
    };

    return items.flatMap((item) => getNestedIds(item, currentDepth));
  };

  const allIds = getAllIds(options);
  const allIdsSet = new Set(allIds);
  const selectedSet = new Set(values);
  const isAllSelected = selectedSet.size === allIdsSet.size && [...selectedSet].every((id) => allIdsSet.has(id));
  const isIndeterminate = values.length > 0 && !isAllSelected;

  const handleToggleExpand = (id: T) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const handleSelectAll = () => {
    if (isAllSelected || (values.length === allIds.length && values.length > 0)) {
      onChange([]);
    } else {
      onChange(allIds);
    }
  };

  const handleSelect = (event: SelectChangeEvent<T[]>) => {
    const { target } = event;
    const value = target.value as T[];
    target.name !== undefined && onChange(value);
  };

  const handleToggleItem = (id: T, children?: (typeof options)[number]['children']) => {
    if (values.includes(id)) {
      // When unchecking, remove self and all descendants
      const getDescendantIds = (nodes?: TreeNode[], depth = 1): T[] => {
        if (!nodes || depth >= maxDepth) return [];
        return nodes.flatMap((node) => [node.id as unknown as T, ...getDescendantIds(node.children, depth + 1)]);
      };

      const descendantIds = getDescendantIds(children);
      const updatedValues = values.filter((value) => value !== id && !descendantIds.includes(value));
      onChange(updatedValues);
    } else {
      // When checking, get all descendant IDs recursively
      const getAllDescendantIds = (nodes?: TreeNode[], depth = 1): T[] => {
        if (!nodes || depth >= maxDepth) return [];
        return nodes.flatMap((node) => [node.id as unknown as T, ...getAllDescendantIds(node.children, depth + 1)]);
      };

      const descendantIds = getAllDescendantIds(children);
      const newValues = [...values, id, ...descendantIds].filter(
        (value, index, array) => array.indexOf(value) === index,
      );
      onChange(newValues);
    }
  };

  const renderOptions = (items: TreeNode[]) => {
    return items.map((item) =>
      renderTreeItem(
        item,
        values,
        {
          expandedItems,
          handleToggleExpand,
          handleToggleItem,
          currentDepth: 1,
          maxDepth,
          isAllSelected,
          isNested,
          rootLevel,
        },
        theme,
      ),
    );
  };

  const renderValue = (selected: T[]) => {
    const hasSelectedDescendant = (node: TreeNode, depth: number = 1): boolean => {
      if (selected.includes(node.id as unknown as T)) return true;
      if (!node.children || depth >= maxDepth) return false;
      return node.children.some((child) => hasSelectedDescendant(child, depth + 1));
    };

    const selectedOptions = options
      .filter((option) => {
        const isDirectlySelected = selected.includes(option.id as T);
        const hasSelectedChildren = option.children?.some((child) => hasSelectedDescendant(child, 1));
        return isDirectlySelected || hasSelectedChildren;
      })
      .map((option) => option.value?.toString() ?? '');

    if (renderChips) {
      return (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {selectedOptions.map((x) => (
            <Chip key={x} label={x} />
          ))}
        </Box>
      );
    }
    return selectedOptions.join(', ');
  };
  return (
    <FormControl size="small" {...(fullWidth && { fullWidth })} sx={{ m: 1, minWidth, maxWidth }}>
      <InputLabel htmlFor="pmx-tree-dropdown-select" sx={{ pt: 1 }}>
        {label}
      </InputLabel>
      <Select<T[]>
        data-testid="models-select"
        aria-busy={loading}
        multiple
        value={values}
        onChange={handleSelect}
        sx={{
          height: '56px',
        }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 400,
            },
            ...(theme.palette.mode === 'dark' && {
              sx: {
                '& .MuiList-root': {
                  backgroundColor: '#2C2C2C',
                },
              },
            }),
          },
        }}
        input={
          <OutlinedInput
            label={label}
            endAdornment={
              loading ? (
                <InputAdornment position="end">
                  <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
                </InputAdornment>
              ) : null
            }
          />
        }
        IconComponent={loading ? () => null : undefined}
        {...(disabled && { disabled })}
        renderValue={renderValue}
      >
        {[
          hasSearch && (
            <Box key="search" sx={{ p: 2, pb: 0 }}>
              <SearchBar
                options={searchOptions}
                variant="standard"
                color="default"
                onChange={(_event, value) => handleSearch(_event, value)}
                styles={{
                  width: '100%',
                }}
              />
              <Divider sx={{ m: 2 }} />
            </Box>
          ),
          <Box key="select-all" display="flex" alignItems="center" width="100%" sx={{ ml: 1, mt: 2, pl: 3 }}>
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={handleSelectAll}
              aria-label="Select All"
            />
            <Typography>Select All</Typography>
          </Box>,
          <Divider key="divider" sx={{ m: 2 }} />,
          ...renderOptions(filteredOptions),
        ].filter(Boolean)}
      </Select>
    </FormControl>
  );
};
