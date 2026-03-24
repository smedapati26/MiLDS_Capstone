import { Box, Button, CircularProgress } from '@mui/material';

import PmxSearch from '@components/PmxSearch';
import PmxToggleBtnGroup from '@components/PmxToggleBtnGroup';

export type SoldierTypes = 'all_soldiers' | 'all_maintainers' | 'amtp_maintainers' | undefined;
const SoldierManagerFilters = ({
  query,
  setQuery,
  soldierType,
  setSoldierType,
  filtersDisabled,
  showTransfer = false,
  transferFromGroup,
  handleTransfer,
  isSubmitting,
  submitDisabled,
}: {
  query: string | undefined;
  setQuery: (val: string) => void;
  soldierType: SoldierTypes;
  setSoldierType: (val: SoldierTypes) => void;
  filtersDisabled: boolean;
  showTransfer: boolean;
  transferFromGroup: string;
  handleTransfer: () => void;
  isSubmitting: boolean;
  submitDisabled: boolean;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        width: '100%',
      }}
    >
      <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          {!showTransfer && (
            <PmxToggleBtnGroup
              hasSpacing
              hasIcons
              buttons={[
                { label: 'AMTP Maintainers', value: 'amtp_maintainers', disabled: filtersDisabled },
                {
                  label: 'All Maintainers',
                  value: 'all_maintainers',
                  disabled: filtersDisabled,
                },
                { label: 'All Soldiers', value: 'all_soldiers', disabled: filtersDisabled },
              ]}
              selected={soldierType as string}
              onChange={(value) => {
                setSoldierType(value as SoldierTypes);
              }}
            />
          )}

          {showTransfer && (
            <Button
              variant="contained"
              onClick={handleTransfer}
              {...(isSubmitting && {
                startIcon: (
                  <CircularProgress sx={{ height: '18px !important', width: '18px !important' }} color="inherit" />
                ),
              })}
              disabled={isSubmitting || submitDisabled}
            >
              {transferFromGroup !== 'self' && transferFromGroup !== 'TRANSIENT'
                ? 'Request Soldiers Transfer'
                : 'Transfer Soldiers'}
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <PmxSearch value={query ?? ''} onChange={(e) => setQuery(e.target.value)} />
      </Box>
    </Box>
  );
};

export default SoldierManagerFilters;
