import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [react(), glsl()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three'],
          'r3f-vendor': [
            '@react-three/fiber',
            '@react-three/drei',
            '@react-three/postprocessing',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
