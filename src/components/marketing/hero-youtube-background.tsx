/**
 * Full-viewport YouTube background. Muted + autoplay required by browsers.
 * Loop requires playlist=VIDEO_ID (same as video id).
 */
const VIDEO_ID = "FG0fTKAqZ5g";

function buildEmbedSrc() {
  const p = new URLSearchParams({
    si: "Qwg0tZiU7z1ODJKC",
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: VIDEO_ID,
    controls: "0",
    modestbranding: "1",
    playsinline: "1",
    rel: "0",
  });
  return `https://www.youtube.com/embed/${VIDEO_ID}?${p.toString()}`;
}

export function HeroYoutubeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
        aria-hidden
      >
        <iframe
          src={buildEmbedSrc()}
          title="YouTube video player"
          className="absolute inset-0 h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black" />
    </div>
  );
}
