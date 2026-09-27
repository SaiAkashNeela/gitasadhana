import { Directory, File, Paths } from "expo-file-system";

import { audioLanguageFor, remoteAudioUrl } from "./audio-source";

export const downloadsSupported = true;

function dir(lang: string) {
  return new Directory(Paths.document, "recitations", audioLanguageFor(lang));
}

export function localAudioFile(lang: string, verseId: string) {
  return new File(dir(lang), `${verseId.replace(".", "_")}.wav`);
}

export function isDownloaded(lang: string, verseId: string) {
  try {
    return localAudioFile(lang, verseId).exists;
  } catch {
    return false;
  }
}

/** Local file URI when downloaded, otherwise the streaming URL. */
export function playableUri(lang: string, verseId: string) {
  return isDownloaded(lang, verseId) ? localAudioFile(lang, verseId).uri : remoteAudioUrl(lang, verseId);
}

export async function downloadVerse(lang: string, verseId: string, onProgress?: (fraction: number) => void) {
  const d = dir(lang);
  if (!d.exists) d.create({ intermediates: true, idempotent: true });
  const target = localAudioFile(lang, verseId);
  if (target.exists) return;
  // Download to a temp name so an interrupted transfer never looks complete.
  const temp = new File(d, `${verseId.replace(".", "_")}.part`);
  if (temp.exists) temp.delete();
  const task = File.createDownloadTask(remoteAudioUrl(lang, verseId), temp);
  const sub = onProgress
    ? task.addListener("progress", (p) => {
        if (p.totalBytes > 0) onProgress(p.bytesWritten / p.totalBytes);
      })
    : null;
  try {
    const file = await task.downloadAsync();
    if (!file) throw new Error("Download cancelled");
    file.move(target);
  } catch (e) {
    if (temp.exists) temp.delete();
    throw e;
  } finally {
    sub?.remove();
    task.release();
  }
}

export function deleteVerse(lang: string, verseId: string) {
  const f = localAudioFile(lang, verseId);
  if (f.exists) f.delete();
}

/** Every downloaded verse id for a language, read from disk. */
export function listDownloaded(lang: string): string[] {
  const d = dir(lang);
  if (!d.exists) return [];
  return d
    .list()
    .filter((e): e is File => e instanceof File && e.name.endsWith(".wav"))
    .map((f) => f.name.replace(".wav", "").replace("_", "."));
}

export function usedBytes(lang: string) {
  const d = dir(lang);
  if (!d.exists) return 0;
  return d
    .list()
    .filter((e): e is File => e instanceof File)
    .reduce((sum, f) => sum + (f.size ?? 0), 0);
}

export function deleteAll(lang: string) {
  const d = dir(lang);
  if (d.exists) d.delete();
}
