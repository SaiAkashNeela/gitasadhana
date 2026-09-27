export const DEFAULT_NOW_PLAYING_ARTWORK: string;
export const DEFAULT_NOW_PLAYING_ARTIST: string;
export const DEFAULT_NOW_PLAYING_ALBUM: string;

export interface NowPlayingMetadataParams {
  chapterTitle?: string;
  verseId: number;
  artworkUrl?: string;
  artist?: string;
  album?: string;
}

export function createNowPlayingMetadata(params: NowPlayingMetadataParams): MediaMetadataInit;
