import { useEffect, useRef, useState } from "react";

const MUSIC_VOLUME = 0.45;
const BIRDS_VOLUME = 0.15;

export default function AmbientAudio() {
  const musicRef = useRef<HTMLAudioElement>(null);
  const birdsRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const start = async () => {
    const music = musicRef.current;
    const birds = birdsRef.current;
    if (!music || !birds) return;
    try {
      music.volume = MUSIC_VOLUME;
      birds.volume = BIRDS_VOLUME;
      await music.play();
      await birds.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  useEffect(() => {
    start();
    // Browsers block autoplay with sound — start on first interaction instead
    const onFirstTouch = () => {
      start();
      window.removeEventListener("pointerdown", onFirstTouch);
      window.removeEventListener("keydown", onFirstTouch);
    };
    window.addEventListener("pointerdown", onFirstTouch);
    window.addEventListener("keydown", onFirstTouch);
    return () => {
      window.removeEventListener("pointerdown", onFirstTouch);
      window.removeEventListener("keydown", onFirstTouch);
    };
  }, []);

  const toggle = () => {
    const music = musicRef.current;
    const birds = birdsRef.current;
    if (!music || !birds) return;
    if (playing) {
      music.pause();
      birds.pause();
      setPlaying(false);
    } else {
      start();
    }
  };

  return (
    <>
      <audio ref={musicRef} src="/audio/musica.mp3" loop preload="auto" />
      <audio ref={birdsRef} src="/audio/passaros.mp3" loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={playing ? "Desligar o som" : "Ligar o som"}
        title={playing ? "Desligar o som" : "Ligar o som"}
        className="fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--c-dark)] text-[var(--c-bg)] shadow-[0_8px_24px_rgba(20,16,12,0.45)] transition hover:scale-105"
      >
        {playing ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path
              d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M19 12a7 7 0 0 0-3.5-6v12A7 7 0 0 0 19 12z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3 9v6h4l5 5V4L7 9H3z" />
            <path
              d="M16 9l5 6M21 9l-5 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </>
  );
}
