import React, { useState } from 'react';

import { Box, Typography } from '@mui/material';

import PmxMultiSelect from '@components/dropdowns/PmxMultiSelect';
import PmxOrgChart, { OrgNode } from '@components/PmxOrgChart';
import { SkillLevel } from '@utils/constants';

import UnitListDisplay from './UnitListDisplay';

interface UCTLResultsProps {
  listView: string;
  parent: OrgNode;
  grandparent: OrgNode;
  allMOS?: { mos: string }[];
  selectedUnit: OrgNode | null;
  setSelectedMOS: (val: string | null) => void;
  setSkillLevel: (val: string | null) => void;
  setSelectedUnit: (val: OrgNode | null) => void;
  setSelectedSubUnit?: (val: string | null) => void;
  setSelectedGrandparentUnit?: (val: boolean) => void;
  isFetching: boolean;
}

const UCTLResults: React.FC<UCTLResultsProps> = ({
  listView,
  parent,
  grandparent,
  allMOS,
  selectedUnit,
  setSelectedUnit,
  setSelectedMOS,
  setSkillLevel,
  setSelectedGrandparentUnit,
  setSelectedSubUnit,
  isFetching,
}) => {
  const [selectedTableMOS, setSelectedTableMOS] = useState<string[]>([]);
  const [tableSkillLevels, setTableSkillLevels] = useState<string[]>([]);

  if (parent.id === '') {
    return (
      <Box>
        <Typography variant="body2" sx={{ opacity: 0.7 }}>
          No UCTL found.
        </Typography>
      </Box>
    );
  }

  if (listView === 'org') {
    return (
      <Box sx={{ height: '500px', overflow: 'auto', mt: 2 }}>
        <PmxOrgChart
          data={parent}
          grandparent={grandparent}
          loading={isFetching}
          setSelectedMOS={(val) => setSelectedMOS(val)}
          setSelectedSL={(val) => setSkillLevel(val)}
          setSelectedGrandparentUnit={setSelectedGrandparentUnit}
          setSelectedSubUnit={setSelectedSubUnit}
        />
      </Box>
    );
  }

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center" gap={3}>
        <Box sx={{ flex: 1 }}>
          <PmxMultiSelect
            options={allMOS?.map((x) => x.mos) ?? []}
            values={selectedTableMOS as string[]}
            label="Filter by MOS"
            onChange={setSelectedTableMOS}
          />
        </Box>

        <Box sx={{ flex: 1 }}>
          <PmxMultiSelect
            options={Object.values(SkillLevel)}
            values={tableSkillLevels}
            label="Filter by SL"
            onChange={setTableSkillLevels}
            showSearch={false}
          />
        </Box>
      </Box>
      <UnitListDisplay
        grandparent={grandparent}
        parent={parent}
        selectedTableMOS={selectedTableMOS}
        tableSkillLevels={tableSkillLevels}
        selectedUnit={selectedUnit}
        onSelect={setSelectedUnit}
      />
    </>
  );
};

export default UCTLResults;
