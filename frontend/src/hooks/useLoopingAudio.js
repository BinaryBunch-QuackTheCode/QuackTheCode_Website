import { useEffect, useRef, useState } from "react";

/**
 * Plays an audio file in a loop while `enabled` is true.
 * Automatically stops + resets on unmount or when enabled becomes false.
 * Returns { blocked, enable } to handle autoplay-blocked browsers.
 */
export default function useLoopingAudio(src, enabled, options = {}) {
  const { volume = 0.35, loop = true } = options;

  const audioRef = useRef(null);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    // If disabled, ensure audio is stopped.
    if (!enabled) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setBlocked(false);
      return;
    }

    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audioRef.current = audio;

    const p = audio.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => setBlocked(true)); // autoplay blocked
    }

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audioRef.current = null;
      setBlocked(false);
    };
  }, [src, enabled, volume, loop]);

  const enable = async () => {
    try {
      await audioRef.current?.play();
      setBlocked(false);
    } catch {
      setBlocked(true);
    }
  };

  return { blocked, enable };
}
