import React from 'react';

import { Stack, Typography } from '@mui/material';

import { IAircraftBankPercentage } from '@store/griffin_api/aircraft/models/IAircraft';

interface BankTimeTableProps {
  data: IAircraftBankPercentage[];
}

/**
 * Table seen in Bank Time component
 * @param {IAircraftBankPercentage[]} data - to show table for
 * @returns
 */

const BankTimeTable: React.FC<BankTimeTableProps> = ({ data }: BankTimeTableProps): React.ReactElement => {
  return (
    <Stack sx={{ mb: 1 }} data-testid="bank-time-table">
      {data.map((value, index) => (
        <Stack
          sx={{
            pt: 3,
            pb: 3,
            borderTop: index === 0 ? 'none' : '1px solid gray',
          }}
          key={value.key}
          direction="row"
          justifyContent="space-between"
          data-testid="bank-time-table-row"
        >
          <Typography variant="body2">{value.key}</Typography>
          <Typography variant="body2">{Number(value.bankPercentage * 100).toFixed(0)}%</Typography>
        </Stack>
      ))}
    </Stack>
  );
};

export default BankTimeTable;
