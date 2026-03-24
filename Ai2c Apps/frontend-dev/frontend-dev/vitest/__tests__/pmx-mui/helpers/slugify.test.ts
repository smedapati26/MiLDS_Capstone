import { slugify } from '@helpers/slugify';

/* slugify Tests */
describe('slugifyTest', () => {
  const expected = 'test-slug-phrase-works';

  it('slugify words with whitespace', () => {
    const slug = slugify('Test Slug Phrase Works');
    expect(slug).toEqual(expected);
  });

  it('slugify camel cased words words', () => {
    const slug = slugify('TestSlugPhraseWorks');
    expect(slug).toEqual(expected);
  });

  it('slugify words with underscores', () => {
    const slug = slugify('test_slug_phrase_works');
    expect(slug).toEqual(expected);
  });

  it('slugify goofy combination', () => {
    const slug = slugify('TestSlug_phrase Works');
    expect(slug).toEqual(expected);
  });
});
