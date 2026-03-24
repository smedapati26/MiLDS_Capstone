import { titlecase } from '@ai2c/pmx-mui/helpers/titlecase';

/* Titlecase Tests */
describe('titlecaseTest', () => {
  const expected = 'Test Titlecase Phrase Works';

  it('titlecase words with whitespace', () => {
    const result = titlecase('test-titlecase-phrase-works');
    expect(result).toEqual(expected);
  });

  it('titlecase lower cased words words', () => {
    const result = titlecase('test titlecase phrase works');
    expect(result).toEqual(expected);
  });

  it('titlecase words with underscores', () => {
    const result = titlecase('test_titlecase_phrase_works');
    expect(result).toEqual(expected);
  });

  it('titlecase goofy combination', () => {
    const result = titlecase('Test-Titlecase_phrase Works');
    expect(result).toEqual(expected);
  });
});
