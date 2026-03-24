import { describe, expect, it } from 'vitest';

import { ILocation, ILocationDto, mapToILocation } from '@store/griffin_api/events/models/ILocation';

describe('ILocation', () => {
  describe('mapToILocation', () => {
    it('should correctly map ILocationDto to ILocation with all fields', () => {
      const dto: ILocationDto = {
        name: 'Test Location',
        short_name: 'TL',
        code: 'TLC',
      };

      const expected: ILocation = {
        name: 'Test Location',
        shortName: 'TL',
        code: 'TLC',
      };

      const result = mapToILocation(dto);

      expect(result).toEqual(expected);
    });

    it('should handle short_name as null', () => {
      const dto: ILocationDto = {
        name: 'Test Location',
        short_name: null,
        code: 'TLC',
      };

      const expected: ILocation = {
        name: 'Test Location',
        shortName: null,
        code: 'TLC',
      };

      const result = mapToILocation(dto);

      expect(result).toEqual(expected);
    });

    it('should handle code as null', () => {
      const dto: ILocationDto = {
        name: 'Test Location',
        short_name: 'TL',
        code: null,
      };

      const expected: ILocation = {
        name: 'Test Location',
        shortName: 'TL',
        code: null,
      };

      const result = mapToILocation(dto);

      expect(result).toEqual(expected);
    });

    it('should handle both optional fields as null', () => {
      const dto: ILocationDto = {
        name: 'Test Location',
        short_name: null,
        code: null,
      };

      const expected: ILocation = {
        name: 'Test Location',
        shortName: null,
        code: null,
      };

      const result = mapToILocation(dto);

      expect(result).toEqual(expected);
    });
  });
});
