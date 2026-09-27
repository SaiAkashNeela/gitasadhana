export const DEFAULT_NOW_PLAYING_ARTWORK = "/favicon-logo.png";
export const DEFAULT_NOW_PLAYING_ARTIST = "Gita Sadhana";
export const DEFAULT_NOW_PLAYING_ALBUM = "Bhagavad Gita";

/**
 * Build a standard Media Session metadata object for the current verse audio.
 *
 * @param {{
 *   chapterTitle?: string,
 *   verseId: number,
 *   artworkUrl?: string,
 *   artist?: string,
 *   album?: string,
 * }} params
 * @returns {MediaMetadataInit}
 */
export function createNowPlayingMetadata({
  chapterTitle,
  verseId,
  artworkUrl = DEFAULT_NOW_PLAYING_ARTWORK,
  artist = DEFAULT_NOW_PLAYING_ARTIST,
  album = DEFAULT_NOW_PLAYING_ALBUM,
}) {
  const titlePrefix = chapterTitle?.trim() || DEFAULT_NOW_PLAYING_ALBUM;

  return {
    title: `${titlePrefix} • Verse ${verseId}`,
    artist,
    album,
    artwork: [
      { src: artworkUrl, sizes: "96x96", type: "image/png" },
      { src: artworkUrl, sizes: "256x256", type: "image/png" },
      { src: artworkUrl, sizes: "512x512", type: "image/png" },
    ],
  };
}

