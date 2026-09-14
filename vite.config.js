import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const root = __dirname

export default defineConfig({
  base: './',
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        howItWorks: resolve(root, 'how-it-works.html'),
        whoItsFor: resolve(root, 'who-its-for.html'),
        features: resolve(root, 'features.html'),
        pricing: resolve(root, 'pricing.html'),
        about: resolve(root, 'about.html'),
        privacy: resolve(root, 'privacy-policy.html'),
        terms: resolve(root, 'terms-and-conditions.html'),
        cookies: resolve(root, 'cookie-policy.html'),
        refund: resolve(root, 'refund-policy.html'),
      },
    },
  },
})
