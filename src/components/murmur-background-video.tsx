const backgroundVideoSrc = process.env.NEXT_PUBLIC_MURMUR_BG_VIDEO;
const backgroundPosterSrc = process.env.NEXT_PUBLIC_MURMUR_BG_POSTER;

export function MurmurBackgroundVideo() {
  return (
    <div aria-hidden="true" className="murmur-bg-wrap">
      {backgroundVideoSrc ? (
        <video
          className="murmur-bg-video"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster={backgroundPosterSrc}
        >
          <source src={backgroundVideoSrc} type="video/mp4" />
        </video>
      ) : null}
      <div className="murmur-bg-fallback" />
      <div className="murmur-bg-overlay" />
    </div>
  );
}
