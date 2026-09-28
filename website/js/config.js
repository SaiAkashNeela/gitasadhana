// Deployment settings. Change these two values when the API moves to its own domain.
export const API_BASE = "https://gita-sadhana-api.mrsan.workers.dev";
export const GOOGLE_WEB_CLIENT_ID = "822836118890-c0phehllvd4s2409adtgo13f1ipg997k.apps.googleusercontent.com";

// Recitations: streamed from the audio host; saved for offline use through the API's CORS proxy.
export const AUDIO_HOST = "https://gita.saiakash.dev";
export const AUDIO_PROXY = `${API_BASE}/audio`;

// Languages that have recordings on the audio host (Sanskrit has none yet).
export const RECITED = ["en", "hi", "te", "ta", "kn", "ml", "bn", "gu", "mr", "pa", "ne", "or"];
export const APPROX_MB_PER_VERSE = 4.5;

// Public address of the website (canonical links, sharing, structured data).
export const SITE_URL = "https://gitasadhana.com";

// Gita Sadhana is made by Sai Akash Neela.
export const CREDIT = {
  name: "Sai Akash Neela",
  url: "https://saiakashneela.com",
  github: "https://github.com/SaiAkashNeela",
};
