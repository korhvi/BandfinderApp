import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  define: {
    'import.meta.env.VITE_LASTFM_KEY': JSON.stringify(process.env.VITE_LASTFM_KEY),
  },
});
