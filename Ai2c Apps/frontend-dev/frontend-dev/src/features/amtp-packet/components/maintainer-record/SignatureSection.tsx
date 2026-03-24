import React from 'react';

import { Card, CardContent, Checkbox, FormControlLabel, Grid, Typography, useTheme } from '@mui/material';

import { useAppSelector } from '@store/hooks';

type SignatureState = {
  signatureOne: boolean;
  signatureTwo: boolean;
};

type SignatureSectionProps = {
  signature: SignatureState;
  setSignature: React.Dispatch<React.SetStateAction<SignatureState>>;
  isPartySignature?: boolean;
};

const SignatureSection = ({ signature, setSignature, isPartySignature = true }: SignatureSectionProps) => {
  const theme = useTheme();
  const appUser = useAppSelector((state) => state.appSettings.appUser);
  const maintainer = useAppSelector((state) => state.amtpPacket.maintainer);

  return (
    <Card
      sx={{
        mt: 3,
        p: 3,
        borderWidth: 0,
        backgroundColor: theme.palette.mode === 'dark' ? '#2E2E2E' : '#F2F2F2',
      }}
    >
      <CardContent>
        <Typography variant="h6">Confirmation*</Typography>
        <Typography sx={{ fontWeight: '400 !important' }}>
          {isPartySignature ? 'Signature needed from both parties' : 'Recorder signature required.'}
        </Typography>
        <Grid container spacing={3} mt={2}>
          <Grid size={{ xs: 6 }}>
            <FormControlLabel
              sx={{ ml: 0 }}
              control={
                <Checkbox
                  aria-label={`${appUser?.rank} ${appUser?.firstName} ${appUser?.lastName}`}
                  checked={signature.signatureOne}
                  onChange={(e) => setSignature((prev) => ({ ...prev, signatureOne: e.target.checked }))}
                />
              }
              label={`${appUser?.rank} ${appUser?.firstName} ${appUser?.lastName}`}
            />
          </Grid>
          {isPartySignature && (
            <Grid size={{ xs: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={signature.signatureTwo}
                    onChange={(e) => setSignature((prev) => ({ ...prev, signatureTwo: e.target.checked }))}
                  />
                }
                label={`${maintainer?.name ?? 'N/A'}`}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SignatureSection;
