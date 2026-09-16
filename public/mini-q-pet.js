(() => {
  "use strict";

  const HOST_TAG = "mini-q-pet-host";
  const STORAGE_KEY = "qp-mini-pet:settings";
  const MODE_EVENT = "qp-pet-mode-change";
  const STATES = { HIDDEN: "hidden", IDLE: "idle", WALK: "walk", TROTTING: "trotting", CURIOUS: "curious", GUIDING: "guiding", ACTION: "action" };
  const CURIOUS_LINES = ["这里好像有值得看看内容～", "我发现一个项目入口。", "这一部分看起来很有意思。"];
  const GUIDE_LINES = ["这里可以看看哦。", "要不要从这里开始探索？"];
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function getBasePath() {
    try { return new URL(document.currentScript.src).pathname.replace(/\/mini-q-pet\.js$/, ""); }
    catch { return ""; }
  }

  class MiniQPet {
    constructor(host) {
      this.host = host;
      this.root = host.attachShadow({ mode: "open" });
      this.basePath = getBasePath();
      this.settings = this.readSettings();
      this.state = STATES.HIDDEN;
      this.position = { x: 0, y: 0 };
      this.move = null;
      this.raf = 0;
      this.timers = new Map();
      this.listeners = [];
      this.lastActivity = Date.now();
      this.guideCount = 0;
      this.curiosityIndex = 0;
      this.build();
      this.bind();
      this.preloadFrames();
      this.applySettings();
    }

    readSettings() {
      try {
        const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return { enabled: Boolean(value.enabled), followClick: Boolean(value.followClick), curiosity: value.curiosity !== false, quiet: Boolean(value.quiet) };
      } catch { return { enabled: false, followClick: false, curiosity: true, quiet: false }; }
    }

    saveSettings() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings)); } catch {} }

    build() {
      this.root.innerHTML = `
        <style>
          :host{all:initial}.qp-root{position:fixed;inset:0;z-index:38;pointer-events:none;font-family:system-ui,sans-serif}.qp-control{position:fixed;left:16px;bottom:16px;z-index:3;display:flex;align-items:center;gap:8px;pointer-events:auto}.qp-toggle,.qp-settings-toggle,.qp-panel{border:1px solid #d8d2c4;background:#fbfaf5;color:#20231f;box-shadow:0 6px 18px #20231f20}.qp-toggle,.qp-settings-toggle,.qp-panel-close{cursor:pointer}.qp-toggle{width:42px;height:42px;border-radius:50%;font:700 14px/1 system-ui}.qp-settings-toggle{width:30px;height:30px;border-radius:50%;font-size:15px}.qp-panel{display:none;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;font-size:12px;white-space:nowrap}.qp-control.qp-open .qp-panel{display:flex}.qp-panel label{display:flex;align-items:center;gap:5px}.qp-panel input{accent-color:#6e8066}.qp-panel-close{border:0;background:transparent;font-size:18px}.qp-pet{position:absolute;left:0;top:0;width:105px;height:150px;opacity:0;pointer-events:none;will-change:transform}.qp-pet.qp-visible{opacity:1}.qp-character{width:100%;height:100%;transform-origin:50% 100%;will-change:transform}.qp-character img{display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 10px 10px #20231f20)}.qp-bubble{position:absolute;right:-12px;bottom:142px;width:170px;padding:9px 11px;border:1px solid #d8d2c4;border-radius:10px 10px 2px 10px;background:#fbfaf5;color:#20231f;box-shadow:0 8px 18px #20231f18;font-size:12px;line-height:1.45;opacity:0;transform:translateY(4px);transition:opacity .18s ease,transform .18s ease}.qp-bubble.qp-show{opacity:1;transform:translateY(0)}.qp-pet.qp-blink .qp-character{animation:qp-blink .22s ease-in-out 2}.qp-pet.qp-stretch .qp-character{animation:qp-stretch 1.3s ease-in-out}.qp-pet.qp-yawn .qp-character{animation:qp-yawn 1.5s ease-in-out}@keyframes qp-blink{50%{transform:scaleY(.96)}}@keyframes qp-stretch{50%{transform:translateY(-7px) rotate(-2deg) scale(1.03)}}@keyframes qp-yawn{40%{transform:translateY(3px) rotate(2deg)}}@media(max-width:800px){.qp-control{left:12px;bottom:12px}.qp-pet{width:88px;height:126px}.qp-bubble{right:-74px;bottom:120px;width:155px}}@media(prefers-reduced-motion:reduce){.qp-bubble{transition:none}.qp-pet .qp-character{animation:none!important}}
        </style>
        <div class="qp-root" aria-live="polite">
          <div class="qp-control"><button class="qp-toggle" type="button" aria-label="打开迷你 Q 版桌宠">Q</button><button class="qp-settings-toggle" type="button" aria-label="打开迷你桌宠设置" aria-expanded="false">⚙</button><div class="qp-panel" aria-hidden="true"><label><input class="qp-follow" type="checkbox">跟随点击</label><label><input class="qp-curiosity" type="checkbox">好奇提示</label><label><input class="qp-quiet" type="checkbox">低打扰</label><button class="qp-panel-close" type="button" aria-label="关闭桌宠设置">×</button></div></div>
          <div class="qp-pet" aria-hidden="true"><div class="qp-bubble"></div><div class="qp-character"><img alt=""></div></div>
        </div>`;
      this.control = this.root.querySelector(".qp-control"); this.toggle = this.root.querySelector(".qp-toggle"); this.settingsToggle = this.root.querySelector(".qp-settings-toggle"); this.panel = this.root.querySelector(".qp-panel"); this.panelClose = this.root.querySelector(".qp-panel-close"); this.followInput = this.root.querySelector(".qp-follow"); this.curiosityInput = this.root.querySelector(".qp-curiosity"); this.quietInput = this.root.querySelector(".qp-quiet"); this.pet = this.root.querySelector(".qp-pet"); this.character = this.root.querySelector(".qp-character"); this.image = this.root.querySelector(".qp-character img"); this.bubble = this.root.querySelector(".qp-bubble");
      this.frames = { idle: `${this.basePath}/desktop-pet.png`, left: `${this.basePath}/mini-q-pet/walk-left.png`, right: `${this.basePath}/mini-q-pet/walk-right.png` };
      this.image.src = this.frames.idle;
    }

    bind() {
      this.listen(this.toggle, "click", () => this.settings.enabled ? this.closeMode(true) : this.openMode());
      this.listen(this.settingsToggle, "click", () => this.setPanel(true)); this.listen(this.panelClose, "click", () => this.setPanel(false));
      this.listen(this.followInput, "change", () => this.updateSetting("followClick", this.followInput.checked)); this.listen(this.curiosityInput, "change", () => this.updateSetting("curiosity", this.curiosityInput.checked)); this.listen(this.quietInput, "change", () => this.updateSetting("quiet", this.quietInput.checked));
      this.listen(window, MODE_EVENT, (event) => { if (event.detail?.mode === "classic" && this.settings.enabled) this.closeMode(false); });
      this.listen(document, "click", (event) => this.handleFollow(event), true);
      ["pointermove", "scroll", "keydown", "input"].forEach((type) => this.listen(document, type, () => { this.lastActivity = Date.now(); }, { passive: true }));
      this.listen(window, "resize", () => this.keepInside()); this.listen(document, "visibilitychange", () => document.hidden ? this.pause() : this.resume()); this.listen(reducedMotion, "change", () => reducedMotion.matches && this.cancelMove());
    }

    listen(target, type, handler, options) { target.addEventListener(type, handler, options); this.listeners.push(() => target.removeEventListener(type, handler, options)); }
    applySettings() { this.followInput.checked = this.settings.followClick; this.curiosityInput.checked = this.settings.curiosity; this.quietInput.checked = this.settings.quiet; this.host.setAttribute("data-qp-enabled", "false"); if (this.settings.enabled) this.openMode(); }
    updateSetting(key, value) { this.settings[key] = value; this.saveSettings(); this.scheduleAll(); }
    setPanel(open) { this.control.classList.toggle("qp-open", open); this.panel.setAttribute("aria-hidden", String(!open)); this.settingsToggle.setAttribute("aria-expanded", String(open)); }

    openMode() {
      this.settings.enabled = true; this.saveSettings(); this.host.setAttribute("data-qp-enabled", "true"); this.toggle.setAttribute("aria-label", "关闭迷你 Q 版桌宠"); this.pet.classList.add("qp-visible"); this.state = STATES.IDLE; this.position = { x: Math.max(16, innerWidth - 140), y: Math.max(70, innerHeight - 200) }; this.renderPosition(); this.setIdleFrame(); window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: { mode: "mini" } })); this.scheduleAll(true);
    }

    closeMode(announce) { this.settings.enabled = false; this.saveSettings(); this.host.setAttribute("data-qp-enabled", "false"); this.toggle.setAttribute("aria-label", "打开迷你 Q 版桌宠"); this.state = STATES.HIDDEN; this.pause(); this.pet.classList.remove("qp-visible"); this.hideBubble(); if (announce) window.dispatchEvent(new CustomEvent(MODE_EVENT, { detail: { mode: "classic" } })); }

    scheduleAll(first = false) {
      this.clearTimers(); if (!this.settings.enabled || document.hidden) return; const quiet = this.settings.quiet;
      this.setTimer("roam", () => this.tryRoam(), first ? randomBetween(12000, 20000) : randomBetween(quiet ? 90000 : 35000, quiet ? 180000 : 70000));
      if (this.settings.curiosity && !quiet) this.setTimer("curious", () => this.tryCurious(), first ? randomBetween(35000, 50000) : randomBetween(60000, 120000));
      if (!quiet && this.guideCount < 1) this.setTimer("guide", () => this.tryGuide(), randomBetween(120000, 170000));
      this.setTimer("action", () => this.tryAction(), randomBetween(25000, 50000));
    }

    isUserBusy(seconds) { return Date.now() - this.lastActivity < seconds * 1000 || Boolean(document.querySelector("input:focus,textarea:focus,select:focus,[contenteditable=true]:focus")); }
    tryRoam() { if (this.isUserBusy(15)) return this.scheduleAll(); const bounds = this.safeBounds(); this.startMove(randomBetween(bounds.left, bounds.right), randomBetween(bounds.top, bounds.bottom), false); }
    tryCurious() { if (this.isUserBusy(20) || this.move) return this.scheduleAll(); this.state = STATES.CURIOUS; this.showBubble(CURIOUS_LINES[this.curiosityIndex++ % CURIOUS_LINES.length], 3000); this.setTimer("curious-reset", () => { this.state = STATES.IDLE; this.scheduleAll(); }, 3300); }
    tryGuide() {
      if (this.isUserBusy(20) || this.move) return this.scheduleAll(); const target = [...document.querySelectorAll("[data-qp-guide],main a,main button")].find((element) => { const rect = element.getBoundingClientRect(); return rect.width > 30 && rect.height > 20 && rect.bottom > 0 && rect.top < innerHeight; }); if (!target) return this.scheduleAll(); const rect = target.getBoundingClientRect(); this.guideCount += 1; this.state = STATES.GUIDING; this.pendingGuide = true; this.startMove(rect.left + rect.width / 2 - this.pet.offsetWidth / 2, rect.top - this.pet.offsetHeight - 12, false);
    }
    tryAction() { if (this.isUserBusy(12) || this.move || reducedMotion.matches) return this.scheduleAll(); const action = ["blink", "stretch", "yawn"][Math.floor(Math.random() * 3)]; this.state = STATES.ACTION; this.pet.classList.add(`qp-${action}`); this.setTimer("action-end", () => { this.pet.classList.remove(`qp-${action}`); this.state = STATES.IDLE; this.scheduleAll(); }, action === "blink" ? 600 : 1600); }
    handleFollow(event) { if (!this.settings.enabled || !this.settings.followClick || event.composedPath().includes(this.host)) return; this.pendingGuide = false; this.clearTimers(); this.hideBubble(); this.startMove(event.clientX - this.pet.offsetWidth / 2, event.clientY - this.pet.offsetHeight / 2, true); }

    startMove(x, y, trot) {
      const target = { x: clamp(x, 8, innerWidth - this.pet.offsetWidth - 8), y: clamp(y, 8, innerHeight - this.pet.offsetHeight - 8) }; this.cancelMove(); const dx = target.x - this.position.x; const dy = target.y - this.position.y; const distance = Math.hypot(dx, dy); const speed = trot ? 84 : 36; this.state = trot ? STATES.TROTTING : (this.state === STATES.GUIDING ? STATES.GUIDING : STATES.WALK); this.move = { from: { ...this.position }, target, started: performance.now(), duration: reducedMotion.matches ? 0 : Math.max(650, distance / speed * 1000), trot, direction: dx < 0 ? -1 : 1 }; if (!this.move.duration) return this.finishMove(target); this.raf = requestAnimationFrame((time) => this.tick(time));
    }

    tick(time) {
      if (!this.move) return; const progress = clamp((time - this.move.started) / this.move.duration, 0, 1); this.position = { x: this.move.from.x + (this.move.target.x - this.move.from.x) * progress, y: this.move.from.y + (this.move.target.y - this.move.from.y) * progress }; const elapsed = time - this.move.started; const stepMs = this.move.trot ? 135 : 205; const phase = Math.floor(elapsed / stepMs) % 4; this.image.src = phase === 0 ? this.frames.left : phase === 2 ? this.frames.right : this.frames.idle; const bob = Math.sin(elapsed / stepMs * Math.PI) * (this.move.trot ? 5 : 3); const sway = phase === 0 ? -1.8 : phase === 2 ? 1.8 : 0; this.character.style.transform = `translateY(${-Math.abs(bob)}px) rotate(${sway}deg) scaleX(${this.move.direction})`; this.renderPosition(); if (progress < 1) this.raf = requestAnimationFrame((next) => this.tick(next)); else this.finishMove(this.move.target);
    }

    finishMove(target) { this.position = target; this.move = null; this.raf = 0; this.renderPosition(); this.character.style.transform = ""; this.setIdleFrame(); if (this.pendingGuide) { this.pendingGuide = false; this.showBubble(GUIDE_LINES[Math.floor(Math.random() * GUIDE_LINES.length)], 2800); } this.state = STATES.IDLE; this.setTimer("resume", () => this.scheduleAll(), randomBetween(8000, 18000)); }
    safeBounds() { const nav = document.querySelector("nav,header"); const top = Math.max(12, nav ? nav.getBoundingClientRect().bottom + 12 : 70); return { left: 12, top, right: Math.max(13, innerWidth - this.pet.offsetWidth - 12), bottom: Math.max(top + 1, innerHeight - this.pet.offsetHeight - 12) }; }
    setIdleFrame() { this.image.src = this.frames.idle; } renderPosition() { this.pet.style.transform = `translate3d(${this.position.x}px,${this.position.y}px,0)`; }
    keepInside() { this.position.x = clamp(this.position.x, 8, innerWidth - this.pet.offsetWidth - 8); this.position.y = clamp(this.position.y, 8, innerHeight - this.pet.offsetHeight - 8); this.renderPosition(); }
    showBubble(text, duration) { this.clearTimer("bubble"); this.bubble.textContent = text; this.bubble.classList.add("qp-show"); this.setTimer("bubble", () => this.hideBubble(), duration); }
    hideBubble() { this.bubble.classList.remove("qp-show"); this.clearTimer("bubble"); }
    preloadFrames() { Object.values(this.frames || {}).forEach((src) => { const image = new Image(); image.src = src; }); }
    setTimer(name, fn, delay) { this.clearTimer(name); this.timers.set(name, window.setTimeout(() => { this.timers.delete(name); fn(); }, delay)); }
    clearTimer(name) { const id = this.timers.get(name); if (id) clearTimeout(id); this.timers.delete(name); }
    clearTimers() { this.timers.forEach((id) => clearTimeout(id)); this.timers.clear(); }
    cancelMove() { if (this.raf) cancelAnimationFrame(this.raf); this.raf = 0; this.move = null; this.character.style.transform = ""; this.setIdleFrame(); }
    pause() { this.cancelMove(); this.clearTimers(); } resume() { if (this.settings.enabled && !document.hidden) this.scheduleAll(); }
    destroy() { this.pause(); this.listeners.forEach((remove) => remove()); this.host.remove(); }
  }

  function mount() { if (document.querySelector(HOST_TAG)) return; const host = document.createElement(HOST_TAG); document.body.append(host); const instance = new MiniQPet(host); host.destroy = () => instance.destroy(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true }); else mount();
})();
