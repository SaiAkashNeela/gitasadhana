import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Verse } from "./useGitaData";

interface AudioContextType {
  isPlaying: boolean;
  isLooping: boolean;
  currentTime: number;
  duration: number;
  currentVerse: Verse | null;
  playbackRate: number;
  play: (verse: Verse, language: string) => Promise<void>;
  pause: () => void;
  resume: () => void;
  seek: (time: number) => void;
  setRate: (rate: number) => void;
  toggleLooping: () => void;
  currentLanguage: string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentVerse, setCurrentVerse] = useState<Verse | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackAttempted = useRef(false);

  useEffect(() => {
    // Instantiate the audio object once on startup
    const audio = new Audio();
    audioRef.current = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (audio.loop) {
        audio.currentTime = 0;
        audio.play().catch((e) => console.log("Loop ended play error:", e));
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handleError = (e: any) => {
      console.warn("Audio element error, attempting fallback...", e);
      if (currentVerse && !fallbackAttempted.current) {
        // Mark fallback as attempted so we don't loop errors
        fallbackAttempted.current = true;

        // Fetch fallback MP3 URL
        const fallbackUrl = `https://gita.io/audio/${currentVerse.chapter}/${currentVerse.verse}.mp3`;
        console.log(`Loading fallback MP3: ${fallbackUrl}`);

        audio.src = fallbackUrl;
        audio.load();
        audio.play().catch((err) => {
          console.error("Fallback audio playback failed:", err);
          setIsPlaying(false);
        });
      } else {
        setIsPlaying(false);
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audioRef.current = null;
    };
  }, [currentVerse]);

  const play = async (verse: Verse, language: string) => {
    if (!audioRef.current) return;

    setCurrentVerse(verse);
    setCurrentLanguage(language);
    fallbackAttempted.current = false;

    const chapterId = verse.chapter;
    const verseId = verse.verse;

    let audioUrl = `https://gita.saiakash.dev/${language}/complete/${chapterId}_${verseId}.wav`;

    // 1. Try querying the R2 metadata API first
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const apiRes = await fetch(
        `https://gita.saiakash.dev/v1/audio/${language}/${chapterId}/${verseId}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (apiRes.ok) {
        const resData = await apiRes.json();
        if (resData && resData.url) {
          audioUrl = resData.url;
          console.log(`Resolved dynamic audio URL from server: ${audioUrl}`);
        }
      }
    } catch (e) {
      console.warn("Failed to query dynamic audio URL, using default:", e);
    }

    console.log(`Loading audio source: ${audioUrl}`);
    audioRef.current.src = audioUrl;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.loop = isLooping;
    audioRef.current.load();

    audioRef.current.play().catch(async (err) => {
      console.warn(`Failed loading ${audioUrl}. Retrying with alternate WAV:`, err);

      // Fallback 1: Alternate WAV path
      const isAlt = audioUrl.includes("_") && !audioUrl.includes("complete");
      const fallbackWav = isAlt
        ? `https://gita.saiakash.dev/${language}/complete/${chapterId}_${verseId}.wav`
        : `https://gita.saiakash.dev/${language}/${chapterId}_${verseId}.wav`;

      try {
        if (audioRef.current) {
          audioRef.current.src = fallbackWav;
          audioRef.current.load();
          await audioRef.current.play();
          return;
        }
      } catch (altErr) {
        console.warn(`Alternate WAV failed: ${fallbackWav}. Trying high-reliability MP3...`, altErr);
      }

      // Fallback 2: High-reliability MP3
      if (!fallbackAttempted.current && audioRef.current) {
        fallbackAttempted.current = true;
        const fallbackMp3 = `https://gita.io/audio/${chapterId}/${verseId}.mp3`;
        console.log(`Loading fallback MP3: ${fallbackMp3}`);
        audioRef.current.src = fallbackMp3;
        audioRef.current.load();
        audioRef.current.play().catch((finalErr) => {
          console.error("All audio paths failed:", finalErr);
          setIsPlaying(false);
        });
      }
    });
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const resume = () => {
    if (audioRef.current && currentVerse) {
      audioRef.current.play().catch((e) => {
        console.error("Failed to resume audio:", e);
      });
    }
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setRate = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleLooping = () => {
    setIsLooping((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.loop = next;
      }
      return next;
    });
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isLooping,
        currentTime,
        duration,
        currentVerse,
        playbackRate,
        play,
        pause,
        resume,
        seek,
        setRate,
        toggleLooping,
        currentLanguage,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within an AudioProvider");
  }
  return context;
}
