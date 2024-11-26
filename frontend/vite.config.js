import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // plugins: [react()],

  plugins: [
    react({
      jsxRuntime: 'classic',
      fastRefresh: true
    })
  ],
  server: {
    port: 3000,
  },
  build: {
    outDir: 'build',
    minify: false,
    sourcemap: true
  },
  mode: 'development',
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
});