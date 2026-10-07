import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    assetsInlineLimit: 100000000,   // inline every asset -> single portable file
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } }
  },
  server: { host: true, allowedHosts: true, port: 5173 },
  preview: { host: true, allowedHosts: true, port: 4173 }
})
