import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    // No proxy needed since we're using production API directly
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    // Make environment variables available
    'process.env': process.env,
  },
})
