import { defineConfig } from 'vite';
import path from 'path';
import preact from '@preact/preset-vite';

export default defineConfig({
  plugins: [preact()],
  resolve: {
    alias: {
      graphql: path.resolve('..', '..', './dist'),
    },
  },
  build: {
    outDir: './dist-lite',
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
