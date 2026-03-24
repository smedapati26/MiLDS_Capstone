import { useEffect, useState } from 'react';

import { EquipmentSchemaType } from '../components/create-stepper/step 2/schema';

export const useTransferTableFilters = (data: EquipmentSchemaType[], leftData: EquipmentSchemaType[]) => {
  // State
  const [selectedUnit, setSelectedUnit] = useState<string | null>();
  const [selectedModel, setSelectedModel] = useState<string | null>();
  const [unitOptions, setUnitOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);

  // Model Options - Mapping data for model options
  useEffect(() => {
    const options = [...new Set(data.map(({ model }) => model))];
    setModelOptions(options as string[]);
  }, [data]);

  // Model Options - Mapping data for model options
  useEffect(() => {
    const options = [...new Set(data.map(({ unit }) => unit))];
    setUnitOptions(options as string[]);
  }, [data]);

  // Left table data filtered by aircraft model
  const filteredData = leftData.filter((row) => {
    const modelMatches = !selectedModel ? row : row.model === selectedModel;
    const unitMatches = !selectedUnit ? row : row.unit === selectedUnit;
    return modelMatches && unitMatches;
  });

  // Return values
  return {
    unitOptions,
    selectedUnit,
    setSelectedUnit,
    modelOptions,
    selectedModel,
    setSelectedModel,
    filteredData,
  };
};
