import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import a from '../src/index';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),a({pathName:'router.config.ts'})],
})
