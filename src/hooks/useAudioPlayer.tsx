import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Verse } from "./useGitaData";
import { useUserProgress } from "./useUserProgress";

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

  const { selectedLanguage } = useUserProgress();

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
  }, []);

  const play = async (verse: Verse, language: string, startPlaying = true) => {
    if (!audioRef.current) return;

    setCurrentVerse(verse);
    setCurrentLanguage(language);

    const chapterId = verse.chapter;
    const verseId = verse.verse;
    const audioUrl = `https://gita.saiakash.dev/${language}/complete/${chapterId}_${verseId}.wav`;

    console.log(`Loading audio source: ${audioUrl}`);
    audioRef.current.src = audioUrl;
    audioRef.current.playbackRate = playbackRate;
    audioRef.current.loop = isLooping;
    audioRef.current.load();

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
    }
  };

  const resume = () => {
    if (audioRef.current && currentVerse) {
      audioRef.current.play().catch((e) => {
        if (e.name === "AbortError") return;
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
