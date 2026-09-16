(() => {
  "use strict";

  const HOST_TAG = "mini-q-pet-host";
  const STORAGE_KEY = "qp-mini-pet:settings";
  const STATES = Object.freeze({
    HIDDEN: "hidden",
    IDLE: "idle",
    ROAMING: "roaming",
    CURIOUS: "curious",
    GUIDING: "guiding",
    FOLLOW_CLICK: "follow-click",
    ACTION: "action",
  });
  const ACTIONS = ["blink", "stretch", "yawn"];
  const CURIOUS_LINES = [
    "这个按钮是做什么的呀？",
    "这里好像有一个值得看看内容～",
    "我发现一个项目入口，要一起看看吗？",
    "这部分看起来很有意思哦。",
  ];
  const GUIDE_LINES = ["这里可以看看哦。", "要不要从这里开始探索？"];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const randomBetween = (min, max) => min + Math.random() * (max - min);
  const wait = (min, max) => randomBetween(min, max);

  function getBasePath() {
    const script = document.currentScript;
    if (script && script.src) {
      try {
        return new URL(script.src).pathname.replace(/\/mini-q-pet\.js$/, "");
      } catch {
        return "";
      }
    }
    return document.querySelector(`script[src$="/${"mini-q-pet.js"}"]`)?.src?.replace(/\/mini-q-pet\.js(?:\?.*)?$/, "") || "";
  }

  class MiniQPet {
    constructor(host) {
      this.host = host;
      this.host.setAttribute("data-qp-enabled", "false");
      this.root = host.attachShadow({ mode: "open" });
      this.basePath = getBasePath();
      this.timers = new Set();
      this.raf = 0;
      this.listeners = [];
      this.state = STATES.HIDDEN;
      this.previousState = STATES.IDLE;
      this.position = { x: 0, y: 0 };
      this.target = null;
      this.moveStartedAt = 0;
      this.moveDuration = 0;
      this.moveOrigin = null;
      this.moveTarget = null;
      this.curiosityIndex = 0;
      this.usedCurious = new Set();
      this.lastGuideTarget = null;
      this.settings = this.readSettings();
      this.build();
      this.bind();
      this.applySettings();
    }

    readSettings() {
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return {
          enabled: Boolean(saved.enabled),
          followClick: Boolean(saved.followClick),
          curiosity: saved.curiosity !== false,
        };
      } catch {
        return { enabled: false, followClick: false, curiosity: true };
      }
    }

    saveSettings() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } catch {
        // Storage is optional; the pet still works for the current page session.
      }
    }

    build() {
      this.root.innerHTML = `
        <style>
          :host { all: initial; }
          .qp-root { position: fixed; inset: 0; z-index: 38; pointer-events: none; font-family: system-ui, sans-serif; }
          .qp-control { position: fixed; left: 16px; bottom: 16px; z-index: 2; pointer-events: auto; display: flex; align-items: center; gap: 8px; }
          .qp-toggle, .qp-settings-toggle, .qp-settings { border: 1px solid #d8d2c4; background: #fbfaf5; color: #20231f; box-shadow: 0 6px 18px #20231f20; cursor: pointer; }
          .qp-toggle { width: 42px; height: 42px; border-radius: 50%; font: 700 14px/1 system-ui, sans-serif; }
          .qp-settings-toggle { width: 30px; height: 30px; border-radius: 50%; font-size: 15px; line-height: 1; }
          .qp-settings { display: none; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 10px; font-size: 12px; white-space: nowrap; }
          .qp-control.qp-open .qp-settings { display: flex; }
          .qp-settings label { display: flex; align-items: center; gap: 6px; }
          .qp-settings input { accent-color: #6e8066; }
          .qp-pet { position: absolute; left: 0; top: 0; width: 110px; height: 156px; opacity: 0; pointer-events: none; transform: translate3d(0,0,0); will-change: transform; }
          .qp-pet.qp-visible { opacity: 1; }
          .qp-pet img { display: block; width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 10px 10px #20231f20); }
          .qp-bubble { position: absolute; right: -10px; bottom: 148px; width: 180px; padding: 9px 11px; border: 1px solid #d8d2c4; border-radius: 11px 11px 2px 11px; background: #fbfaf5; color: #20231f; box-shadow: 0 8px 18px #20231f18; font-size: 12px; line-height: 1.45; opacity: 0; transform: translateY(5px); transition: opacity .2s ease, transform .2s ease; }
          .qp-bubble.qp-show { opacity: 1; transform: translateY(0); }
          .qp-bubble::after { content: ""; position: absolute; right: 14px; bottom: -7px; width: 12px; height: 12px; border-right: 1px solid #d8d2c4; border-bottom: 1px solid #d8d2c4; background: #fbfaf5; transform: rotate(45deg); }
          .qp-pet.qp-blink img { animation: qp-blink .24s ease-in-out 2; }
          .qp-pet.qp-stretch img { animation: qp-stretch 1.2s ease-in-out both; }
          .qp-pet.qp-yawn img { animation: qp-yawn 1.4s ease-in-out both; }
          @keyframes qp-blink { 50% { transform: scaleY(.96); } }
          @keyframes qp-stretch { 50% { transform: translateY(-7px) rotate(-2deg) scale(1.03); } }
          @keyframes qp-yawn { 35% { transform: translateY(3px) rotate(2deg); } 70% { transform: translateY(0) rotate(-1deg); } }
          @media (max-width: 800px) { .qp-control { left: 12px; bottom: 12px; } .qp-pet { width: 90px; height: 128px; } .qp-bubble { right: -70px; bottom: 122px; width: 160px; } }
          @media (prefers-reduced-motion: reduce) { .qp-pet, .qp-bubble { transition: none; } .qp-pet.qp-blink img, .qp-pet.qp-stretch img, .qp-pet.qp-yawn img { animation: none; } }
        </style>
        <div class="qp-root" aria-live="polite">
          <div class="qp-control">
            <button class="qp-toggle" type="button" aria-label="打开迷你 Q 版桌宠" aria-expanded="false">Q</button>
            <button class="qp-settings-toggle" type="button" aria-label="打开迷你桌宠设置" aria-expanded="false">⚙</button>
            <div class="qp-settings" aria-hidden="true">
              <label><input class="qp-follow" type="checkbox" /> 跟随点击</label>
              <label><input class="qp-curiosity" type="checkbox" checked /> 好奇提示</label>
              <button class="qp-settings-close" type="button" aria-label="关闭桌宠设置">×</button>
            </div>
          </div>
          <div class="qp-pet" aria-hidden="true">
            <div class="qp-bubble"></div>
            <img src="${this.basePath}/desktop-pet.png" alt="" />
          </div>
        </div>`;
      this.control = this.root.querySelector(".qp-control");
      this.toggle = this.root.querySelector(".qp-toggle");
      this.settingsToggle = this.root.querySelector(".qp-settings-toggle");
      this.settingsPanel = this.root.querySelector(".qp-settings");
      this.followInput = this.root.querySelector(".qp-follow");
      this.curiosityInput = this.root.querySelector(".qp-curiosity");
      this.settingsClose = this.root.querySelector(".qp-settings-close");
      this.pet = this.root.querySelector(".qp-pet");
      this.bubble = this.root.querySelector(".qp-bubble");
    }

    bind() {
      this.listen(this.toggle, "click", () => {
        if (this.settingsOpen) {
          this.closeSettings();
        } else if (this.settings.enabled) {
          this.closeMode();
        } else {
          this.openMode();
        }
      });
      this.listen(this.toggle, "contextmenu", (event) => {
        event.preventDefault();
        this.openSettings();
      });
      this.listen(this.settingsToggle, "click", () => this.openSettings());
      this.listen(this.settingsClose, "click", () => this.closeSettings());
      this.listen(this.followInput, "change", () => {
        this.settings.followClick = this.followInput.checked;
        this.saveSettings();
      });
      this.listen(this.curiosityInput, "change", () => {
        this.settings.curiosity = this.curiosityInput.checked;
        this.saveSettings();
      });
      this.listen(window, "resize", () => this.keepInsideViewport());
      this.listen(document, "visibilitychange", () => {
        if (document.hidden) this.cancelMove();
        else if (this.settings.enabled) this.scheduleRoam(800);
      });
      this.listen(reducedMotion, "change", () => this.scheduleRoam(0));
      this.listen(document, "click", (event) => this.handleFollowClick(event), true);
    }

    listen(target, type, handler, options) {
      target.addEventListener(type, handler, options);
      this.listeners.push(() => target.removeEventListener(type, handler, options));
    }

    applySettings() {
      this.followInput.checked = this.settings.followClick;
      this.curiosityInput.checked = this.settings.curiosity;
      this.settingsOpen = false;
      if (this.settings.enabled) this.openMode();
    }

    openSettings() {
      this.settingsOpen = true;
      this.control.classList.add("qp-open");
      this.settingsToggle.setAttribute("aria-expanded", "true");
      this.settingsPanel.setAttribute("aria-hidden", "false");
    }

    closeSettings() {
      this.settingsOpen = false;
      this.control.classList.remove("qp-open");
      this.settingsToggle.setAttribute("aria-expanded", "false");
      this.settingsPanel.setAttribute("aria-hidden", "true");
    }

    openMode() {
      this.settings.enabled = true;
      this.saveSettings();
      this.host.setAttribute("data-qp-enabled", "true");
      this.toggle.setAttribute("aria-label", "关闭迷你 Q 版桌宠");
      this.toggle.setAttribute("aria-expanded", "true");
      this.pet.classList.add("qp-visible");
      this.state = STATES.IDLE;
      this.position = { x: Math.max(16, window.innerWidth - 145), y: Math.max(80, window.innerHeight - 210) };
      this.renderPosition();
      this.scheduleRoam(900);
      this.scheduleCuriosity();
      this.scheduleAction();
      this.scheduleGuide();
    }

    closeMode() {
      this.settings.enabled = false;
      this.saveSettings();
      this.host.setAttribute("data-qp-enabled", "false");
      this.state = STATES.HIDDEN;
      this.cancelMove();
      this.clearTimers();
      this.pet.classList.remove("qp-visible");
      this.hideBubble();
      this.toggle.setAttribute("aria-label", "打开迷你 Q 版桌宠");
      this.toggle.setAttribute("aria-expanded", "false");
    }

    handleFollowClick(event) {
      if (!this.settings.enabled || !this.settings.followClick || event.composedPath().includes(this.host)) return;
      this.followTo(event.clientX, event.clientY);
    }

    followTo(x, y) {
      this.previousState = this.state === STATES.FOLLOW_CLICK ? this.previousState : this.state;
      this.state = STATES.FOLLOW_CLICK;
      this.cancelMove();
      this.hideBubble();
      const halfW = this.pet.offsetWidth / 2;
      const halfH = this.pet.offsetHeight / 2;
      this.moveTo(clamp(x - halfW, 8, window.innerWidth - this.pet.offsetWidth - 8), clamp(y - halfH, 8, window.innerHeight - this.pet.offsetHeight - 8), 450);
    }

    moveTo(x, y, duration = randomBetween(1500, 3200)) {
      if (reducedMotion.matches) duration = 0;
      this.moveOrigin = { ...this.position };
      this.moveTarget = { x, y };
      this.moveStartedAt = performance.now();
      this.moveDuration = duration;
      if (!duration) {
        this.position = { x, y };
        this.renderPosition();
        this.finishMove();
        return;
      }
      this.raf = requestAnimationFrame((time) => this.tickMove(time));
    }

    tickMove(time) {
      const progress = clamp((time - this.moveStartedAt) / this.moveDuration, 0, 1);
      const eased = progress < .5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      this.position = {
        x: this.moveOrigin.x + (this.moveTarget.x - this.moveOrigin.x) * eased,
        y: this.moveOrigin.y + (this.moveTarget.y - this.moveOrigin.y) * eased,
      };
      this.renderPosition();
      if (progress < 1) this.raf = requestAnimationFrame((next) => this.tickMove(next));
      else this.finishMove();
    }

    finishMove() {
      this.raf = 0;
      if (this.state === STATES.FOLLOW_CLICK) {
        this.state = this.previousState === STATES.CURIOUS ? STATES.IDLE : this.previousState;
        this.scheduleRoam(wait(1200, 2800));
      } else if (this.state === STATES.GUIDING) {
        this.showBubble(GUIDE_LINES[Math.floor(Math.random() * GUIDE_LINES.length)], 3600);
        this.scheduleRoam(4200);
      } else if (this.state === STATES.ROAMING) {
        this.state = STATES.IDLE;
        this.scheduleRoam(wait(1800, 5200));
      }
    }

    scheduleRoam(delay) {
      this.clearNamedTimer("roam");
      if (!this.settings.enabled || document.hidden) return;
      this.setTimer("roam", () => this.roam(), delay);
    }

    roam() {
      if (!this.settings.enabled || document.hidden || this.state === STATES.FOLLOW_CLICK) return;
      const rect = this.safeRect();
      this.state = STATES.ROAMING;
      this.moveTo(randomBetween(rect.left, rect.right - this.pet.offsetWidth), randomBetween(rect.top, rect.bottom - this.pet.offsetHeight));
    }

    safeRect() {
      const margin = 12;
      const nav = document.querySelector("header, nav");
      const navBottom = nav ? nav.getBoundingClientRect().bottom + 12 : 70;
      const candidates = [...document.querySelectorAll("main, section, footer")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 120 && rect.height > 80 && rect.bottom > 0 && rect.top < window.innerHeight;
        })
        .map((element) => element.getBoundingClientRect());
      const side = candidates.length ? candidates.reduce((best, rect) => (rect.width < best.width ? rect : best), candidates[0]) : null;
      return {
        left: margin,
        right: Math.max(margin + 1, Math.min(window.innerWidth - margin, side ? side.right : window.innerWidth - margin)),
        top: Math.max(navBottom, margin),
        bottom: Math.max(navBottom + 1, window.innerHeight - margin),
      };
    }

    scheduleCuriosity() {
      this.clearNamedTimer("curiosity");
      if (!this.settings.enabled || !this.settings.curiosity) return;
      this.setTimer("curiosity", () => this.tryCurious(), wait(12000, 20000));
    }

    tryCurious() {
      if (!this.settings.enabled || !this.settings.curiosity || this.state === STATES.FOLLOW_CLICK) return this.scheduleCuriosity();
      const visible = [...document.querySelectorAll("h1, h2, nav a, button, [aria-label], [title]")]
        .map((element) => ({ element, text: (element.getAttribute("aria-label") || element.getAttribute("title") || element.textContent || "").trim() }))
        .filter(({ element, text }) => text && element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0);
      if (!visible.length) return this.scheduleCuriosity();
      const message = CURIOUS_LINES[this.curiosityIndex++ % CURIOUS_LINES.length];
      this.state = STATES.CURIOUS;
      this.showBubble(message, 4200);
      this.scheduleCuriosity();
    }

    scheduleAction() {
      this.clearNamedTimer("action");
      if (!this.settings.enabled) return;
      this.setTimer("action", () => this.playAction(), wait(8000, 15000));
    }

    scheduleGuide() {
      this.clearNamedTimer("guide");
      if (!this.settings.enabled) return;
      this.setTimer("guide", () => this.tryGuide(), wait(26000, 42000));
    }

    tryGuide() {
      if (!this.settings.enabled || this.state === STATES.FOLLOW_CLICK) return this.scheduleGuide();
      const candidates = [...document.querySelectorAll("[data-qp-guide], main a, main button, main section")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 40 && rect.height > 24 && rect.bottom > 0 && rect.top < window.innerHeight && element !== this.host;
        });
      const target = candidates.find((element) => element.hasAttribute("data-qp-guide")) || candidates[0];
      if (!target || target === this.lastGuideTarget) return this.scheduleGuide();
      this.lastGuideTarget = target;
      const rect = target.getBoundingClientRect();
      const targetX = clamp(rect.left + rect.width / 2 - this.pet.offsetWidth / 2, 8, window.innerWidth - this.pet.offsetWidth - 8);
      const targetY = clamp(rect.top - this.pet.offsetHeight - 14, 8, window.innerHeight - this.pet.offsetHeight - 8);
      this.state = STATES.GUIDING;
      this.moveTo(targetX, targetY, reducedMotion.matches ? 0 : 1800);
      this.scheduleGuide();
    }

    playAction() {
      if (!this.settings.enabled || this.state === STATES.FOLLOW_CLICK || reducedMotion.matches) return this.scheduleAction();
      this.state = STATES.ACTION;
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      this.pet.classList.remove("qp-blink", "qp-stretch", "qp-yawn");
      void this.pet.offsetWidth;
      this.pet.classList.add(`qp-${action}`);
      this.setTimer("action-end", () => {
        this.pet.classList.remove(`qp-${action}`);
        this.state = STATES.IDLE;
        this.scheduleAction();
      }, action === "blink" ? 600 : 1500);
    }

    keepInsideViewport() {
      if (!this.settings.enabled) return;
      this.position.x = clamp(this.position.x, 8, window.innerWidth - this.pet.offsetWidth - 8);
      this.position.y = clamp(this.position.y, 8, window.innerHeight - this.pet.offsetHeight - 8);
      this.renderPosition();
    }

    showBubble(text, duration) {
      this.bubble.textContent = text;
      this.bubble.classList.add("qp-show");
      this.setTimer("bubble", () => this.hideBubble(), duration);
    }

    hideBubble() {
      this.bubble.classList.remove("qp-show");
      this.clearNamedTimer("bubble");
    }

    renderPosition() {
      this.pet.style.transform = `translate3d(${this.position.x}px, ${this.position.y}px, 0)`;
    }

    setTimer(name, callback, delay) {
      const entry = { id: 0, name };
      entry.id = window.setTimeout(() => {
        this.timers.delete(entry);
        callback();
      }, delay);
      this.timers.add(entry);
    }

    clearNamedTimer(name) {
      for (const timer of this.timers) {
        if (timer.name === name) {
          clearTimeout(timer.id);
          this.timers.delete(timer);
        }
      }
    }

    clearTimers() {
      this.timers.forEach((timer) => clearTimeout(timer.id));
      this.timers.clear();
    }

    cancelMove() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
    }

    destroy() {
      this.cancelMove();
      this.clearTimers();
      this.listeners.forEach((remove) => remove());
      this.listeners = [];
      this.host.remove();
    }
  }

  function mount() {
    if (document.querySelector(HOST_TAG)) return;
    const host = document.createElement(HOST_TAG);
    document.body.append(host);
    const instance = new MiniQPet(host);
    host.destroy = () => instance.destroy();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
