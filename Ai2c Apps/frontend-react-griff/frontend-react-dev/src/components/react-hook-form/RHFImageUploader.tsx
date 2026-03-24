import { Controller, FieldValues, Path, RegisterOptions, useFormContext } from 'react-hook-form';

import { PmxImageUploader } from '../inputs/PmxImageUploader';

/**
 * Props for the RHFImageUploader component.
 * @template T - The type of the form values, extending FieldValues.
 */
export type RHFImageUploaderProps<T extends FieldValues> = {
  /** The name of the form field, used by react-hook-form for registration. */
  field: Path<T>;
  /** Optional text to display as a label for the uploader. */
  text?: string;
  /** Validation rules for react-hook-form. */
  rules?: RegisterOptions;
};

/**
 * RHFImageUploader component that wraps PmxImageUploader with react-hook-form's Controller.
 * Handles form state management for image file uploads.
 * @template T - The type of the form values.
 * @param props - The component props.
 * @returns The rendered Controller with PmxImageUploader.
 */
export const RHFImageUploader = <T extends FieldValues>({ field: name, text, rules }: RHFImageUploaderProps<T>) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field: { onChange } }) => <PmxImageUploader text={text} onUpload={(file: File) => onChange(file)} />}
    />
  );
};
