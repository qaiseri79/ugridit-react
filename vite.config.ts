import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/dataviz': {
        target: 'https://dash.unccd.unepgrid.ch',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dataviz/, '/api'),
      },
      '/api/geogli/json_data': {
        target: 'https://www.geogli.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/geogli/, '/sites/default/files'),
      },
    },
  },
})