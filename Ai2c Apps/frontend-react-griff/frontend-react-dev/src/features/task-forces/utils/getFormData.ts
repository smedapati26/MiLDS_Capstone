import dayjs from 'dayjs';

import { CreateTaskForceSchemaType } from '@features/task-forces/components/create-stepper';
import { SubordinateSchemaType } from '@features/task-forces/components/create-stepper/step 2/schema';
import { EditUnitsSchemaType } from '@features/task-forces/components/edit-pages/unit/schema';
import { getSerialNumbers } from '@features/task-forces/utils/getSerialNumbers';
import { DateRangeSchemaType, LocationSchemaType } from '@models/react-hook-form';
import { QUERY_DATE_FORMAT } from '@utils/constants';

import { ITaskforceBaseDto, mapToISubordinateDto, TOP_LEVEL } from '@store/griffin_api/taskforce/models/ITaskforce';
import {
  ITaskforceUpdateEquipmentSubordinateDto,
  ITaskforceUpdateUnitSubordinateDto,
  mapToITaskforceUpdateEquipmentSubordinateDto,
  mapToITaskforceUpdateUnitSubordinateDto,
} from '@store/griffin_api/taskforce/models/ITaskforceUpdate';

import { EditEquipmentSchemaType } from '../components/edit-pages/equipment/schema';

export const getFormData = (formValues: CreateTaskForceSchemaType) => {
  const { startDate, endDate } = formValues.tfDateRange as DateRangeSchemaType;
  const location = formValues.location as LocationSchemaType;
  const subordinates = formValues.subordinates;

  // Recursive helper function to build subordinates tree
  const buildSubordinateTree = (
    subordinate: SubordinateSchemaType,
    allSubs: SubordinateSchemaType[],
  ): ITaskforceBaseDto => {
    const dto = mapToISubordinateDto(subordinate);

    const children = allSubs.filter((s) => s.parentId === subordinate.uuid);

    return {
      ...dto,
      subordinates: children.map((child) => buildSubordinateTree(child, allSubs)),
    };
  };

  const subordinatesTree = subordinates
    .filter((sub: SubordinateSchemaType) => sub.parentId === TOP_LEVEL)
    .map((root: SubordinateSchemaType) => buildSubordinateTree(root, subordinates));

  // FormData for multipart form
  const formData = new FormData();
  formData.append('tf_name', formValues.name);
  formData.append('short_name', formValues.shortname);
  formData.append('nick_name', formValues.nickname ?? '');
  formData.append('echelon', formValues.echelon);
  formData.append('owner_user_id', formValues.ownerId);
  formData.append('slogan', formValues.slogan ?? '');
  formData.append('tf_start_date', dayjs(startDate).format(QUERY_DATE_FORMAT));
  formData.append('tf_end_date', dayjs(endDate).format(QUERY_DATE_FORMAT));
  formData.append('location_id', String(location.id) ?? '');
  formData.append('aircraft', getSerialNumbers(formValues.aircraft).join(','));
  formData.append('uas', getSerialNumbers(formValues.uas).join(','));
  formData.append('agse', getSerialNumbers(formValues.agse).join(','));
  formData.append('subordinates', JSON.stringify(subordinatesTree));
  formData.append('logo', formValues.logo);

  return formData;
};

export const getUnitFormData = (formValues: EditUnitsSchemaType) => {
  const { startDate, endDate } = formValues.tfDateRange as DateRangeSchemaType;
  const location = formValues.location as LocationSchemaType;
  const subordinates = formValues.subordinates;

  // Recursive helper function to build subordinates tree
  const buildSubordinateTree = (
    subordinate: SubordinateSchemaType,
    allSubs: SubordinateSchemaType[],
  ): ITaskforceUpdateUnitSubordinateDto => {
    const dto = mapToITaskforceUpdateUnitSubordinateDto(subordinate);
    const children = allSubs.filter((s) => s.parentId === subordinate.uuid);

    return {
      ...dto,
      subordinates: children.map((child) => buildSubordinateTree(child, allSubs)),
    };
  };

  const subordinatesTree = subordinates
    .filter((sub: SubordinateSchemaType) => sub.parentId === TOP_LEVEL)
    .map((root: SubordinateSchemaType) => buildSubordinateTree(root, subordinates));

  // FormData for multipart form
  const formData = new FormData();
  formData.append('uic', formValues.uic);
  formData.append('tf_name', formValues.name);
  formData.append('short_name', formValues.shortname);
  formData.append('nick_name', formValues.nickname ?? '');
  formData.append('echelon', formValues.echelon);
  formData.append('owner_user_id', formValues.ownerId);
  formData.append('slogan', formValues.slogan ?? '');
  formData.append('tf_start_date', dayjs(startDate).format(QUERY_DATE_FORMAT));
  formData.append('tf_end_date', dayjs(endDate).format(QUERY_DATE_FORMAT));
  formData.append('location_id', String(location.id) ?? '');
  formData.append('subordinates', JSON.stringify(subordinatesTree));
  formData.append('logo', formValues.logo);

  return formData;
};

export const getEquipmentFormData = (formValues: EditEquipmentSchemaType) => {
  const subordinates = formValues.subordinates;

  // Recursive helper function to build subordinates tree
  const buildSubordinateTree = (
    subordinate: SubordinateSchemaType,
    allSubs: SubordinateSchemaType[],
  ): ITaskforceUpdateEquipmentSubordinateDto => {
    const dto = mapToITaskforceUpdateEquipmentSubordinateDto(subordinate);
    const children = allSubs.filter((s) => s.parentId === subordinate.uuid);

    return {
      ...dto,
      subordinates: children.map((child) => buildSubordinateTree(child, allSubs)),
    };
  };

  const subordinatesTree = subordinates
    .filter((sub: SubordinateSchemaType) => sub.parentId === TOP_LEVEL)
    .map((root: SubordinateSchemaType) => buildSubordinateTree(root, subordinates));

  // FormData for multipart form
  const formData = new FormData();
  formData.append('uic', formValues.uic);
  formData.append('tf_name', formValues.name);
  formData.append('aircraft', getSerialNumbers(formValues.aircraft).join(','));
  formData.append('uas', getSerialNumbers(formValues.uas).join(','));
  formData.append('agse', getSerialNumbers(formValues.agse).join(','));
  formData.append('subordinates', JSON.stringify(subordinatesTree));

  return formData;
};
