import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Link previews need the image as a full URL (https://site/og-image.jpg).
// Set SITE_URL yourself, or let the host fill it: Vercel and Netlify both expose the production domain at build time.
function siteUrl(mode) {
  const env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  const raw = env.SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL || env.URL || ''
  if (!raw) return ''
  return (raw.startsWith('http') ? raw : `https://${raw}`).replace(/\/+$/, '')
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const url = siteUrl(mode)
  return {
    plugins: [
      react(),
      tailwindcss(),
      { name: 'site-url', transformIndexHtml: (html) => html.replaceAll('%SITE_URL%', url) },
    ],
  }
})
