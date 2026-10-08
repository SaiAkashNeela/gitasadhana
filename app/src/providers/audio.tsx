import { Asset } from "expo-asset";
import { createAudioPlayer, setAudioModeAsync, useAudioPlayerStatus, type AudioPlayer } from "expo-audio";
import { createContext, use, useEffect, useRef, useState, type ReactNode } from "react";

import { audioLanguageFor } from "@/lib/audio-source";
import { playableUri } from "@/lib/downloads";
import { art, getChapter, getVerse, type Verse } from "@/lib/gita";
import { pick, t } from "@/i18n";

import { useProgress } from "./progress";

export const SPEEDS = [0.8, 1.0, 1.25, 1.5, 2.0, 2.5, 3.0];

type AudioCtx = {
  currentVerse: Verse | null;
  /** Language of the recitation actually loaded (Sanskrit falls back to English). */
  currentLanguage: string;
  requestedLanguage: string;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  rate: number;
  isLooping: boolean;
  play: (verseId: string, lang: string, startPlaying?: boolean) => void;
  pause: () => void;
  resume: () => void;
  toggle: () => void;
  seek: (seconds: number) => void;
  setRate: (rate: number) => void;
  cycleRate: () => void;
  toggleLooping: () => void;
};

const Ctx = createContext<AudioCtx | null>(null);

// One player for the whole app, created on first use and kept outside React so it can be
// driven imperatively from handlers.
let sharedPlayer: AudioPlayer | null = null;
function getPlayer() {
  if (!sharedPlayer) sharedPlayer = createAudioPlayer(null, { updateInterval: 250 });
  return sharedPlayer;
}

let artworkUrl: string | undefined;
function lockScreenArtwork() {
  if (!artworkUrl) {
    try {
      artworkUrl = Asset.fromModule(art.emblem).uri;
    } catch {}
  }
  return artworkUrl;
}

export function AudioProvider({ children }: { children: ReactNode }) {
  const player = getPlayer();
  const status = useAudioPlayerStatus(player);
  const { language } = useProgress();

  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [rate, setRateState] = useState(1);
  const [isLooping, setLooping] = useState(false);
  const lockScreenActive = useRef(false);

  useEffect(() => {
    // Recitation keeps playing with the screen locked and through the silent switch.
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: "doNotMix" }).catch(
      () => {},
    );
  }, []);

  /** Points the player at a verse's recitation (local file when downloaded). */
  const loadSource = (verseId: string, lang: string) => {
    const p = getPlayer();
    p.replace({ uri: playableUri(lang, verseId) });
    p.loop = isLooping;
    p.setPlaybackRate(rate);
  };

  const load = (verseId: string, lang: string, startPlaying: boolean) => {
    const verse = getVerse(verseId);
    if (!verse) return;
    setCurrentVerse(verse);
    loadSource(verse.id, lang);

    const chapter = getChapter(verse.chapter);
    const metadata = {
      title: `${pick(chapter?.title, lang) || t("bhagavadGita", lang)} • ${t("verseLabel", lang)} ${verse.verse}`,
      artist: "Gita Sadhana",
      albumTitle: t("bhagavadGita", lang),
      artworkUrl: lockScreenArtwork(),
    };
    try {
      if (!lockScreenActive.current) {
        player.setActiveForLockScreen(true, metadata, { showSeekBackward: true, showSeekForward: true });
        lockScreenActive.current = true;
      } else {
        player.updateLockScreenMetadata(metadata);
      }
    } catch {
      // Lock screen controls are best-effort (unsupported in some browsers).
    }
    if (startPlaying) player.play();
  };

  // Changing the reading language stops playback and quietly loads the new recitation.
  const langRef = useRef(language);
  useEffect(() => {
    if (langRef.current === language) return;
    langRef.current = language;
    if (currentVerse) {
      getPlayer().pause();
      loadSource(currentVerse.id, language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // When a verse finishes (and isn't looping) rewind so play starts from the top.
  useEffect(() => {
    if (status.didJustFinish && !isLooping) {
      player.pause();
      void player.seekTo(0);
    }
  }, [status.didJustFinish, isLooping, player]);

  const value: AudioCtx = {
    currentVerse,
    currentLanguage: audioLanguageFor(language),
    requestedLanguage: language,
    isPlaying: status.playing,
    isBuffering: status.isBuffering && !status.isLoaded,
    currentTime: status.currentTime ?? 0,
    duration: Number.isFinite(status.duration) ? status.duration : 0,
    rate,
    isLooping,
    play: (verseId, lang, startPlaying = true) => load(verseId, lang, startPlaying),
    pause: () => player.pause(),
    resume: () => {
      if (currentVerse) player.play();
    },
    toggle: () => {
      if (!currentVerse) return;
      if (status.playing) player.pause();
      else player.play();
    },
    seek: (s) => {
      void player.seekTo(Math.max(0, s));
    },
    setRate: (r) => {
      setRateState(r);
      player.setPlaybackRate(r);
    },
    cycleRate: () => {
      const next = SPEEDS[(SPEEDS.indexOf(rate) + 1) % SPEEDS.length];
      setRateState(next);
      player.setPlaybackRate(next);
    },
    toggleLooping: () => {
      const next = !isLooping;
      getPlayer().loop = next;
      setLooping(next);
    },
  };

  return <Ctx value={value}>{children}</Ctx>;
}

export function useAudio() {
  const ctx = use(Ctx);
  if (!ctx) throw new Error("useAudio must be used within AudioProvider");
  return ctx;
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
