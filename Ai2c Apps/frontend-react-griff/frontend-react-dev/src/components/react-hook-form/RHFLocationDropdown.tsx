/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';

import { CircularProgress, TextField } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';

import { useDebounce } from '@hooks/useDebounce';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';
import { useGetAutoDsrLocationQuery } from '@store/griffin_api/auto_dsr/slices';

/**
 * Props for the RHFLocationDropdown component.
 * @template TFormValues - The type of the form values.
 * @template TName - The type of the field name.
 */
export type Props<
  TFormValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFormValues> = FieldPath<TFormValues>,
> = {
  field: TName;
  label?: string;
  required?: boolean;
  listBoxHeight?: string;
  rules?: any; // Validation rules for react-hook-form
  optionLabelField?: keyof IAutoDsrLocation;
  width?: string;
};

/**
 * A React Hook Form integrated location dropdown component using Material-UI Autocomplete.
 * It provides a searchable, paginated dropdown for selecting locations, with debounced search
 * and infinite scroll loading.
 * @template TFormValues - The type of the form values.
 * @template TName - The type of the field name.
 */
export const RHFLocationDropdown = <
  TFormValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFormValues> = FieldPath<TFormValues>,
>({
  field,
  label = 'Location',
  required = false,
  listBoxHeight = '200px',
  rules,
  optionLabelField = 'code',
  width,
}: Props<TFormValues, TName>) => {
  // Access the form control from react-hook-form context
  const { control } = useFormContext();

  // State for user input in the search field
  const [input, setInput] = useState<string>('');
  // State for pagination offset
  const [offset, setOffset] = useState<number>(0);
  // Debounced search string to avoid excessive API calls
  const [searchString] = useDebounce(input, 250);
  // Number of items to fetch per page
  const pageSize = 10;

  // API call to fetch locations based on search string and pagination
  const { data, isLoading } = useGetAutoDsrLocationQuery({
    code: searchString,
    name: searchString,
    limit: pageSize,
    offset,
  });

  // State to hold the list of location options
  const [options, setOptions] = useState<IAutoDsrLocation[]>([]);

  // Effect to update options when new data is fetched
  useEffect(() => {
    if (!data) return;

    setOptions((prev) =>
      offset === 0 ? data.items : [...prev, ...data.items.filter((x) => !prev.some((p) => p.id === x.id))],
    );
  }, [data, offset]);

  // Check if there are more items to load
  const hasMore = !!data && offset + pageSize < data.count;

  // Handle scroll event to load more items when nearing the bottom
  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const el = event.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (nearBottom && hasMore && !isLoading) setOffset((o) => o + pageSize);
  };

  return (
    <Controller
      name={field}
      control={control}
      rules={rules}
      render={({ field: { onChange, value, ...otherFieldProps }, fieldState: { error } }) => {
        return (
          <Autocomplete
            id="rhf-location-paginated-dropdown"
            data-testid="rhf-location-paginated-dropdown"
            options={options}
            autoHighlight
            filterOptions={(filterOption) => filterOption} // keep server-filtered result intact
            getOptionLabel={(option) => String(option[optionLabelField] ?? '')}
            isOptionEqualToValue={(option, value) => option.code === value.code}
            ListboxProps={{ onScroll: handleScroll, style: { maxHeight: listBoxHeight, overflow: 'auto' } }}
            loading={isLoading}
            sx={{ width: width }}
            onInputChange={(_event, value, _reason) => setInput(value)}
            onChange={(_event, value) =>
              onChange({
                id: value?.id as unknown as number,
                code: value?.code as string,
                name: value?.name as string,
              })
            }
            value={(value as IAutoDsrLocation) || null} // Ensure value is always defined
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                required={required}
                data-testid="location-paginated-dropdown-textfield"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoading ? (
                        <CircularProgress sx={{ width: '20px !important', height: '20px !important' }} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                error={!!error}
                helperText={error?.message}
              />
            )}
            {...otherFieldProps}
          />
        );
      }}
    />
  );
};
