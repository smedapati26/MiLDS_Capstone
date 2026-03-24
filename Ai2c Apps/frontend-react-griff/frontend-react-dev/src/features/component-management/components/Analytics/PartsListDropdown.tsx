import PmxMultiSelect from '@components/PmxMultiSelect';

import { useGetComponentPartListQuery } from '@store/griffin_api/components/slices/componentsApi';
import { useAppSelector } from '@store/hooks';

interface PartsListDropdownProps {
  values: string[];
  handleSelect: (val: string[]) => void;
  multiSelect?: boolean;
}

const PartsListDropdown = ({ values, handleSelect, multiSelect = false }: PartsListDropdownProps) => {
  const globalSelectedUnit = useAppSelector((state) => state.appSettings.currentUnit);
  const {
    data: partList = [],
    isLoading,
    isFetching,
  } = useGetComponentPartListQuery({ uic: globalSelectedUnit.uic }, { skip: false });
  const partNumbers = partList?.map((part) => part.part_number) || [];

  const onChangeHandler = (newValues: string[]) => {
    const value = multiSelect ? newValues : newValues.slice(-1);
    handleSelect(value);
  };

  return (
    <PmxMultiSelect
      label="Part Number"
      values={values}
      options={partNumbers}
      loading={isLoading || isFetching}
      onChange={onChangeHandler}
      data-testid="part-numbers-select"
      aria-label="parts-label"
      maxSelections={multiSelect ? undefined : 1}
    />
  );
};

export default PartsListDropdown;
