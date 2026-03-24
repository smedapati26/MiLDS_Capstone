import React, { CSSProperties, useEffect, useState } from 'react';

import {
  Autocomplete,
  AutocompleteChangeDetails,
  AutocompleteChangeReason,
  AutocompleteInputChangeReason,
  CircularProgress,
  TextField,
} from '@mui/material';

import { IAutoDsrLocation } from '@store/griffin_api/auto_dsr/models';
import { useGetAutoDsrLocationQuery } from '@store/griffin_api/auto_dsr/slices';

interface Props {
  pageSize?: number;
  minChars?: number;
  onChange?: (location: IAutoDsrLocation | null) => void;
  sx?: CSSProperties;
  size?: 'small' | 'medium';
  listBoxHeight?: string;
  shrink?: boolean;
  defaultValue: IAutoDsrLocation | null; // Accept the default value as an object
}

export const useDebounce = <T,>(value: T, ms = 250) => {
  // to help to not search while typing
  const [v, setV] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);

  return v;
};

/**
 * Location dropdown component that takes in a paginated data, and fetches on scroll.
 * It also allows user to search filter by typing in
 * @param {number} props.pageSize the number of element to fetch for
 * @param {number} props.minChars the minimum character that you want user to type before it fetches
 * @param {(location: IAutoDsrLocation | null) => void} props.onChange when the value is selected, it passes the id back
 * @param {CSSProperties} props.sx sx for the Autocomplete itself
 * @param {"small" | "medium"} props.size the size of the text field
 * @param {boolean} props.shrink sx to shrink the location dropdown label
 * @param {IAutoDsrLocation} props.defaultValue the default value to put in the dropdown
 * @returns
 */

const LocationDropdown: React.FC<Props> = ({
  pageSize = 10,
  minChars = 0,
  onChange,
  sx,
  size = 'small',
  shrink,
  listBoxHeight = '200px',
  defaultValue,
}: Props): React.ReactNode => {
  const [input, setInput] = useState<string>('');
  const [offset, setOffset] = useState<number>(0);
  const [options, setOptions] = useState<IAutoDsrLocation[]>(defaultValue ? [defaultValue] : []);
  const q = useDebounce(input, 250);

  const { data, isLoading } = useGetAutoDsrLocationQuery(
    {
      code: q,
      name: q,
      limit: pageSize,
      offset,
    },
    { skip: minChars > 0 && q.length < minChars },
  );

  useEffect(() => {
    if (!data) return;

    setOptions((prev) => {
      const newOptions =
        offset === 0 ? data.items : [...prev, ...data.items.filter((x) => !prev.some((p) => p.id === x.id))];

      // Ensure the defaultValue is included in the options
      if (defaultValue && !newOptions.some((option) => option.id === defaultValue.id)) {
        return [defaultValue, ...newOptions];
      }

      return newOptions;
    });
  }, [data, defaultValue, offset]);

  const hasMore = !!data && offset + pageSize < data.count;

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    // load more near bottom
    const el = event.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (nearBottom && hasMore && !isLoading) setOffset((o) => o + pageSize);
  };

  const handleOptionEqual: React.ComponentProps<typeof Autocomplete<IAutoDsrLocation>>['isOptionEqualToValue'] = (
    option,
    value,
  ): boolean => {
    return option.id === value.id;
  };

  const handleInputChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: string,
    _reason: AutocompleteInputChangeReason,
  ): void => {
    setInput(value);
  };

  const handleChange = (
    _: React.SyntheticEvent<Element, Event>,
    value: IAutoDsrLocation | null,
    _reason: AutocompleteChangeReason,
    _details: AutocompleteChangeDetails<IAutoDsrLocation> | undefined,
  ): void => {
    const locationData = {
      id: value?.id as unknown as number,
      code: value?.code as string,
      name: value?.name as string,
    };
    onChange?.(locationData);
  };

  useEffect(() => {
    // reset paging when query text or page size changes
    setOffset(0);
  }, [q, pageSize]);

  return (
    <Autocomplete
      id="location-paginated-dropdown"
      data-testid="location-paginated-dropdown"
      options={options}
      autoHighlight
      filterOptions={(x) => x} // keep server-filtered result intact
      getOptionLabel={(o) => o?.code || ''}
      isOptionEqualToValue={handleOptionEqual}
      ListboxProps={{ onScroll: handleScroll, style: { maxHeight: listBoxHeight, overflow: 'auto' } }}
      loading={isLoading}
      onInputChange={handleInputChange}
      onChange={handleChange}
      value={(defaultValue as IAutoDsrLocation) || null} // Ensure value is always defined
      sx={{ ...sx }}
      size={size}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Location"
          data-testid="location-paginated-dropdown-textfield"
          InputLabelProps={{ shrink }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default LocationDropdown;
