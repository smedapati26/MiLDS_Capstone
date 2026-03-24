import { Classification, getClassificationOptions } from '@pmx-mui-models/Classification';
import { EnumOption } from '@pmx-mui-models/EnumOption';

describe('Classification Enum', () => {
  it('should have correct enum values', () => {
    expect(Classification.UNCLASSIFIED).toBe('Unclassified');
    expect(Classification.CUI).toBe('CUI');
    expect(Classification.CONFIDENTIAL).toBe('Confidential');
    expect(Classification.SECRET).toBe('Secret');
    expect(Classification.TOP_SECRET).toBe('Top Secret');
    expect(Classification.TOP_SECRET_SCI).toBe('Top Secret // SCI');
  });
});

describe('getClassificationOptions', () => {
  it('should return correct classification options', () => {
    const expectedOptions: EnumOption[] = [
      { label: 'UNCLASSIFIED', value: 'Unclassified' },
      { label: 'CUI', value: 'CUI' },
      { label: 'CONFIDENTIAL', value: 'Confidential' },
      { label: 'SECRET', value: 'Secret' },
      { label: 'TOP_SECRET', value: 'Top Secret' },
      { label: 'TOP_SECRET_SCI', value: 'Top Secret // SCI' },
    ];

    expect(getClassificationOptions).toEqual(expectedOptions);
  });
});
