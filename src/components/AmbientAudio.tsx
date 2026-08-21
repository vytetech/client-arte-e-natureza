import { useRef, useState } from "react";
import { useLang } from "@/lib/i18n";

const MUSIC_VOLUME = 0.5;
const BIRDS_VOLUME = 0.5;

export default function AmbientAudio() {
  const musicRef = useRef<HTMLAudioElement>(null);
  const birdsRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const { t } = useLang();

  const start = async () => {
    const music = musicRef.current;
    const birds = birdsRef.current;
    if (!music || !birds) return;
    music.volume = MUSIC_VOLUME;
    birds.volume = BIRDS_VOLUME;
    music.loop = true;
    birds.loop = true;

    const results = await Promise.allSettled([music.play(), birds.play()]);
    const started = results.every((result) => result.status === "fulfilled");
    setPlaying(started);

    if (!started) {
      music.pause();
      birds.pause();
      setPlaying(false);
    }
  };

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
        aria-label={playing ? t("audio.disable") : t("audio.enable")}
        title={playing ? t("audio.disable") : t("audio.enable")}
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
