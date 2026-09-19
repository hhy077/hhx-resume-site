"use client";

import { Maximize2, X, ZoomIn } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode } from "react";

type LightboxVideoProps = {
  src: string;
  poster?: string;
  title: string;
  className?: string;
};

export function LightboxVideo({ src, poster, title, className }: LightboxVideoProps): ReactNode {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const close = (): void => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const enterFullscreen = async (): Promise<void> => {
    const video = videoRef.current;
    if (!video) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await video.requestFullscreen?.();
  };

  return (
    <>
      <button type="button" className="group relative block h-full w-full cursor-zoom-in text-left focus-ring" aria-label={`全屏观看：${title}`} onClick={() => setOpen(true)}>
        <video className={className} src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
        <span className="pointer-events-none absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      {open && typeof document !== "undefined" ? createPortal(
        <div className="lightbox-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={`观看视频：${title}`} onClick={close}>
          <button type="button" className="focus-ring absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-8 sm:top-8" aria-label="关闭视频预览" onClick={(event) => { event.stopPropagation(); close(); }}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="lightbox-video-shell relative flex max-h-full w-full max-w-6xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <video ref={videoRef} className="lightbox-video" src={src} poster={poster} controls autoPlay playsInline preload="metadata" aria-label={title} />
            <button type="button" className="lightbox-video-fullscreen focus-ring absolute bottom-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/85" aria-label="全屏播放视频" onClick={enterFullscreen}>
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
