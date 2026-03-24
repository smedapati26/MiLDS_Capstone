/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { SetFieldValue } from 'react-hook-form';

export interface FormPersistConfig {
  storage?: Storage;
  watch: (names?: string | string[]) => any;
  setValue: SetFieldValue<any>;
  defaultValues?: SetFieldValue<any>;
  exclude?: string[];
  onDataRestored?: (data: any) => void;
  validate?: boolean;
  dirty?: boolean;
  touch?: boolean;
  onTimeout?: () => void;
  timeout?: number;
}

const useFormPersist = (
  name: string,
  {
    storage,
    watch,
    setValue,
    defaultValues,
    exclude = [],
    onDataRestored,
    validate = false,
    dirty = false,
    touch = false,
    onTimeout,
    timeout,
  }: FormPersistConfig,
) => {
  const watchedValues = watch();

  const getStorage = () => storage || window.localStorage;

  const clearStorage = () => getStorage().removeItem(name);

  useEffect(() => {
    const str = getStorage().getItem(name);

    if (str && str != JSON.stringify(defaultValues)) {
      const { _timestamp = null, ...values } = JSON.parse(str);
      const dataRestored: { [key: string]: unknown } = {};
      const currTimestamp = Date.now();

      if (timeout && currTimestamp - _timestamp > timeout) {
        onTimeout && onTimeout();
        clearStorage();
        return;
      }

      Object.keys(values).forEach((key) => {
        const shouldSet = !exclude.includes(key);
        if (shouldSet) {
          dataRestored[key] = values[key];
          setValue(key, values[key], {
            shouldValidate: validate,
            shouldDirty: dirty,
            shouldTouch: touch,
          });
        }
      });

      if (onDataRestored) {
        onDataRestored(dataRestored);
      }
    }

    // Purposefully only watching these values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage, name, onDataRestored, setValue]);

  useEffect(() => {
    const values = exclude.length
      ? Object.entries(watchedValues)
          .filter(([key]) => !exclude.includes(key))
          .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})
      : Object.assign({}, watchedValues);

    if (Object.entries(values).length) {
      if (timeout !== undefined) {
        values._timestamp = Date.now();
      }
      getStorage().setItem(name, JSON.stringify(values));
    }

    // Purposefully only watching these values
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues, timeout]);

  return {
    clear: () => getStorage().removeItem(name),
  };
};

export default useFormPersist;
