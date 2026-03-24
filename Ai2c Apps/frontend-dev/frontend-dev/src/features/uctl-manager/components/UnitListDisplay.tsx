import { Box, List as MUIList, ListItem, ListItemText, Typography, useTheme } from '@mui/material';

import { OrgNode } from '@components/PmxOrgChart';

type Props = {
  grandparent: OrgNode;
  parent: OrgNode;
  selectedTableMOS: string[];
  tableSkillLevels: string[];
  selectedUnit: OrgNode | null;
  onSelect: (unit: OrgNode) => void;
};

const UnitListDisplay = ({
  grandparent,
  parent,
  selectedTableMOS,
  tableSkillLevels,
  selectedUnit,
  onSelect,
}: Props) => {
  const theme = useTheme();

  const units = [grandparent, parent, ...(parent.children ?? [])];

  const filteredUnits = units.filter((unit) => {
    const mosList = unit.metaData?.map((mos) => mos.name) ?? [];
    const skillLevels = unit.metaData?.flatMap((mos) => mos.children?.map((sl) => sl.name) ?? []) ?? [];

    const matchesMOS = selectedTableMOS.length === 0 || selectedTableMOS.some((mos) => mosList.includes(mos));
    const matchesSkillLevel = tableSkillLevels.length === 0 || tableSkillLevels.some((sl) => skillLevels.includes(sl));

    return matchesMOS && matchesSkillLevel;
  });

  return (
    <MUIList
      sx={{
        mt: 3,
        maxHeight: '500px',
        overflowY: 'auto',
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: `1px solid ${theme.palette.mode === 'light' ? theme.palette.grey.l40 : theme.palette.grey.d40}`,
      }}
    >
      {filteredUnits.map((unit) => {
        const mosList = unit.metaData?.map((mos) => mos.name) ?? [];

        const skillLevelsSet = new Set<string>();
        unit.metaData?.forEach((mos) => {
          mos.children?.forEach((sl) => {
            if (sl.name) skillLevelsSet.add(sl.name);
          });
        });

        const aggregatedSkillLevels = Array.from(skillLevelsSet).sort();
        const skillLevelText = aggregatedSkillLevels.length > 0 ? ` (${aggregatedSkillLevels.join(', ')})` : '';

        const isSelected = unit.id === selectedUnit?.id;

        return (
          <Box key={unit.id}>
            <ListItem
              alignItems="flex-start"
              disableGutters
              divider
              sx={{
                p: 3,
                cursor: 'pointer',
                bgcolor: isSelected ? theme.palette.primary.main : 'transparent',
                color: isSelected ? theme.palette.primary.contrastText : 'inherit',
                borderRadius: 2,
                '&:hover': {
                  bgcolor: isSelected ? theme.palette.primary.dark : theme.palette.action.hover,
                },
              }}
              onClick={() => onSelect(unit)}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" fontWeight="bold">
                    {unit.title}
                    {skillLevelText && (
                      <Typography
                        component="span"
                        variant="body2"
                        color={isSelected ? 'inherit' : 'text.secondary'}
                        sx={{ ml: 1 }}
                      >
                        {skillLevelText}
                      </Typography>
                    )}
                  </Typography>
                }
                secondary={
                  mosList.length > 0 && (
                    <Typography variant="body2" color={isSelected ? 'inherit' : 'text.secondary'}>
                      {mosList.join(', ')}
                    </Typography>
                  )
                }
              />
            </ListItem>
          </Box>
        );
      })}
    </MUIList>
  );
};

export default UnitListDisplay;
