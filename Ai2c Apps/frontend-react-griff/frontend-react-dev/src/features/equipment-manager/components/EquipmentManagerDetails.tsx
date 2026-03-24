import React, { CSSProperties, useEffect, useState } from 'react';

import EditIcon from '@mui/icons-material/Edit';
import { Button, Stack, Typography } from '@mui/material';

import PmxTableAccordion, { AccordionVersion, Props as tableProps } from '@components/PmxTableAccordion';
import EquipmentManagerAccordionFilter from '@features/equipment-manager/components/EquipmentManagerAccordionFilter';

interface Props<T> extends tableProps<T> {
  title: string;
  rowCheck?: Record<string, boolean>;
  setRowCheck?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  sx?: CSSProperties;
  updatedRows: string[];
  accordionVersion?: AccordionVersion;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
}

/**
 * This is a wrapper to make the tables look like the equipment manager equipment details
 * @param {string} props.title - title of the table
 * @param {CSSProperties} props.sx - optional rapping stack css
 * @param {Record<string, boolean>} props.rowCheck - list to know which aircraft is selected
 * @param {React.Dispatch<React.SetStateAction<Record<string, boolean>>>;} props.setRowCheck - state setter function
 * @param {() => void} props.onEditClick - function for edit button clicking.
 * @param {string[]} props.updatedRows - keys of rows updated for coloring
 * @param {AccordionVersion} props.accordionVersion - different configuration of accordion tables
 * @param {string} props.searchValue - search value
 * @param {React.Dispatch<React.SetStateAction<string>>} props.setSearchValue - search value
 * @return React.ReactElement
 */

const EquipmentManagerDetails = <T extends object>(props: Props<T>): React.ReactElement => {
  const {
    title,
    isLoading,
    sx,
    columns,
    data,
    updatedRows,
    keyTitleMapping,
    rowKey,
    rowCheck,
    setRowCheck,
    onEditClick,
    accordionVersion = 'other',
    searchValue,
    setSearchValue,
  } = props;
  const [allAccordionOpen, setAllAccordionOpen] = useState<boolean>(false);
  const [initialized, setInitialized] = useState<boolean>(false);

  useEffect(() => {
    // Only initialize once when component mounts or data changes from empty to having data
    if (!setRowCheck || !data || Object.keys(data).length === 0) return;

    // Skip if already initialized
    if (initialized) return;

    const initialRowChecks: Record<string, boolean> = {};

    Object.keys(data).forEach((key) => {
      data[key].forEach((item) => {
        const rowKeyValue = item[rowKey as keyof T];
        if (typeof rowKeyValue === 'string') {
          initialRowChecks[rowKeyValue] = false;
        }
      });
    });

    // Only set if we have keys to initialize
    if (Object.keys(initialRowChecks).length > 0) {
      setRowCheck(initialRowChecks);
      setInitialized(true);
      setAllAccordionOpen(true);
    }
  }, [data, rowKey, setRowCheck, initialized]);

  const handleAllAccordionToggle = () => {
    setAllAccordionOpen(!allAccordionOpen);
  };

  return (
    <Stack spacing={3} sx={sx}>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body2">{title}</Typography>
        {accordionVersion === 'uas' && (
          <EquipmentManagerAccordionFilter
            handleToggle={handleAllAccordionToggle}
            toggle={allAccordionOpen}
            searchOptions={searchValue}
            onChange={setSearchValue}
          />
        )}
      </Stack>
      {accordionVersion !== 'uas' && onEditClick && (
        <Stack direction="row" justifyContent="space-between">
          <Button startIcon={<EditIcon />} variant="contained" onClick={() => onEditClick()}>
            Edit
          </Button>
          <EquipmentManagerAccordionFilter
            handleToggle={handleAllAccordionToggle}
            toggle={allAccordionOpen}
            searchOptions={searchValue}
            onChange={setSearchValue}
          />
        </Stack>
      )}
      <PmxTableAccordion
        isLoading={isLoading}
        columns={columns}
        data={data}
        keyTitleMapping={keyTitleMapping}
        checkBox={true}
        selectedRows={rowCheck}
        setSelectedRows={setRowCheck}
        rowKey={rowKey}
        isAllExpanded={allAccordionOpen}
        highLightedKeys={updatedRows}
        highlightColumnKey={rowKey}
        accordionVersion={accordionVersion}
        onEditClick={onEditClick}
        paginate
        perPage={25}
      />
    </Stack>
  );
};

export default EquipmentManagerDetails;
