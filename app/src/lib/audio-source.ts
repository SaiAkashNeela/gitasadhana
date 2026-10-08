/** Recitations live on the Gita audio bucket, one WAV per verse per language. */
export const AUDIO_HOST = "https://gita.saiakash.dev";

/** Languages with recordings on the server (verified; Sanskrit has none yet). */
const RECITED = new Set(["en", "hi", "te", "ta", "kn", "ml", "bn", "gu", "mr", "pa", "ne", "or"]);

export function audioLanguageFor(lang: string) {
  return RECITED.has(lang) ? lang : "en";
}

export function remoteAudioUrl(lang: string, verseId: string) {
  const [c, v] = verseId.split(".");
  return `${AUDIO_HOST}/${audioLanguageFor(lang)}/complete/${c}_${v}.wav`;
}

/** Measured from the bucket: recitations average ~4.5 MB per verse. */
export const APPROX_MB_PER_VERSE = 4.5;
