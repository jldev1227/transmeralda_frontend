import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    host: '0.0.0.0', // Esto permite que Vite acepte conexiones desde cualquier IP.
    port: 5173, // O el puerto que prefieras
  },
  base: '/', // Ruta base para la aplicación (déjalo como "/" si estará en la raíz)
})
