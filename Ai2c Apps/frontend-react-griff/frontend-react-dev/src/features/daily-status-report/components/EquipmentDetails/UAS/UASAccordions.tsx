import { PmxTableWrapper } from '@components/data-tables';
import { PmxToggleButtonGroup } from '@components/inputs';

type Props = {
  children?: React.ReactNode;
  onToggle: (value: string) => void;
};

/**
 * UASAccordions Functional Component
 * @param { Props } props
 */
export const UASAccordions: React.FC<Props> = ({ children, onToggle }) => {
  return (
    <PmxTableWrapper
      leftControls={<PmxToggleButtonGroup value={'UAS'} options={['Aircraft', 'UAS', 'AGSE']} onChange={onToggle} />}
      table={children}
    />
  );
};
