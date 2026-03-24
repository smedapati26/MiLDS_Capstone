import React from 'react';

import { FilterList } from '@mui/icons-material';
import { Button, Link, Stack } from '@mui/material';

import SearchBar from '@components/inputs/PmxSearchBar';

interface Props {
  handleToggle: () => void;
  toggle: boolean;
  searchOptions: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}

const EquipmentManagerAccordionFilter: React.FC<Props> = ({
  handleToggle,
  toggle,
  searchOptions,
  onChange,
}: Props): React.ReactElement => {
  return (
    <Stack direction="row" justifyContent="center" alignItems="center" data-testid="em-filter-section">
      <Link component="button" variant="body2" onClick={handleToggle} data-testid="em-expand-collapse-all">
        Expand/Collapse All
      </Link>
      <Button
        data-testid="filter-button"
        onClick={handleToggle}
        style={{
          transform: toggle ? 'rotate(180deg)' : 'rotate(0deg)',
        }}
      >
        <FilterList />
      </Button>
      <SearchBar
        value={searchOptions}
        onChange={(value) => onChange(value as string)}
        placeholder="Search..."
        debounceMs={500}
        sx={{ minWidth: '200px' }}
      />
    </Stack>
  );
};

export default EquipmentManagerAccordionFilter;
