import { Box } from '@mui/material';

import { generateUniqueId } from '@utils/helpers/generateID-map-keys';

interface LegendProps {
  label: string;
  color: string;
}

const GraphLegendTemplate = ({ series }: { series: LegendProps[] }) => {
  return (
    <Box component={'div'} display={'flex'} flexWrap={'wrap'} gap={4}>
      {series.map((item) => (
        <Box key={generateUniqueId()} display={'flex'} alignItems={'center'} gap={3}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: item.color,
              borderRadius: 10,
            }}
          />
          <Box>{item.label}</Box>
        </Box>
      ))}
    </Box>
  );
};

export default GraphLegendTemplate;
