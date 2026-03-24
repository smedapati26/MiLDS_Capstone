import React, { useState } from 'react';
import dayjs from 'dayjs';

import { Link, Skeleton, Typography } from '@mui/material';

import { ColumnConfig, PmxTable, PmxTableWrapper } from '@components/data-tables';
import SearchBar from '@components/inputs/PmxSearchBar';
import AcdUploadStatusChip from '@features/equipment-manager/components/AcdUploadStatusChip';

import { AcdUploadStatus, IAcdHistoryOut } from '@store/griffin_api/auto_dsr/models';
import { useDownloadAcdFileMutation, useGetAcdUploadHistoryQuery } from '@store/griffin_api/auto_dsr/slices';
import { useAppSelector } from '@store/hooks';
import { selectCurrentUic } from '@store/slices';

/**
 * Show the history for a user
 * @returns React.ReactNode
 */
const AcdHistory: React.FC = (): React.ReactNode => {
  const currentUic = useAppSelector(selectCurrentUic);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { data, isLoading } = useGetAcdUploadHistoryQuery({ uic: currentUic, search: searchQuery || undefined });
  const [triggerDownload] = useDownloadAcdFileMutation();

  const filteredData = data?.items.filter((item) => item.status !== 'Cancelled' && item.status !== 'Transmitting');

  const handleDownload = async (row: IAcdHistoryOut) => {
    try {
      await triggerDownload({ id: row?.id as number, fileName: row.fileName }).unwrap();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const columns: Array<ColumnConfig<IAcdHistoryOut>> = [
    {
      key: 'fileName',
      label: 'File',
      sortable: true,
      render: (_value, row) =>
        row?.fileName ? (
          <Link
            component="button"
            variant="body1"
            onClick={(e) => {
              e.preventDefault();
              handleDownload(row as IAcdHistoryOut);
            }}
          >
            {row?.fileName}
          </Link>
        ) : (
          '--'
        ),
    },
    {
      key: 'user',
      label: 'Uploaded By',
      sortable: true,
      render: (_value, row) => {
        return row?.user ? (
          <Typography variant="body1">{`${row.user.firstName} ${row.user.lastName}`}</Typography>
        ) : (
          '--'
        );
      },
    },
    {
      key: 'uploadedAt',
      label: 'Upload Date',
      sortable: true,
      render: (_value, row) => (row?.uploadedAt ? dayjs(row.uploadedAt).format('MM/DD/YYYY') : '--'),
    },
    {
      key: 'status',
      label: 'Upload Status',
      render: (_value, row) => (
        <AcdUploadStatusChip status={row?.status as AcdUploadStatus} succeeded={row?.succeeded as boolean} />
      ),
    },
  ];

  if (isLoading) return <Skeleton data-testid={'loading-acd-history'} variant="rectangular" />;

  return (
    <PmxTableWrapper
      leftControls={<Typography variant="body1">All ACDs uploaded for the global unit are listed below</Typography>}
      rightControls={
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search..."
          debounceMs={500}
          sx={{ minWidth: '200px' }}
        />
      }
      table={<PmxTable paginate columns={columns} rows={filteredData as IAcdHistoryOut[]} isLoading={isLoading} />}
    />
  );
};

export default AcdHistory;
