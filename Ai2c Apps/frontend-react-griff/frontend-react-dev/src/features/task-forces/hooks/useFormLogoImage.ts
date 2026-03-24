import { useEffect, useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';

export const useFormLogoImage = (fieldName: string): string | null => {
  const [dataURL, setDataURL] = useState<string | null>(null);
  const { getValues } = useFormContext();
  const file = useMemo(() => getValues(fieldName || 'logo'), [fieldName, getValues]);

  useEffect(() => {
    if (!file) {
      setDataURL(null);
      return;
    }
    // Already set to data URL
    if (typeof file === 'string') {
      setDataURL(file as string);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file as Blob);
    reader.onload = () => setDataURL(reader.result as string);
  }, [file, getValues, fieldName]);

  return dataURL;
};
