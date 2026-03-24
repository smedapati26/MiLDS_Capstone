import { describe, it, expect } from 'vitest';
import { defineConfig, minimalPreset as preset } from '@vite-pwa/assets-generator/config';
import config from '../../pwa-assets.config';

describe('Assets Generator Config', () => {
  it('should define the configuration correctly', () => {
    const expectedConfig = defineConfig({
      preset,
      images: ['public/light-mode-favicon.svg'],
    });

    expect(config).toEqual(expectedConfig);
  });

  it('should include the minimal preset', () => {
    expect(config.preset).toEqual(preset);
  });

  it('should include the correct images array', () => {
    expect(config.images).toContain('public/light-mode-favicon.svg');
  });
});
