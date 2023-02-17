import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import routerPage from '../src/index';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),routerPage({pathName:'router.config.ts'})],
})
