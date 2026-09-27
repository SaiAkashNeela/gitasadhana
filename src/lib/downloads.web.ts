import { remoteAudioUrl } from "./audio-source";

// Browsers stream recitations; offline files are a native-app feature.
export const downloadsSupported = false;

export function isDownloaded(_lang: string, _verseId: string) {
  return false;
}
export function playableUri(lang: string, verseId: string) {
  return remoteAudioUrl(lang, verseId);
}
export async function downloadVerse(_lang: string, _verseId: string, _onProgress?: (f: number) => void) {
  throw new Error("Offline downloads are available in the mobile app.");
}
export function deleteVerse(_lang: string, _verseId: string) {}
export function listDownloaded(_lang: string): string[] {
  return [];
}
export function usedBytes(_lang: string) {
  return 0;
}
export function deleteAll(_lang: string) {}
