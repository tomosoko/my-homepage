import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/my-homepage/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        diet: resolve(__dirname, 'diet/index.html'),
      },
    },
  },
})
