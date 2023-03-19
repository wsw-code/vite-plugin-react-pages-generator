import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';
import routerPage from 'vite-plugin-react-pages-generator';


console.log(routerPage);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),routerPage({pathName:'router.config.ts'})],
})
