import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Verse } from "./useGitaData";
import { useUserProgress } from "./useUserProgress";
import gitaProcessedData from "@/app/gita-processed.json";
import {
  createNowPlayingMetadata,
} from "@/lib/mediaSession";

interface AudioContextType {
  isPlaying: boolean;
  isLooping: boolean;
  currentTime: number;
  duration: number;
  currentVerse: Verse | null;
  playbackRate: number;
  play: (verse: Verse, language: string, startPlaying?: boolean) => Promise<void>;
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
  const mediaSessionRef = useRef<MediaSession | null>(null);

  const { selectedLanguage } = useUserProgress();

  const getChapterTitle = (chapterId: number, language: string) => {
    const chapters = (gitaProcessedData as {
      chapters?: Array<{
        chapter_number?: number;
        title?: Record<string, string>;
      }>;
    }).chapters;

    const chapter = chapters?.find((item) => item.chapter_number === chapterId);
    return chapter?.title?.[language] || chapter?.title?.en || `Chapter ${chapterId}`;
  };

  // Stop playing audio when the user changes in-app language, and load the new language track source
  useEffect(() => {
    if (audioRef.current && currentVerse) {
      // Pause if playing
      audioRef.current.pause();
      setIsPlaying(false);
      
      // Load the new language track source in the background without starting playback immediately
      play(currentVerse, selectedLanguage, false);
      console.log("⏸️ Audio stopped and source updated automatically due to in-app language switch.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage]);

  useEffect(() => {
    // Instantiate the audio object once on startup
    const audio = new Audio();
    audioRef.current = audio;
    mediaSessionRef.current = typeof navigator !== "undefined" ? navigator.mediaSession ?? null : null;

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
      console.error("Audio element error:", e);
      setIsPlaying(false);
    };
    const handlePlayEvent = () => {
      handlePlay();
      updatePlaybackState("playing");
    };
    const handlePauseEvent = () => {
      handlePause();
      updatePlaybackState("paused");
    };

    const updatePlaybackState = (state: MediaSessionPlaybackState) => {
      if (mediaSessionRef.current) {
        mediaSessionRef.current.playbackState = state;
      }
    };

    const clearMediaMetadata = () => {
      if (!mediaSessionRef.current) return;
      mediaSessionRef.current.playbackState = "none";
      mediaSessionRef.current.metadata = null;
    };

    const setActionHandler = (
      action: MediaSessionAction,
      handler: MediaSessionActionHandler | null
    ) => {
      mediaSessionRef.current?.setActionHandler(action, handler);
    };

    if (mediaSessionRef.current) {
      setActionHandler("play", () => {
        audioRef.current?.play().catch((err) => console.error("Failed to resume from media session:", err));
      });
      setActionHandler("pause", () => {
        audioRef.current?.pause();
      });
      setActionHandler("seekbackward", (details) => {
        if (!audioRef.current) return;
        const skipTime = details.seekOffset ?? 10;
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - skipTime);
      });
      setActionHandler("seekforward", (details) => {
        if (!audioRef.current) return;
        const skipTime = details.seekOffset ?? 10;
        audioRef.current.currentTime = Math.min(
          Number.isFinite(audioRef.current.duration) ? audioRef.current.duration : audioRef.current.currentTime + skipTime,
          audioRef.current.currentTime + skipTime
        );
      });
      setActionHandler("seekto", (details) => {
        if (!audioRef.current || details.seekTime == null) return;
        audioRef.current.currentTime = details.seekTime;
      });
    }

    audio.addEventListener("play", handlePlayEvent);
    audio.addEventListener("pause", handlePauseEvent);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      clearMediaMetadata();
      if (mediaSessionRef.current) {
        setActionHandler("play", null);
        setActionHandler("pause", null);
        setActionHandler("seekbackward", null);
        setActionHandler("seekforward", null);
        setActionHandler("seekto", null);
      }
      audio.removeEventListener("play", handlePlayEvent);
      audio.removeEventListener("pause", handlePauseEvent);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audioRef.current = null;
    };
  }, []);

  const play = async (verse: Verse, language: string, startPlaying = true) => {
    if (!audioRef.current) return;

    setCurrentVerse(verse);
    setCurrentLanguage(language);

    const chapterId = verse.chapter;
    const verseId = verse.verse;
    const audioUrl = `https://gita.saiakash.dev/${language}/complete/${chapterId}_${verseId}.wav`;
    const chapterTitle = getChapterTitle(chapterId, language);

    console.log(`Loading audio source: ${audioUrl}`);
    audioRef.current.src = audioUrl;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.loop = isLooping;
    audioRef.current.load();

    if (mediaSessionRef.current && typeof MediaMetadata !== "undefined") {
      mediaSessionRef.current.metadata = new MediaMetadata(
        createNowPlayingMetadata({
          chapterTitle,
          verseId,
        })
      );
      mediaSessionRef.current.playbackState = startPlaying ? "playing" : "paused";
    }

    if (startPlaying) {
      audioRef.current.play().catch((err) => {
        if (err.name === "AbortError") return;
        console.error("Audio playback failed:", err);
        setIsPlaying(false);
      });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (mediaSessionRef.current) {
        mediaSessionRef.current.playbackState = "paused";
      }
    }
  };

  const resume = () => {
    if (audioRef.current && currentVerse) {
      audioRef.current.play().catch((e) => {
        if (e.name === "AbortError") return;
        console.error("Failed to resume audio:", e);
      });
      if (mediaSessionRef.current) {
        mediaSessionRef.current.playbackState = "playing";
      }
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
