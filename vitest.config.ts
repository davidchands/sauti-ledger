import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    setupFiles: ['dotenv/config'],
    // e2e/ is Playwright's suite (also *.spec.ts) — keep the two runners
    // from picking up each other's files.
    exclude: ['**/node_modules/**', 'e2e/**'],
  },
})
