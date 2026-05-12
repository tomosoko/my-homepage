import { defineConfig, type Plugin } from 'vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

/**
 * Injects <link rel="preload"> for critical font files (Inter woff2).
 * Eliminates the CSS-parse → font-fetch waterfall, improving LCP.
 */
function fontPreloadPlugin(): Plugin {
  return {
    name: 'font-preload',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        if (!ctx.bundle) return []
        const base = '/my-homepage/'
        const tags: ReturnType<Extract<NonNullable<Plugin['transformIndexHtml']>, Function>> = []
        for (const fileName of Object.keys(ctx.bundle)) {
          // Preload only the critical Inter Variable font (largest, used for all body text)
          if (fileName.endsWith('.woff2') && fileName.includes('inter')) {
            (tags as any[]).push({
              tag: 'link',
              attrs: {
                rel: 'preload',
                href: `${base}${fileName}`,
                as: 'font',
                type: 'font/woff2',
                crossorigin: true,
              },
              injectTo: 'head',
            })
          }
        }
        return tags as any
      },
    },
  }
}

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
  plugins: [
    fontPreloadPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp}'],
        navigateFallback: null,
      },
      manifest: false,
    }),
  ],
})
