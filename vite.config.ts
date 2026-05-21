import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    basicSsl(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    https: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://192.168.1.9:3000',
        changeOrigin: true,
      },
    },
  },
})
