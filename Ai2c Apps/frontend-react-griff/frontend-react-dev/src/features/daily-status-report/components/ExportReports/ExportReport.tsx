import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { FormProvider, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import IosShareIcon from '@mui/icons-material/IosShare';
import { Divider, Link, SnackbarCloseReason, Stack, Typography } from '@mui/material';

import PmxSnackbar from '@components/feedback/PmxSnackbar';
import {
  RHFAutocomplete,
  RHFDatePicker,
  RHFMultipleCheckboxGroup,
  RHFToggleButtonGroup,
} from '@components/react-hook-form';
import { PmxFormPopover } from '@components/utils/PmxFormPopover';
import { useFilterOptions } from '@hooks/useFilterOptions';
import { QUERY_DATE_FORMAT } from '@utils/constants';
import { downloadFileExport } from '@utils/helpers/downloadFileExport';

import { IAutoDsr } from '@store/griffin_api/auto_dsr/models';
import { useGetAutoDsrQuery } from '@store/griffin_api/auto_dsr/slices';
import { IInspectionOption } from '@store/griffin_api/inspections/models/IInspectionOption';
import { useGetInspectionOptionsForUnitQuery } from '@store/griffin_api/inspections/slices';
import { EXPORT_MIME_TYPE, EXPORT_TYPE } from '@store/griffin_api/reports/models/ExportTypeEnum';
import { IExtractedFile } from '@store/griffin_api/reports/models/IExtractedFile';
import { DsrExportConfig, useExportDsrPDFMutation, useLazyExportDsrCSVQuery } from '@store/griffin_api/reports/slices';
import { useAppSelector } from '@store/hooks';

import { useModifications } from '../EquipmentDetails/Aircraft/useModifications';
import { exportReportDefaultValues, ExportReportsSchema, ExportReportsSchemaType } from './schema';

/**
 * ExportReports
 * @description Exports DSR and Slant data
 * @returns React.FC
 */
const ExportReports: React.FC = () => {
  const currentUic = useAppSelector((state) => state.appSettings.currentUic);
  const startDate = dayjs().startOf('month').format(QUERY_DATE_FORMAT);
  const endDate = dayjs().endOf('month').format(QUERY_DATE_FORMAT);

  // Snackbar State
  const [open, setOpen] = useState(false);
  const [openError, setOpenError] = useState(false);
  const [message, setMessage] = useState('Reports exported');
  const [downloadedFiles, setDownloadedFiles] = useState<IExtractedFile[]>();

  // React Hook Form Methods
  const methods = useForm<ExportReportsSchemaType>({
    mode: 'all', // Validation Mode All = On Blur, On Change, On Submit
    resolver: zodResolver(ExportReportsSchema), // Zod resolver for validations
    defaultValues: exportReportDefaultValues, // Default values
  });

  // Watch for Export Type and Unit from form schema state
  const exportType = methods.watch('type');
  const selectedUnit = methods.watch('unit');
  const selectedModels = methods.watch('models');

  // Default page values on exportType change
  useEffect(() => {
    if (exportType === EXPORT_TYPE.CSV) {
      methods.setValue('pages', ['all', 'summary', 'details']); // Default selected all
    } else {
      methods.setValue('pages', []); // Clear filters on type change
    }
  }, [exportType, methods]);

  // Api Calls for filter form options
  const { data } = useGetAutoDsrQuery({ uic: currentUic, startDate, endDate }, { skip: !currentUic });
  const { data: inspectionData } = useGetInspectionOptionsForUnitQuery({
    uic: selectedUnit || currentUic,
    models: selectedModels,
  });

  // Use memos to calculate and filter options
  const tableData = useMemo(() => {
    let tableData = data?.data ? data.data : [];
    // TODO: Double check this logic, should it be owning or current or both? (This is where it filters out data from higher echelon/siblings if a lower echelon unit is selected on filter)
    if (selectedUnit) {
      tableData = tableData.filter(
        (row: IAutoDsr) => row.owningUnitUic === selectedUnit || row.currentUnitUic === selectedUnit,
      );
    }
    return tableData;
  }, [data, selectedUnit]);

  // Form Options
  const unitOptions = useMemo(
    () => (data?.units ? data.units.map((unit) => ({ label: unit.name, value: unit.uic })) : []),
    [data],
  );

  const inspectionOptions = useMemo(() => {
    return Array.from(
      new Set(
        inspectionData?.map((inspection: IInspectionOption) => ({
          label: inspection.commonName,
          value: inspection.commonName,
        })),
      ),
    );
  }, [inspectionData]);

  const modelsOptions = useFilterOptions(tableData, 'model');
  const modificationOptions = useModifications(tableData);
  const pageOptions =
    exportType === EXPORT_TYPE.PDF
      ? [
          { label: 'Unit Slant', value: 'summary' },
          { label: 'FORSCOM', value: 'forscom' },
          { label: 'Unit Details', value: 'details' },
          { label: 'Phase Flow', value: 'phase' },
          { label: 'NRTL Summary', value: 'nrtl' },
        ]
      : [
          { label: 'Unit Slant', value: 'summary' },
          { label: 'Unit Details', value: 'details' },
        ];

  // Export API Calls
  const [exportDsrPdf, { isError: pdfError }] = useExportDsrPDFMutation();
  const [exportDsrCSV, { isError: cvsError }] = useLazyExportDsrCSVQuery();

  // On download error display Error Snackbar
  useEffect(() => {
    if (pdfError || cvsError) {
      setOpenError(true);
    }
  }, [pdfError, cvsError]);

  // Clear RHF values
  const handleOnClearFilters = () => {
    methods.reset();
  };

  // ON Submit
  const handelOnSubmit = async () => {
    const values = methods.getValues();
    const unitUic = values.unit ? values.unit : currentUic;

    if (exportType === 'PDF') {
      // APi POST Body
      const payload: DsrExportConfig = {
        uic: unitUic,
        pages: values.pages.filter((option) => option !== 'all'),
        mods: values.modifications,
        insp: values.inspections,
        models: values.models,
        history_date: values.asOfDate && dayjs(values.asOfDate).format(QUERY_DATE_FORMAT),
      };

      const blob = await exportDsrPdf(payload).unwrap();
      const file: IExtractedFile = {
        name: `${unitUic} - DSR Export - ${dayjs().format(QUERY_DATE_FORMAT)}`,
        content: blob,
        type: EXPORT_MIME_TYPE.PDF,
      };

      setMessage(`PDF report exported`);
      setDownloadedFiles([file]);
      setOpen(true);
    } else {
      // Export CSV'S for DSR & Slant
      const files = await exportDsrCSV(unitUic).unwrap();

      if (values.pages.length === 0 || values.pages.length > 1) {
        setDownloadedFiles(files);
      } else if (values.pages.includes('summary')) {
        setDownloadedFiles([files[0]]); // Slant
      } else {
        setDownloadedFiles([files[1]]); // DSR Details
      }

      setMessage(`CVS reports exported`);
      setOpen(true);
    }
  };

  // Handles onClose for Snackbar
  const handleClose = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    if (downloadedFiles) {
      downloadedFiles.forEach((file) => {
        downloadFileExport(file);
      });
    }
    setOpen(false);
  };

  // Handles onClose for Error Snackbar
  const handleCloseError = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    setOpenError(false);
  };

  // Render
  return (
    <>
      <PmxFormPopover
        title="Export Reports"
        openButtonIcon={<IosShareIcon />}
        openButtonText="Export Reports"
        onClose={handleOnClearFilters}
        onFormSubmit={handelOnSubmit}
        sx={{ float: 'right', marginTop: 2, marginRight: 3 }}
      >
        {/* Toggle Group Export type*/}
        <FormProvider {...methods}>
          <Stack direction="column" gap={3}>
            <RHFToggleButtonGroup field="type" label="Select export file type." options={Object.values(EXPORT_TYPE)} />
            {exportType === EXPORT_TYPE.PDF && (
              <>
                <Divider />
                <Typography variant="body1">Apply filters to you reports.</Typography>
                {/* Autocomplete for selecting units  */}
                <RHFAutocomplete field="unit" label="Units" options={unitOptions} />
                {/* Autocomplete for selecting models */}
                <RHFAutocomplete multiple field="models" label="Models" options={modelsOptions} />
                {/* Autocomplete for selecting modifications */}
                <RHFAutocomplete multiple field="modifications" label="Modifications" options={modificationOptions} />
                {/* Autocomplete for selecting inspections */}
                <RHFAutocomplete multiple field="inspections" label="Inspections" options={inspectionOptions} />
                {/* Date Picker for as of date */}
                <RHFDatePicker field="asOfDate" label="As of date" />
                <Divider />
              </>
            )}
            {/* Checkbox group for page options */}
            <RHFMultipleCheckboxGroup
              allSelectable
              field="pages"
              label="Select pages to report"
              options={pageOptions}
            />
          </Stack>
        </FormProvider>
      </PmxFormPopover>
      {/** Snackbar on Success */}
      <PmxSnackbar
        open={open}
        onClose={handleClose}
        message={message}
        action={
          <Link onClick={handleClose} sx={{ mr: 2 }}>
            View
          </Link>
        }
      />
      {/** On Download Error */}
      <PmxSnackbar
        open={openError}
        autoHideDuration={6000}
        onClose={handleCloseError}
        severity="error"
        variant="filled"
        isAlert
        message="Failed to download"
      />
    </>
  );
};

export default ExportReports;
