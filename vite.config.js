import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  define: {
    'import.meta.env': {
      VITE_LASTFM_KEY: process.env.VITE_LASTFM_KEY
    }
  }
});
