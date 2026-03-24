import { defineConfig, minimalPreset as preset } from '@vite-pwa/assets-generator/config';


export default defineConfig({
    preset,
    images: [
        'public/light-mode-favicon.svg'
    ]
})