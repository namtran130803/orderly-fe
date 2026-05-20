import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
//
// HTTPS in dev: getUserMedia / camera only work in a "secure context". Plain
// http://192.168.x.x is NOT secure (only http://localhost is), so phones would
// see navigator.mediaDevices missing. Self-signed cert → browsers show a warning once.
const isDocker = process.env.VITE_DOCKER === 'true';
const proxyTarget = process.env.VITE_PROXY_TARGET || 'http://127.0.0.1:3000';

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
  // Dev/preview: browser calls same host (e.g. phone → 192.168.x.x:5173/api/…); Vite forwards to the backend.
  // Avoids VITE_API_URL=http://localhost:3000 which on a phone means "this phone", not your PC.
  server: {
    ...(isDocker && {
      host: true,
      watch: { usePolling: true, interval: 500 },
      hmr: { clientPort: 5173 },
    }),
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
