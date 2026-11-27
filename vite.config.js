import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const root = __dirname

export default defineConfig({
  // Served from the root of redcall.com.au, so root-absolute asset paths are correct and
  // keep 404.html styled even when it is served for a deep URL.
  base: '/',
  plugins: [tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        about: resolve(root, 'about.html'),
        privacy: resolve(root, 'privacy.html'),
        support: resolve(root, 'support.html'),
        termsPage: resolve(root, 'terms.html'),
        howItWorks: resolve(root, 'how-it-works.html'),
        faq: resolve(root, 'faq.html'),
        security: resolve(root, 'security.html'),
        notFound: resolve(root, '404.html'),
        privacyPolicyOld: resolve(root, 'privacy-policy.html'),
        terms: resolve(root, 'terms-and-conditions.html'),
        cookies: resolve(root, 'cookie-policy.html'),
        refund: resolve(root, 'refund-policy.html'),
      },
    },
  },
})
