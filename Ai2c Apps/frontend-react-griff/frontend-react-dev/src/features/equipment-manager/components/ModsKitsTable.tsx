import React, { useEffect, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';

import { ColumnConfig, PmxTable } from '@components/data-tables';

import { AIRCRAFT_MODIFICATION_KITS_COLUMNS, IAircraftModification } from '@store/griffin_api/aircraft/models';

interface Props {
  data: IAircraftModification[];
  setToDelete: React.Dispatch<React.SetStateAction<string[]>>;
}

const ModsKitsTable: React.FC<Props> = ({ data, setToDelete }: Props): React.ReactNode => {
  const [visibleRows, setVisibleRows] = useState<IAircraftModification[]>([]);

  useEffect(() => {
    setVisibleRows(data);
  }, [data]);

  const handleDelete = (id: string) => {
    setToDelete((prev) => [...prev, id]);
    setVisibleRows((prev) => prev.filter((item) => item.id !== Number(id)));
  };

  const columns = AIRCRAFT_MODIFICATION_KITS_COLUMNS.map((column) => ({
    ...column,
    render: (value: IAircraftModification[keyof IAircraftModification], row: IAircraftModification) => {
      const { key } = column;

      if (key === 'actions') {
        return (
          <Button onClick={() => handleDelete(String(row.id))} data-testid="mods-kit-delete-button">
            <DeleteIcon fontSize="small" />
          </Button>
        );
      } else {
        return value ?? '--';
      }
    },
  }));

  return <PmxTable columns={columns as ColumnConfig<IAircraftModification>[]} paginate rows={visibleRows} limit={5} />;
};

export default ModsKitsTable;
