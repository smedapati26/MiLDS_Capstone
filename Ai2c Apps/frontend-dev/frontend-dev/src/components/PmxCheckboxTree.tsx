/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';

import { Checkbox, FormControlLabel, FormGroup } from '@mui/material';

interface CheckboxItem {
  id: string;
  label: string;
  parentId?: string;
  children?: CheckboxItem[];
}

interface PmxCheckboxTreeProps {
  checkboxes: CheckboxItem[];
  allChecked?: boolean;
  onChange: (values: Record<string, boolean>) => void;
  values: Record<string, boolean>;
}

const initializeState = (items: CheckboxItem[], state: Record<string, boolean> = {}, allChecked: boolean = false) => {
  items.forEach((item) => {
    state[item.id] = allChecked;
    if (item.children) {
      initializeState(item.children, state, allChecked);
    }
  });
  return state;
};

/**
 * PmxCheckboxTree component renders a tree of checkboxes.
 *
 * @component
 * @param {PmxCheckboxTreeProps} props - The properties interface.
 * @param {CheckboxItem[]} props.checkboxes - Array of checkbox items to be displayed.
 * @param {boolean} [props.allChecked=false] - Flag to indicate if all checkboxes should be initially checked.
 * @param {function} props.onChange - Callback function to handle state changes of checkboxes.
 * @param {Record<string, boolean>} props.values - State values of the checkboxes.
 *
 * @returns {ReactNode} The rendered tree of checkboxes.
 */
const PmxCheckboxTree = ({ checkboxes, allChecked = false, onChange, values }: PmxCheckboxTreeProps) => {
  const [, setCheckedState] = useState(() => initializeState(checkboxes, values, allChecked));

  useEffect(() => {
    if (allChecked) {
      const newState = initializeState(checkboxes, {}, true);
      setCheckedState(newState);
      onChange(newState);
    }
  }, []);

  const handleCheckboxChange = (id: string, children?: CheckboxItem[]) => {
    setCheckedState((prevState) => {
      const newState = { ...prevState };
      const isChecked = !prevState[id];

      newState[id] = isChecked;

      if (children?.length) {
        const queue: CheckboxItem[] = [...children];

        while (queue.length) {
          const item = queue.shift()!;
          newState[item.id] = isChecked;

          if (item.children?.length) {
            queue.push(...item.children);
          }
        }
      }

      onChange(newState);
      return newState;
    });
  };

  const isIndeterminate = (children: CheckboxItem[]) => {
    const checkedCount = children.filter((child) => values[child.id]).length;
    return checkedCount > 0 && checkedCount < children.length;
  };

  const renderCheckboxes = (items: CheckboxItem[]) =>
    items.map((item) => (
      <div key={item.id} style={{ marginLeft: item.parentId ? 20 : 0 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={values[item.id]}
              indeterminate={item.children ? isIndeterminate(item.children) : false}
              onChange={() => handleCheckboxChange(item.id, item.children)}
            />
          }
          label={item.label}
        />
        {item.children && <FormGroup style={{ marginLeft: 20 }}>{renderCheckboxes(item.children)}</FormGroup>}
      </div>
    ));

  return <FormGroup>{renderCheckboxes(checkboxes)}</FormGroup>;
};

export default PmxCheckboxTree;
