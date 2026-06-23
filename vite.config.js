import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/water-news-demo/',
  build: {
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei', 'three-globe'],
          charts: ['echarts', 'd3']
        }
      }
    }
  }
})
