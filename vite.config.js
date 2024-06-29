import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueDevTools from 'vite-plugin-vue-devtools'

import Unocss from 'unocss/vite'
import {
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    VueDevTools(),

    // https://github.com/antfu/unocss
    // see unocss.config.ts for config
    // Unocss({
    //   presets: [
    //     presetUno(),
    //     presetAttributify(),
    //     presetIcons({
    //       scale: 1.2,
    //       warn: true,
    //     }),
    //   ],
    //   transformers: [
    //     transformerDirectives(),
    //     transformerVariantGroup(),
    //   ]
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
