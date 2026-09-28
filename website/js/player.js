// Verse recitation player: streams from the audio host, or plays the offline copy.
import { AUDIO_HOST } from "./config.js";
import { getChapter, getVerse } from "./gita.js";
import { pick, t } from "./i18n.js";
import { audioLang, savedBlobUrl } from "./offline.js";

export const SPEEDS = [0.8, 1, 1.25, 1.5, 2, 2.5, 3];

const audio = new Audio();
audio.preload = "none";
let current = null; // { id, lang }
let blobUrl = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(state()));

export const onPlayer = (fn) => (listeners.add(fn), () => listeners.delete(fn));
export function state() {
  return {
    id: current?.id ?? null,
    lang: current?.lang ?? null,
    playing: !audio.paused && !audio.ended,
    buffering: audio.readyState < 3 && !audio.paused,
    time: audio.currentTime || 0,
    duration: Number.isFinite(audio.duration) ? audio.duration : 0,
    rate: audio.playbackRate,
    loop: audio.loop,
  };
}
["play", "pause", "timeupdate", "durationchange", "waiting", "playing", "ended", "ratechange", "loadedmetadata"].forEach((e) =>
  audio.addEventListener(e, emit),
);
audio.addEventListener("ended", () => {
  if (!audio.loop) audio.currentTime = 0;
});

export async function load(id, code, { autoplay = false } = {}) {
  const verse = getVerse(id);
  if (!verse) return;
  current = { id: verse.id, lang: code };
  if (blobUrl) URL.revokeObjectURL(blobUrl);
  blobUrl = await savedBlobUrl(code, verse.id).catch(() => null);
  audio.src = blobUrl ?? `${AUDIO_HOST}/${audioLang(code)}/complete/${verse.chapter}_${verse.verse}.wav`;
  audio.load();
  if ("mediaSession" in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: `${pick(getChapter(verse.chapter)?.title) || t("bhagavadGita")} • ${t("verseLabel")} ${verse.verse}`,
      artist: "Gita Sadhana",
      album: t("bhagavadGita"),
      artwork: [{ src: new URL("assets/icons/icon-512.png", document.baseURI).href, sizes: "512x512", type: "image/png" }],
    });
  }
  emit();
  if (autoplay) await play();
}

export async function play() {
  try {
    await audio.play();
  } catch {
    // Autoplay without a tap is blocked by browsers; the play button still works.
  }
}
export const pause = () => audio.pause();
export const toggle = () => (audio.paused ? play() : pause());
export const seek = (s) => {
  audio.currentTime = Math.max(0, Math.min(s, audio.duration || s));
};
export function cycleRate() {
  audio.playbackRate = SPEEDS[(SPEEDS.indexOf(audio.playbackRate) + 1) % SPEEDS.length] ?? 1;
  audio.defaultPlaybackRate = audio.playbackRate;
}
export function toggleLoop() {
  audio.loop = !audio.loop;
  emit();
}

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", play);
  navigator.mediaSession.setActionHandler("pause", pause);
  navigator.mediaSession.setActionHandler("seekbackward", (d) => seek(audio.currentTime - (d.seekOffset || 10)));
  navigator.mediaSession.setActionHandler("seekforward", (d) => seek(audio.currentTime + (d.seekOffset || 10)));
  navigator.mediaSession.setActionHandler("seekto", (d) => d.seekTime != null && seek(d.seekTime));
}

export function formatTime(s) {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}
