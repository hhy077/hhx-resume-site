"use client";

import { X, ZoomIn } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

type LightboxImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
};

export function LightboxImage({
  src,
  alt,
  className,
  sizes,
}: LightboxImageProps): ReactNode {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="group relative block h-full w-full cursor-zoom-in text-left focus-ring"
        aria-label={`放大查看：${alt}`}
        onClick={() => setOpen(true)}
      >
        <img src={src} alt={alt} className={className} sizes={sizes} />
        <span className="pointer-events-none absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      {open ? (
        <div
          className="lightbox-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`查看图片：${alt}`}
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            className="focus-ring absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-8 sm:top-8"
            aria-label="关闭图片预览"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <img
            src={src}
            alt={alt}
            className="lightbox-image-preview max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
