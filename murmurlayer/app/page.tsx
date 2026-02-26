"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { DEFAULT_EQ, createEngine, type Engine } from "../core/audioEngine";
import EQPanel from "../ui/eqPanel";
import PlayerControls from "../ui/playerControls";
import Playlist from "../ui/playlist";
import UploadPanel from "../ui/uploadPanel";
import VisualCanvas from "../ui/visualCanvas";
import "../styles/leopardTheme.css";

type Track = { name: string; url: string; file: File };

function fileToObjectURL(file: File) {
  return URL.createObjectURL(file);
}

export default function Page() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const engineRef = useRef<Engine | null>(null);

  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.9);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [eqGains, setEqGains] = useState<number[]>(DEFAULT_EQ.map((b) => b.gain));

  const analyser = engineRef.current?.analyser ?? null;

  const current = useMemo(() => {
    if (currentIdx < 0 || currentIdx >= tracks.length) return null;
    return tracks[currentIdx];
  }, [tracks, currentIdx]);

  useEffect(() => {
    return () => tracks.forEach((t) => URL.revokeObjectURL(t.url));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (!engineRef.current) {
      engineRef.current = createEngine(el);
      engineRef.current.master.gain.value = volume;
    }

    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (engineRef.current) engineRef.current.master.gain.value = volume;
  }, [volume]);

  useEffect(() => {
    const eng = engineRef.current;
    if (!eng) return;
    for (let i = 0; i < eng.eq.length; i += 1) eng.eq[i].gain.value = eqGains[i] ?? 0;
  }, [eqGains]);

  const playIdx = async (idx: number) => {
    const el = audioRef.current;
    const eng = engineRef.current;
    if (!el || !eng) return;

    const track = tracks[idx];
    if (!track) return;

    if (eng.ctx.state !== "running") await eng.ctx.resume();
    el.src = track.url;
    await el.play();
    setCurrentIdx(idx);
    setIsPlaying(true);
  };

  const toggle = async () => {
    const el = audioRef.current;
    const eng = engineRef.current;
    if (!el || !eng) return;

    if (eng.ctx.state !== "running") await eng.ctx.resume();

    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
      return;
    }

    if (!el.src && tracks[0]) {
      await playIdx(0);
      return;
    }

    await el.play();
    setIsPlaying(true);
  };

  const stop = () => {
    const el = audioRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setIsPlaying(false);
  };

  const clearTracks = () => {
    tracks.forEach((t) => URL.revokeObjectURL(t.url));
    setTracks([]);
    setCurrentIdx(-1);
    stop();
  };

  const onEnded = () => {
    const next = currentIdx + 1;
    if (next < tracks.length) {
      void playIdx(next);
      return;
    }
    setIsPlaying(false);
  };

  const uploadMp3 = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type === "audio/mpeg" || f.name.toLowerCase().endsWith(".mp3"));
    const allowed = Math.max(0, 10 - tracks.length);
    const added = list.slice(0, allowed).map((file) => ({
      file,
      name: file.name.replace(/\.mp3$/i, ""),
      url: fileToObjectURL(file),
    }));

    setTracks((prev) => [...prev, ...added]);
    if (currentIdx === -1 && added.length > 0) {
      setTimeout(() => {
        void playIdx(0);
      }, 0);
    }
  };

  const uploadImages = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const allowed = Math.max(0, 10 - images.length);

    list.slice(0, allowed).forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => URL.revokeObjectURL(url);
      img.src = url;
      setImages((prev) => [...prev, img]);
    });
  };

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "12px" }}>
      <div className="murmur-shell">
        <div className="murmur-topbar">
          <div className="brand">
            <b>MurMurLayer</b>
            <small>Winamp-simple • high-end WebAudio • psycho-visual</small>
          </div>
          <span className="badge">
            {tracks.length}/10 songs • {images.length}/10 images
          </span>
        </div>

        <div className="grid">
          <div className="panel">
            <div className="panel-h">
              <div>Visualizer</div>
              <div className="row">
                <button className="btn" onClick={() => setImages([])} type="button">
                  Clear images
                </button>
              </div>
            </div>
            <VisualCanvas analyser={analyser} images={images} isPlaying={isPlaying} />
          </div>

          <div className="panel">
            <div className="panel-h">
              <div>Player</div>
              <UploadPanel onUploadMp3={uploadMp3} onUploadImages={uploadImages} />
            </div>

            <div className="controls">
              <PlayerControls
                isPlaying={isPlaying}
                canPrev={currentIdx > 0}
                canNext={currentIdx + 1 < tracks.length}
                onToggle={() => void toggle()}
                onStop={stop}
                onPrev={() => currentIdx > 0 && void playIdx(currentIdx - 1)}
                onNext={() => currentIdx + 1 < tracks.length && void playIdx(currentIdx + 1)}
                onClearSongs={clearTracks}
              />

              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Now playing</span>
                  <span style={{ opacity: 0.8 }}>{current ? current.name : "—"}</span>
                </div>
                <audio
                  ref={audioRef}
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={onEnded}
                  style={{ width: "100%", marginTop: 8 }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Volume</span>
                  <span style={{ opacity: 0.8 }}>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  className="slider"
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </div>

              <EQPanel
                eqGains={eqGains}
                onChange={(index, value) => {
                  setEqGains((prev) => {
                    const next = [...prev];
                    next[index] = value;
                    return next;
                  });
                }}
              />

              <Playlist tracks={tracks} currentIdx={currentIdx} onPlayIdx={(idx) => void playIdx(idx)} />

              <div style={{ fontSize: 12, opacity: 0.75 }}>
                Tips: For “ekte” leopard-skin, legg en tekstur i <code>public/leopard.png</code> og bytt bakgrunn i CSS.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
