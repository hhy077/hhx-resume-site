"use client";

import { Grip, MessageCircle, Minimize2, Sparkles } from "lucide-react";
import { useRef, useState, type PointerEvent, type ReactNode } from "react";

const PET_LINES = [
  { zh: "你好，我是华翔。", en: "Hi, I'm Huaxiang." },
  { zh: "今天也一起做点有趣的东西。", en: "Let's build something curious." },
  { zh: "点击我，换一句问候。", en: "Tap me for another hello." },
  { zh: "欢迎探索我的项目。", en: "Explore my projects." },
];
const ASSET_PREFIX = process.env.NODE_ENV === "production" ? "/hhx-resume-site" : "";

export function DesktopPet(): ReactNode {
  const [isOpen, setIsOpen] = useState(true);
  const [lineIndex, setLineIndex] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ pointerX: number; pointerY: number; x: number; y: number } | null>(null);
  const didDrag = useRef(false);

  const line = PET_LINES[lineIndex] ?? PET_LINES[0]!;

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    didDrag.current = false;
    dragStart.current = { pointerX: event.clientX, pointerY: event.clientY, x: position.x, y: position.y };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
    if (!dragStart.current) return;
    if (Math.abs(event.clientX - dragStart.current.pointerX) > 3 || Math.abs(event.clientY - dragStart.current.pointerY) > 3) {
      didDrag.current = true;
    }
    setPosition({
      x: dragStart.current.x + event.clientX - dragStart.current.pointerX,
      y: dragStart.current.y + event.clientY - dragStart.current.pointerY,
    });
  };

  const stopDragging = (): void => {
    dragStart.current = null;
  };

  const greet = (): void => {
    if (didDrag.current) {
      didDrag.current = false;
      return;
    }
    setLineIndex((current) => (current + 1) % PET_LINES.length);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        className="desktop-pet-collapsed"
        aria-label="展开网站桌宠"
        onClick={() => setIsOpen(true)}
      >
        <img src={`${ASSET_PREFIX}/profile.png`} alt="" />
        <Sparkles aria-hidden="true" />
      </button>
    );
  }

  return (
    <div
      className="desktop-pet"
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <div className="desktop-pet-bubble" aria-live="polite">
        <strong>{line.zh}</strong>
        <span>{line.en}</span>
      </div>
      <button
        type="button"
        className="desktop-pet-close"
        aria-label="收起网站桌宠"
        onClick={() => setIsOpen(false)}
      >
        <Minimize2 aria-hidden="true" />
      </button>
      <div
        className="desktop-pet-avatar"
        onPointerDown={handlePointerDown}
        onClick={greet}
        role="button"
        tabIndex={0}
        aria-label="点击桌宠互动，按住可拖动"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") greet();
        }}
      >
        <span className="desktop-pet-handle" aria-hidden="true"><Grip /></span>
        <img src={`${ASSET_PREFIX}/profile.png`} alt="霍华翔网站桌宠" />
        <span className="desktop-pet-status"><MessageCircle aria-hidden="true" /></span>
      </div>
      <span className="desktop-pet-shadow" aria-hidden="true" />
    </div>
  );
}
