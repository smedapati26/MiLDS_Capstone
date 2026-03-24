import { Dispatch, SetStateAction, useMemo } from 'react';

import { Box } from '@mui/material';

import { Column } from '@ai2c/pmx-mui';

import { PmxDropdown } from '@components/dropdowns';
import PmxSearch from '@components/PmxSearch';
import { useGetAllMOSQuery } from '@store/amap_ai/mos_code';
import {
  handleCopy,
  handleExportCsv,
  handleExportExcel,
  handleExportPdf,
  handlePrint,
} from '@utils/helpers/table-funcs';

import ExportMenu from './ExportMenu';
import FilterMenu, { SoldierFlagFilterMenuProps } from './FilterMenu';

const AmtpTableFilters = <T extends object>({
  query,
  selectedMOS,
  exportData,
  fileTitle,
  setSelectedMOS,
  setQuery,
  columns,
  filterType,
  setFilterSwitch,
}: {
  exportData: T[];
  query: string;
  selectedMOS: { label: string; value: string }[];
  fileTitle: string;
  columns: Column<T>[];
  setSelectedMOS: (values: { label: string; value: string }[]) => void;
  setQuery: (val: string) => void;
  filterType: 'ctl' | 'maintainer' | 'supporting_documents' | 'counselings' | 'soldier_flags' | 'fault_records';
  setFilterSwitch: Dispatch<SetStateAction<boolean>>;
}) => {
  const { data: allMOS, isLoading: loadingMos } = useGetAllMOSQuery();
  const recorderFilterData: string[] = useMemo(() => {
    if (filterType === 'supporting_documents' || filterType === 'counselings') {
      const uploaderData = exportData as Array<T & { uploadedBy: string | null }>;
      return uploaderData.map((uploader) => uploader.uploadedBy).filter((uploader) => uploader !== null);
    }
    if (filterType === 'soldier_flags') {
      const uploaderData = exportData as Array<T & { createdByName: string | null }>;
      return uploaderData.map((uploader) => uploader.createdByName).filter((uploader) => uploader !== null);
    }
    return [];
  }, [filterType, exportData]);

  const updatedByFilterData: string[] = useMemo(() => {
    if (filterType === 'soldier_flags') {
      const updatedByData = exportData as Array<T & { lastModifiedName: string | null }>;
      return updatedByData.map((recorder) => recorder.lastModifiedName).filter((recorder) => recorder !== null);
    }
    return [];
  }, [filterType, exportData]);

  const soldierFlagFilterData: SoldierFlagFilterMenuProps = useMemo(() => {
    if (filterType === 'soldier_flags') {
      const flagData = exportData as Array<
        T & { flagType: string | null; flagInfo: string | null; mxAvailability: string }
      >;
      const flagTypes = flagData.map((flag) => flag.flagType).filter((flagType) => flagType !== null);
      const flagInfos = flagData.map((flag) => flag.flagInfo).filter((flagInfo) => flagInfo !== null);
      const flagMXs = flagData.map((flag) => flag.mxAvailability).filter((mxAvailability) => mxAvailability !== null);

      return { flagTypes: flagTypes, flagInformation: flagInfos, flagMXAvailability: flagMXs };
    }
    return { flagTypes: [], flagInformation: [], flagMXAvailability: [] };
  }, [filterType, exportData]);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <FilterMenu
        {...(filterType && { filterType })}
        setFilterSwitch={setFilterSwitch}
        updatedByFilterData={updatedByFilterData}
        recorderFilterData={recorderFilterData}
        soldierFlagData={soldierFlagFilterData}
      />
      {filterType !== 'supporting_documents' &&
        filterType !== 'counselings' &&
        filterType !== 'soldier_flags' &&
        filterType !== 'fault_records' && (
          <PmxDropdown
            multiple
            options={allMOS?.map((x: { mos: string }) => x.mos) ?? []}
            value={selectedMOS?.map((item) => item.value) ?? []}
            label="MOS"
            onChange={(value: string | string[]) => {
              if (Array.isArray(value)) {
                const selectedOptions = value.map((val) => ({ label: val, value: val }));
                setSelectedMOS(selectedOptions);
              }
            }}
            loading={loadingMos}
            containerSx={{ width: 186 }}
          />
        )}
      <PmxSearch value={query} onChange={(e) => setQuery(e.target.value)} />
      <ExportMenu
        handleCsv={() => handleExportCsv(exportData, fileTitle)}
        handleExcel={() => handleExportExcel(columns, exportData, fileTitle)}
        handlePdf={() => handleExportPdf(columns, exportData, fileTitle)}
        handleCopy={() => handleCopy(columns, exportData)}
        handlePrint={() => handlePrint(columns, exportData, fileTitle)}
      />
    </Box>
  );
};

export default AmtpTableFilters;
