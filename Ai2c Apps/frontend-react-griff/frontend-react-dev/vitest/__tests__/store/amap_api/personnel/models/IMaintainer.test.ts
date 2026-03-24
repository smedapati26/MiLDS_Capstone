import { describe, expect, it } from 'vitest';

import { IMaintainer, IMaintainerDto, mapToIMaintainer } from '@store/amap_api/personnel/models';

describe('mapToIMaintainer', () => {
  it('should correctly map IMaintainerDto to IMaintainer', () => {
    const dto: IMaintainerDto = {
      user_id: 'user123',
      first_name: 'John',
      last_name: 'Doe',
      ml: 'ML1',
      mos: 'MOS1',
      availability_flag: true,
    };

    const maintainer = mapToIMaintainer(dto);

    expect(maintainer.userId).toBe(dto.user_id);
    expect(maintainer.firstName).toBe(dto.first_name);
    expect(maintainer.lastName).toBe(dto.last_name);
    expect(maintainer.ml).toBe(dto.ml);
    expect(maintainer.mos).toBe(dto.mos);
    expect(maintainer.availabilityFlag).toBe(dto.availability_flag);
  });
});

describe('IMaintainerDto example object', () => {
  it('should have correct property types', () => {
    const example: IMaintainerDto = {
      user_id: 'user456',
      first_name: 'Alice',
      last_name: 'Smith',
      ml: 'ML2',
      mos: 'MOS2',
      availability_flag: false,
    };

    expect(typeof example.user_id).toBe('string');
    expect(typeof example.first_name).toBe('string');
    expect(typeof example.last_name).toBe('string');
    expect(typeof example.ml).toBe('string');
    expect(typeof example.mos).toBe('string');
    expect(typeof example.availability_flag).toBe('boolean');
  });
});

describe('IMaintainer example object', () => {
  it('should have correct property types', () => {
    const example: IMaintainer = {
      userId: 'user789',
      firstName: 'Bob',
      lastName: 'Johnson',
      ml: 'ML3',
      mos: 'MOS3',
      availabilityFlag: true,
    };

    expect(typeof example.userId).toBe('string');
    expect(typeof example.firstName).toBe('string');
    expect(typeof example.lastName).toBe('string');
    expect(typeof example.ml).toBe('string');
    expect(typeof example.mos).toBe('string');
    expect(typeof example.availabilityFlag).toBe('boolean');
  });
});
