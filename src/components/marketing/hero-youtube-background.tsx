"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Full-viewport YouTube background. Muted + autoplay required by browsers.
 * Loop uses playlist = same video id. Start offset via IFrame API (seconds).
 * Pauses when the hero scrolls out of view (IntersectionObserver + YT API).
 */
const VIDEO_ID = "FG0fTKAqZ5g";
const START_SECONDS = 6;
const PLAYER_ID = "hero-youtube-bg-player";

function loadYoutubeIframeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return;
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const first = document.getElementsByTagName("script")[0];
    first.parentNode?.insertBefore(tag, first);

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });
}

export function HeroYoutubeBackground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YT.Player | null>(null);
  /** Hero is in view enough to play */
  const heroVisibleRef = useRef(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const ratio = entry.intersectionRatio;
        const visible = entry.isIntersecting && ratio >= 0.12;
        heroVisibleRef.current = visible;

        const p = playerRef.current;
        if (!p) return;
        if (visible) {
          p.playVideo();
        } else {
          p.pauseVideo();
        }
      },
      {
        threshold: [0, 0.05, 0.1, 0.12, 0.15, 0.2, 0.25, 0.5, 1],
        rootMargin: "0px",
      },
    );
    observer.observe(root);

    let cancelled = false;

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !document.getElementById(PLAYER_ID)) return;

      const player = new window.YT.Player(PLAYER_ID, {
        videoId: VIDEO_ID,
        playerVars: {
          autoplay: 1,
          mute: 1,
          controls: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          start: START_SECONDS,
          loop: 1,
          playlist: VIDEO_ID,
          enablejsapi: 1,
          origin:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
        events: {
          onReady: (e) => {
            e.target.mute();
            if (heroVisibleRef.current) {
              e.target.playVideo();
            } else {
              e.target.pauseVideo();
            }
          },
        },
      });
      playerRef.current = player;
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, []);

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <div id={PLAYER_ID} className="absolute inset-0 h-full w-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black" />
    </div>
  );
}
