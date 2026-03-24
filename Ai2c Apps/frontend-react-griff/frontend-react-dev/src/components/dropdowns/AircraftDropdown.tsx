/* eslint-disable react-hooks/exhaustive-deps */
import { forwardRef, ReactNode, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

import { PmxTreeDropdown, slugify, TreeNode } from '@ai2c/pmx-mui';

import PmxMultiSelect from '@components/PmxMultiSelect';

import { IAircraft } from '@store/griffin_api/aircraft/models/IAircraft';
import { useGetAircraftByUicQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

const allValues = (nodes: TreeNode[]): string[] => {
  return nodes.reduce((acc: string[], node: TreeNode) => {
    acc.push(node.value);
    if (node.children) {
      acc.push(...allValues(node.children));
    }
    return acc;
  }, []);
};

type AircraftIndex = 'aircraftModel' | 'serial' | 'aircraftFamily';
interface IAircraftDropdown {
  selected: string[];
  handleSelect: (val: string[]) => void;
  selectAll?: boolean;
  multiSelect?: boolean;
  aircraftType?: AircraftIndex;
  label?: string;
  isTree?: boolean;
  filterValues?: string[];
  disabled?: boolean;
}

export type AircraftDropdownRef = {
  clearSelectAll: () => void;
};

/**
 * A component to render the drop down of aircraft.
 * Allow users to render a tree combination of Models and Family or just a simple selector of Serials, Models or Family
 * Allow filtering on all three model components base on string[].
 *
 * @component
 * @param {IAircraftDropdown} props - The component properties
 * @param {string[]} props.selected - Array of selected dropdown values
 * @param {function(T[]: void)} props.handleSelect - Callback function for dropdown state management
 * @param {boolean} props.selectAll - select all variable at render when:: multiSelect === true
 * @param {boolean} props.multiSelect - boolean to allow users to select more than 1 choice
 * @param {AircraftIndex} props.aircraftType - index/key of what values to show from IAircraft model
 * @param {string} props.label - string label to show in the selector
 * @param {FilterDict} props.filterValues - dictionary to filter aircraftData by
 * @param {boolean} props.disabled - Flag to disable the dropdown
 *
 * @returns {ReactNode} The rendered slider component.
 */

const AircraftDropdown = forwardRef<AircraftDropdownRef, IAircraftDropdown>(
  (
    {
      selected,
      selectAll = false,
      multiSelect = true,
      handleSelect,
      aircraftType = 'aircraftModel',
      label = 'Models',
      isTree = false,
      filterValues = [],
      disabled = false,
    }: IAircraftDropdown,
    ref,
  ): ReactNode => {
    const currentUic = useAppSelector(selectCurrentUic);
    const { data: aircraftData, isLoading: loadingAircraft } = useGetAircraftByUicQuery(currentUic);
    const [aircraftValues, setAircraftValues] = useState<TreeNode[] | string[] | undefined>([]);
    const prevFilterValues = useRef<string>('');

    const filteredData = useMemo(() => {
      // searches all values in aircraftModel, aircraftFamily, and serial that are in the list
      if (filterValues.length !== 0) {
        return aircraftData?.filter((item) => Object.values(item).some((val) => filterValues.includes(val)));
      }
      return aircraftData;
    }, [filterValues]);

    const pmxMultiRef = useRef<{ clearSelectAll: () => void }>(null);

    useImperativeHandle(ref, () => ({
      clearSelectAll: () => {
        pmxMultiRef.current?.clearSelectAll();
        handleSelect([]);
      },
    }));

    useEffect(() => {
      // clear selected values if filter changes
      const currentFilterValues = JSON.stringify(filteredData);
      if (prevFilterValues.current !== currentFilterValues) handleSelect([]);
      prevFilterValues.current = currentFilterValues;

      if (isTree) {
        const aggregatedModels: TreeNode[] | undefined = filteredData?.reduce<TreeNode[]>(
          (acc, { aircraftModel, aircraftFamily }) => {
            const family = acc.find((f) => f.value === aircraftFamily);
            if (!family) {
              acc.push({
                id: `${aircraftFamily}`,
                value: aircraftFamily,
                children: [{ id: `${aircraftModel}`, value: aircraftModel }],
              });
            } else {
              const modelExists = family.children?.some((child) => child.value === aircraftModel);
              if (!modelExists) {
                family.children?.push({ id: `${aircraftModel}`, value: aircraftModel });
              }
            }
            return acc;
          },
          [],
        );
        setAircraftValues(aggregatedModels);
        if (selectAll && aggregatedModels) {
          const allModels = aggregatedModels ? allValues(aggregatedModels) : [];
          handleSelect(allModels);
        }
      } else {
        const aircraft = [...new Set(filteredData?.map((aircraft: IAircraft) => aircraft[aircraftType]))];
        setAircraftValues(aircraft);
        if (selectAll) handleSelect(aircraft);
      }
    }, [aircraftData, aircraftType, filteredData]);

    const onChangeHandler = (newValues: string[]) => {
      const value = multiSelect ? newValues : newValues.slice(-1);
      handleSelect(value);
    };

    return isTree ? (
      <PmxTreeDropdown
        loading={loadingAircraft}
        label={label}
        values={selected}
        options={(aircraftValues as TreeNode[]) ?? []}
        onChange={onChangeHandler}
        data-testid={`${slugify(label)}-select`}
        aria-labelledby={`${slugify(label)}-label`}
      />
    ) : (
      <PmxMultiSelect
        label={label}
        values={selected}
        disabled={disabled}
        options={(aircraftValues as string[]) ?? []}
        loading={loadingAircraft}
        onChange={onChangeHandler}
        data-testid={`${slugify(label)}-select`}
        aria-label={`${slugify(label)}-label`}
        maxSelections={multiSelect ? undefined : 1}
        ref={pmxMultiRef}
      />
    );
  },
);

AircraftDropdown.displayName = 'AircraftDropdown';
export default AircraftDropdown;
