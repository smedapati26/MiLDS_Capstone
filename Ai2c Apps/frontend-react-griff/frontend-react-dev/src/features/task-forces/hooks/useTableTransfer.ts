import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { IUserEquipments } from '@store/griffin_api/taskforce/models/IUserEquipment';

import { EquipmentSchemaType, SubordinateSchemaType } from '../components/create-stepper/step 2/schema';

export const useTableTransfer = (data: IUserEquipments | undefined, type: 'aircraft' | 'uas' | 'agse') => {
  // State
  const [leftData, setLeftData] = useState<EquipmentSchemaType[]>([]);
  const [rightData, setRightData] = useState<EquipmentSchemaType[]>([]);

  // React Hook form
  const { setValue, getValues } = useFormContext();
  const taskforceName: string = getValues('name');
  const subordinates: SubordinateSchemaType[] = getValues('subordinates');

  // Right Table variable used for filtering & setting form values
  const [selectedSubordinate, setSelectedSubordinate] = useState<string>(taskforceName);

  useEffect(() => {
    // handles situation where TF Name is set after selectedSubordinate is set
    if (selectedSubordinate == '' && taskforceName != '') {
      setSelectedSubordinate(taskforceName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskforceName]);

  // Memo'ed data & cross referencing equipment Admin rights
  const tableData = useMemo(() => (data ? data[type].map((row) => ({ ...row, isAdmin: true })) : []), [data, type]);

  // Handles transfer of equipment from left to right column & sets form data
  // Sets all uas and subordinate uas
  const handleOnTransfer = (left: EquipmentSchemaType[], right: EquipmentSchemaType[]) => {
    // Set data locally
    setLeftData(left);
    setRightData(right);

    const selectedEquipment = [
      ...new Set(
        right.map((equipment) => ({
          serial: equipment.serial,
          model: equipment.model,
          unit: equipment.unit,
          status: equipment.status,
          isAdmin: equipment.isAdmin,
        })),
      ),
    ];

    if (selectedSubordinate == taskforceName) {
      // Set dedupe and manually mark this change as dirty
      setValue(type, selectedEquipment, { shouldDirty: true });
    } else {
      // Mapping equipment to subordinate index
      const newSubordinates = subordinates.map((subordinate) => {
        if (selectedSubordinate == subordinate.name) {
          subordinate[type] = [...selectedEquipment];
        }

        return subordinate;
      });

      // Updating subordinates data and manually marking as dirty
      setValue('subordinates', newSubordinates, { shouldDirty: true });
    }
  };

  // Setting table data from previously selected values
  // Complex Right/Left data required because of subordinate dropdown select
  useEffect(() => {
    const taskforceEquipment = getValues(type) ?? [];
    const subordinate = subordinates.find((sub) => sub.name === selectedSubordinate);
    const subordinateEquipment = subordinate && subordinate[type] ? subordinate[type] : [];

    // Build lookup sets for fast O(1) membership checks
    const prevSnSet = new Set(taskforceEquipment.map((a: { serial: string }) => a.serial));
    const subSnSet = new Set(subordinateEquipment.map((a) => a.serial));

    const mapEquipment = (equipment: EquipmentSchemaType) => ({
      ...equipment,
      serial: equipment.serial,
      unit: equipment.unit,
    });

    // LEFT DATA: tableData minus anything in either list
    const newLeftData = tableData.filter((row) => !prevSnSet.has(row.serial) && !subSnSet.has(row.serial));

    // RIGHT DATA: mapped equipment from both lists
    const newRightData =
      selectedSubordinate == taskforceName
        ? [...taskforceEquipment.map(mapEquipment)]
        : [...subordinateEquipment.map(mapEquipment)];

    setLeftData(newLeftData);
    setRightData(newRightData);
  }, [tableData, subordinates, taskforceName, selectedSubordinate, getValues, type]);

  return {
    tableData,
    rightData,
    leftData,
    handleOnTransfer,
    selectedSubordinate,
    setSelectedSubordinate,
  };
};
