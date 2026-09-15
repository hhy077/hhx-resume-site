"use client";

import { Maximize2, Minus, Plus, RotateCcw, X, ZoomIn } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState, type ReactNode, type WheelEvent } from "react";

type LightboxImageProps = {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
};

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.25;

export function LightboxImage({ src, alt, className, sizes }: LightboxImageProps): ReactNode {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(MIN_SCALE);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, x: 0, y: 0 });

  const close = (): void => {
    setOpen(false);
    setScale(MIN_SCALE);
    setOffset({ x: 0, y: 0 });
  };

  const changeScale = (next: number): void => {
    const bounded = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    setScale(Number(bounded.toFixed(2)));
    if (bounded === MIN_SCALE) setOffset({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") close();
      if (event.key === "+" || event.key === "=") changeScale(scale + SCALE_STEP);
      if (event.key === "-") changeScale(scale - SCALE_STEP);
      if (event.key === "0") {
        setScale(MIN_SCALE);
        setOffset({ x: 0, y: 0 });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, scale]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>): void => {
    event.preventDefault();
    changeScale(scale + (event.deltaY < 0 ? SCALE_STEP : -SCALE_STEP));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLImageElement>): void => {
    if (scale <= MIN_SCALE) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLImageElement>): void => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
    setOffset((current) => ({ x: current.x + dx, y: current.y + dy }));
  };

  const handlePointerUp = (): void => {
    dragRef.current.active = false;
  };

  return (
    <>
      <button type="button" className="group relative block h-full w-full cursor-zoom-in text-left focus-ring" aria-label={`放大查看：${alt}`} onClick={() => setOpen(true)}>
        <img src={src} alt={alt} className={className} sizes={sizes} />
        <span className="pointer-events-none absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <ZoomIn className="h-4 w-4" aria-hidden="true" />
        </span>
      </button>

      {open && typeof document !== "undefined" ? createPortal(
        <div className="lightbox-overlay fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8" role="dialog" aria-modal="true" aria-label={`查看图片：${alt}`} onClick={close}>
          <div className="lightbox-toolbar absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/12 p-1.5 text-white backdrop-blur sm:bottom-8">
            <button type="button" className="lightbox-tool" aria-label="缩小图片" onClick={(event) => { event.stopPropagation(); changeScale(scale - SCALE_STEP); }}><Minus className="h-4 w-4" /></button>
            <span className="min-w-14 text-center text-xs tabular-nums">{Math.round(scale * 100)}%</span>
            <button type="button" className="lightbox-tool" aria-label="放大图片" onClick={(event) => { event.stopPropagation(); changeScale(scale + SCALE_STEP); }}><Plus className="h-4 w-4" /></button>
            <button type="button" className="lightbox-tool" aria-label="重置图片大小" onClick={(event) => { event.stopPropagation(); setScale(MIN_SCALE); setOffset({ x: 0, y: 0 }); }}><RotateCcw className="h-4 w-4" /></button>
            <button type="button" className="lightbox-tool" aria-label="适应屏幕" onClick={(event) => { event.stopPropagation(); setScale(MIN_SCALE); setOffset({ x: 0, y: 0 }); }}><Maximize2 className="h-4 w-4" /></button>
          </div>
          <button type="button" className="focus-ring absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-8 sm:top-8" aria-label="关闭图片预览" onClick={(event) => { event.stopPropagation(); close(); }}><X className="h-5 w-5" aria-hidden="true" /></button>
          <div className="lightbox-canvas" onWheel={handleWheel} onClick={(event) => event.stopPropagation()}>
            <img src={src} alt={alt} className="lightbox-image-preview" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }} onDoubleClick={() => { setScale(MIN_SCALE); setOffset({ x: 0, y: 0 }); }} onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} />
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
