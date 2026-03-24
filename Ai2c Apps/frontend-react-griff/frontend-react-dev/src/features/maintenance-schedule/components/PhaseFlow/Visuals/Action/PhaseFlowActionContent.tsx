import React, { useEffect, useMemo } from 'react';

import { Box, Checkbox, FormControlLabel, FormGroup, Stack, Typography } from '@mui/material';
import { skipToken } from '@reduxjs/toolkit/query';

import { usePhaseFlowContext } from '@features/maintenance-schedule/components/PhaseFlow/PhaseFlowContext';
import { generateUniqueId } from '@utils/helpers/generateID-map-keys';

import { useGetAircraftCompanyQuery } from '@store/griffin_api/aircraft/slices';
import { useAppSelector } from '@store/hooks';

const PhaseFlowActionContent: React.FC = (): JSX.Element => {
  const { companyOption, initializeCompany, selectedModels, toggleCompanyOption } = usePhaseFlowContext();
  const uic = useAppSelector((state) => state.appSettings.currentUic);
  const emptyModels = selectedModels.length <= 0;

  const { data: fetchedCompanyData } = useGetAircraftCompanyQuery(emptyModels ? skipToken : [uic, [], selectedModels]);

  const companyData = useMemo(() => {
    return emptyModels ? [] : fetchedCompanyData;
  }, [emptyModels, fetchedCompanyData]);

  useEffect(() => {
    initializeCompany(companyData?.map((item) => item.uic));
  }, [companyData, initializeCompany]);

  return (
    <FormGroup sx={{ mb: 6 }} data-testid="action-company-list">
      {companyData?.map((item) => {
        const opt = companyOption?.find((o) => o.uic === item.uic);
        if (!opt) return null;

        return (
          <FormControlLabel
            sx={{ ml: 0 }}
            key={`${item.uic}-${generateUniqueId()}`}
            control={<Checkbox checked={opt.selected} onChange={() => toggleCompanyOption(opt.uic)} />}
            label={
              <Stack direction="row" alignItems="center">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    bgcolor: opt.color,
                    borderRadius: '50%',
                    mr: 2,
                    ml: 2,
                  }}
                />
                <Typography>{item.shortName}</Typography>
              </Stack>
            }
          />
        );
      })}
    </FormGroup>
  );
};

export default PhaseFlowActionContent;
