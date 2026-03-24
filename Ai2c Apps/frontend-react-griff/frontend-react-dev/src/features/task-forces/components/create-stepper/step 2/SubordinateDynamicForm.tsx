import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import AddCircleIcon from '@mui/icons-material/AddCircle';
import CloseIcon from '@mui/icons-material/Close';
import { Container, Grid, IconButton, Stack } from '@mui/material';

import { Echelon, EchelonMap, getEchelonOptions } from '@ai2c/pmx-mui';

import { RHFAutocomplete, RHFTextField } from '@components/react-hook-form';
import { useOwnerOptions } from '@features/task-forces/hooks/useOwnerOptions';
import { IOptionType } from '@models/IOptions';

import { useAppSelector } from '@store/hooks';
import { selectAppUser } from '@store/slices';

/**
 * @typedef Props
 * @prop
 */
export type Props = {
  index: number;
  onAdd: (index: number) => void;
  onRemove: (index: number) => void;
};

/**
 * SubordinateDynamicForm Functional Component
 * @param { Props } props
 */
export const SubordinateDynamicForm: React.FC<Props> = (props) => {
  const { index: fieldArrayIndex, onAdd, onRemove } = props;

  const [echelonOptions, setEchelonOptions] = useState(getEchelonOptions());

  const appUser = useAppSelector(selectAppUser);
  const ownerOptions = useOwnerOptions();

  // RHF methods
  const { getValues, setValue, watch } = useFormContext();
  const subordinate = getValues(`subordinates.${fieldArrayIndex}`);

  // Sets default Owner & Echelon
  useEffect(() => {
    if (subordinate.ownerId === undefined || subordinate.ownerId === '') {
      setValue(`subordinates.${fieldArrayIndex}.ownerId`, appUser.userId as string);
    }
  }, [appUser, fieldArrayIndex, setValue, subordinate, subordinate.ownerId]);

  // Limits Echelon options and sets indentations
  useEffect(() => {
    const taskForceEchelon = getValues('echelon');
    const taskForceEchelonLevel = EchelonMap[taskForceEchelon].level;
    const depthLevel = subordinate.level;

    // If no parent echelon use taskforce echelon for option limiter
    const optionLimiter = taskForceEchelonLevel + depthLevel;
    const options = getEchelonOptions(optionLimiter);
    setEchelonOptions(options); // Set Echelon options

    // If lowest echelon level set value to Team
    if (options.length === 1) {
      setValue(`subordinates.${fieldArrayIndex}.echelon`, Echelon.TEAM);
    }
  }, [getValues, fieldArrayIndex, setValue, watch, subordinate.level]);

  // CSS for last option is selected
  const showAddButton = subordinate.echelon !== Echelon.TEAM && echelonOptions.length !== 1;
  const marginOffset = 12;

  return (
    <Stack
      key={`subordinate-form-${fieldArrayIndex}`}
      direction="row"
      gap={3}
      justifyContent="stretch"
      alignItems="center"
      sx={{ marginLeft: !showAddButton ? marginOffset : 0 }}
    >
      {/* Circle + button (disabled if no allowed children) */}
      {showAddButton && (
        <IconButton
          size="large"
          onClick={() => onAdd(fieldArrayIndex)}
          disabled={false} // getAllowedEchelons(unit.echelon).length === 0}
          sx={{
            alignSelf: 'flex-start', // Forces placement inline with fields when error occurs
            marginTop: 6, // Forces placement inline with fields when error occurs
            '& .MuiSvgIcon-root': { fontSize: '30px' },
          }}
        >
          <AddCircleIcon />
        </IconButton>
      )}
      <Container variant="secondary" maxWidth={false} sx={{ m: 0, px: 4, py: 5 }}>
        <Stack direction="row" gap={3} alignItems="center">
          <Grid container spacing={3}>
            {/** Echelon */}
            <Grid item xs={12} md={2}>
              <RHFAutocomplete
                value={subordinate.echelon}
                field={`subordinates.${fieldArrayIndex}.echelon`}
                label="Echelon"
                options={echelonOptions as IOptionType<string>[]}
                size="small"
                required
              />
            </Grid>
            {/** Subordinate TF Name */}
            <Grid item xs={12} md={3}>
              <RHFTextField
                field={`subordinates.${fieldArrayIndex}.name`}
                label="Task Force Name"
                size="small"
                required
              />
            </Grid>
            {/** Owner */}
            <Grid item xs={12} md={3}>
              <RHFAutocomplete
                field={`subordinates.${fieldArrayIndex}.ownerId`}
                value={subordinate.ownerId}
                label="Owner"
                options={ownerOptions}
                size="small"
                required
              />
            </Grid>
            {/** Short Name */}
            <Grid item xs={12} md={2}>
              <RHFTextField
                field={`subordinates.${fieldArrayIndex}.shortname`}
                label="Short Name"
                size="small"
                required
              />
            </Grid>
            {/** Nick Name */}
            <Grid item xs={12} md={2}>
              <RHFTextField field={`subordinates.${fieldArrayIndex}.nickname`} label="Nick Name" size="small" />
            </Grid>
          </Grid>
          {/* Circle X button */}
          <IconButton
            size="small"
            color="error"
            onClick={() => onRemove(fieldArrayIndex)}
            sx={{
              alignSelf: 'flex-start', // Forces placement inline with fields when error occurs
              marginTop: 2, // Forces placement inline with fields when error occurs
              '& .MuiSvgIcon-root': { fontSize: '30px' },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Container>
    </Stack>
  );
};
