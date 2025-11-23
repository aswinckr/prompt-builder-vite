import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['#minpath', '#minproc', '#minurl']
    }
  },
  resolve: {
    alias: {
      '#minpath': 'vfile/lib/minpath.browser.js',
      '#minproc': 'vfile/lib/minproc.browser.js',
      '#minurl': 'vfile/lib/minurl.browser.js'
    }
  }
})
