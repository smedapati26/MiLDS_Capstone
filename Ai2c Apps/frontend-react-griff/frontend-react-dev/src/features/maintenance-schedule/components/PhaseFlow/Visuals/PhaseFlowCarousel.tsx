import React from 'react';

import { Box, Skeleton } from '@mui/material';

import PmxCarousel from '@components/PmxCarousel';
import PhaseFlowBarChart from '@features/maintenance-schedule/components/PhaseFlow/Visuals/PhaseFlowBarChart';
import { generateUniqueId } from '@utils/helpers/generateID-map-keys';

import {
  IAircraftCompany,
  IAircraftPhaseFlow,
  IAircraftPhaseFlowModels,
  IAircraftPhaseFlowSubordinates,
} from '@store/griffin_api/aircraft/models/IAircraft';

interface PhaseFlowCarouselProps {
  data: IAircraftPhaseFlowModels[] | IAircraftPhaseFlowSubordinates[];
  companyInfo: IAircraftCompany[] | undefined;
  isLoading: boolean;
}

const PhaseFlowCarousel: React.FC<PhaseFlowCarouselProps> = ({ data, companyInfo, isLoading }): JSX.Element => {
  return (
    <Box data-testid={`carousel-pf-lower-visual`} sx={{ m: [3, 0, 3, 0], height: '100%' }}>
      {isLoading ? (
        <Skeleton data-testid="carousel-pf-chart-loading" variant="rectangular" animation="wave" />
      ) : (
        <PmxCarousel maxVisible={3} style={{ border: 'none', height: '100%' }}>
          {data?.map((item) => {
            const filteredCompanyInfo =
              'model' in item ? companyInfo : companyInfo?.filter((comp) => comp.uic === item.uic);
            const title = 'model' in item ? item.model : item.shortName;
            return (
              <Box key={`carousel-bar-chart-${title}-${generateUniqueId()}`} sx={{ height: '100%' }}>
                <PhaseFlowBarChart
                  data={item.aircraft as IAircraftPhaseFlow[]}
                  companyInfo={filteredCompanyInfo}
                  title={title}
                  isMain={false}
                />
              </Box>
            );
          })}
        </PmxCarousel>
      )}
    </Box>
  );
};

export default PhaseFlowCarousel;
