import React, { useState } from 'react';

import InfoIcon from '@mui/icons-material/Info';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  FormControlLabel,
  Popover,
  Stack,
  Switch,
  Typography,
} from '@mui/material';

import ActionPatterns from '@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/ActionPatterns';
import PhaseFlowActionContent from '@features/maintenance-schedule/components/PhaseFlow/Visuals/Action/PhaseFlowActionContent';

const PhaseFlowActions: React.FC = (): JSX.Element => {
  const [manualOrder, setManualOrder] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleManualCheck = (): void => {
    setManualOrder(!manualOrder);
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <Card
      data-testid="phase-flow-action"
      sx={{
        border: 'none',
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
      }}
    >
      <CardContent sx={{ height: '100%' }}>
        <Stack sx={{ height: '100%' }}>
          <Stack>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              Actions
              <Typography
                data-testid="action-popover-target"
                aria-owns={open ? 'mouse-over-popover' : undefined}
                fontSize="inherit"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              >
                <InfoIcon fontSize="inherit" sx={{ ml: 3, cursor: 'pointer' }} />
              </Typography>
              <Popover
                data-testid="action-popover"
                open={open}
                id="mouse-over-popover"
                sx={{
                  pointerEvents: 'none',
                  mt: -2,
                }}
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'center',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
              >
                <Box
                  sx={{
                    height: '98px',
                    width: '163px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography data-testid="action-popover-content" sx={{ p: 3 }}>
                    Manual order must be on change phase order in the graph.
                  </Typography>
                </Box>
              </Popover>
            </Typography>

            <FormControlLabel
              data-testid="action-manual-order-control"
              control={<Switch checked={manualOrder} onChange={handleManualCheck} />}
              label="Manual Order"
              disabled
            />
            <Button data-testid="action-alternate-co-button" variant="outlined" disabled>
              Alternate CO
            </Button>
            <ActionPatterns />
          </Stack>
          <Box sx={{ position: 'relative', height: '100%' }}>
            <Box sx={{ position: 'absolute', inset: 0, overflow: 'auto' }}>
              <PhaseFlowActionContent />
            </Box>
          </Box>
        </Stack>
      </CardContent>
      <CardActions sx={{ mb: 1 }}>
        <Button data-testid="action-save-button" variant="contained" sx={{ width: '100%' }} disabled>
          Save
        </Button>
      </CardActions>
    </Card>
  );
};

export default PhaseFlowActions;
