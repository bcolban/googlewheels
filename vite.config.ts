import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages proje sitesi için base path: https://<user>.github.io/googlewheels/
// https://vite.dev/config/
export default defineConfig({
  base: '/googlewheels/',
  plugins: [react()],
})
