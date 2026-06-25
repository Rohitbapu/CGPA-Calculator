import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './', // Ensures relative assets path for deployment on GitHub Pages or custom domains
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
