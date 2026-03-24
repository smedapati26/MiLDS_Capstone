import { describe, expect, it } from 'vitest';

import { IconProps } from '@ai2c/pmx-mui/models/IconProps';

describe('IconProps', () => {
  it('should allow width to be a string or number', () => {
    const props: IconProps = { width: '100px' };
    expect(props.width).toBe('100px');

    props.width = 100;
    expect(props.width).toBe(100);
  });

  it('should allow height to be a string or number', () => {
    const props: IconProps = { height: '100px' };
    expect(props.height).toBe('100px');

    props.height = 100;
    expect(props.height).toBe(100);
  });

  it('should allow fill to be a string', () => {
    const props: IconProps = { fill: '#fff' };
    expect(props.fill).toBe('#fff');
  });

  it('should allow size to be a string or number', () => {
    const props: IconProps = { size: '24px' };
    expect(props.size).toBe('24px');

    props.size = 24;
    expect(props.size).toBe(24);
  });

  it('should allow sx to be SxProps<Theme>', () => {
    const sxProps = { margin: 1 };
    const props: IconProps = { sx: sxProps };
    expect(props.sx).toBe(sxProps);
  });
});
