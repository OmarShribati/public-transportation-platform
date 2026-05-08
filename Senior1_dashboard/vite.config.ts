import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ["crypto-js"]
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    react()],
    server:{
      host:true,
      port:5173
    },
    build: { chunkSizeWarningLimit: 2500 },

})
