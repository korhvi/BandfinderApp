console.log('Environment Variables:', import.meta.env);

const config = {
  apiKey: import.meta.env.VITE_LASTFM_KEY
};

export default config;
