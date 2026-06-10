
"use strict";

// ── Global Config (pacified) ──────────────────────────────────
const CONFIG = Object.freeze({
  INITIAL_NUMBER  : 1,       // first component index
  FINAL_NUMBER    : 100,      // last  component index
  TEXT_LABEL      : "I Love You MY HoneyPie❤️",
  INTERVAL_MS     : 200,     // ms between each component spawn
  SCROLL_DURATION : 0.05,    // GSAP scroll duration (s)
  ENTRY_DURATION  : 0.05,    // GSAP chip entry duration (s)
  ENTRY_EASE      : "back.out(1.4)",
});

// ── Register GSAP ScrollTo plugin ────────────────────────────
gsap.registerPlugin(ScrollToPlugin);

/* ════════════════════════════════════════════════════════════
   Interface / Type documentation (mirrors TS interfaces)
   ════════════════════════════════════════════════════════════ */

/**
 * @typedef {Object} ChipConfig
 * @property {number} index     - The sequential number (1-based)
 * @property {string} label     - The text label string
 * @property {number} colorIdx  - Which chip-N class to apply
 */

/* ════════════════════════════════════════════════════════════
   TextComponent  — creates a single chip DOM element
   ════════════════════════════════════════════════════════════ */
class TextComponent {
  /**
   * @param {ChipConfig} config
   */
  constructor(config) {
    this._config = config;
    this._element = null;
  }

  /** Builds the chip element (does NOT inject into DOM yet). */
  build() {
    const { index, label, colorIdx } = this._config;

    const chip = document.createElement("div");
    chip.className = `text-chip chip-${colorIdx % 10}`;
    chip.setAttribute("role", "listitem");
    chip.setAttribute("aria-label", `${index}. ${label}`);

    // Number badge
    const badge = document.createElement("span");
    badge.className = "chip-badge";
    badge.textContent = String(index);

    // Label text
    const text = document.createElement("span");
    text.textContent = label;

    chip.appendChild(badge);
    chip.appendChild(text);

    this._element = chip;
    return chip;
  }

  /** Returns the built element (or null if not yet built). */
  get element() { return this._element; }
}

/* ════════════════════════════════════════════════════════════
   ContainerManager  — manages the scrollable chip container
   ════════════════════════════════════════════════════════════ */
class ContainerManager {
  constructor(containerId, wrapId) {
    this._container = document.getElementById(containerId);
    this._wrap      = document.getElementById(wrapId);

    if (!this._container || !this._wrap) {
      throw new Error("ContainerManager: required DOM elements not found.");
    }

    this._scrollLocked = true; // locked = GSAP controls scroll
  }

  /** Append a chip element and animate it in. Returns a Promise. */
  appendChip(chipEl) {
    return new Promise((resolve) => {
      this._wrap.appendChild(chipEl);

      // GSAP entry animation
      gsap.to(chipEl, {
        opacity       : 1,
        y             : 0,
        scale         : 1,
        duration      : CONFIG.ENTRY_DURATION,
        ease          : CONFIG.ENTRY_EASE,
        onComplete    : resolve,
      });
    });
  }

  /**
   * Auto-scroll to bottom of container if content overflows.
   * Returns a Promise that resolves when scroll animation finishes.
   */
  autoScrollToBottom() {
    if (!this._scrollLocked) return Promise.resolve();

    const el = this._container;
    const maxScroll = el.scrollHeight - el.clientHeight;

    if (maxScroll <= 0) return Promise.resolve();

    return new Promise((resolve) => {
      gsap.to(el, {
        scrollTo  : { y: maxScroll, autoKill: false },
        duration  : CONFIG.SCROLL_DURATION,
        ease      : "power2.inOut",
        onComplete: resolve,
      });
    });
  }

  /** Releases GSAP scroll control → free-hand scroll. */
  releaseScrollControl() {
    this._scrollLocked = false;
  }

  /** Clears all chips from the wrap. */
  clear() {
    this._wrap.innerHTML = "";
    this._scrollLocked = true;
    this._container.scrollTop = 0;
  }
}

/* ════════════════════════════════════════════════════════════
   UIManager  — updates progress bar, status, buttons
   ════════════════════════════════════════════════════════════ */
class UIManager {
  constructor() {
    this._progressFill    = document.getElementById("progress-fill");
    this._progressLabel   = document.getElementById("progress-label");
    this._statusDot       = document.getElementById("status-dot");
    this._statusText      = document.getElementById("status-text");
    this._startBtn        = document.getElementById("start-btn");
    this._resetBtn        = document.getElementById("reset-btn");
    this._completionBadge = document.getElementById("completion-badge");
    this._total           = CONFIG.FINAL_NUMBER - CONFIG.INITIAL_NUMBER + 1;
  }

  setRunning(isRunning) {
    this._startBtn.disabled = isRunning;
    this._resetBtn.disabled = isRunning;
  }

  updateProgress(current) {
    const total   = this._total;
    const pct     = Math.round((current / total) * 100);
    this._progressFill.style.width  = pct + "%";
    this._progressLabel.textContent = `${current} / ${total}`;
  }

  setStatus(text, pulsing = true) {
    this._statusText.textContent = text;
    this._statusDot.style.animationPlayState = pulsing ? "running" : "paused";
    this._statusDot.style.opacity = pulsing ? "1" : "0.3";
  }

  showComplete() {
    this._completionBadge.style.display = "inline-flex";
    gsap.from(this._completionBadge, { scale: 0.4, opacity: 0, duration: 0.5, ease: "back.out(1.7)" });

    this._resetBtn.disabled = false;
    gsap.to(this._resetBtn, { opacity: 1, duration: 0.4 });
  }

  resetUI() {
    this._progressFill.style.width  = "0%";
    this._progressLabel.textContent = `0 / ${this._total}`;
    this._completionBadge.style.display = "none";
    this._startBtn.disabled = false;
    this._resetBtn.disabled = true;
    gsap.set(this._resetBtn, { opacity: 0.7 });
    this.setStatus("Ready to generate…");
  }
}

/* ════════════════════════════════════════════════════════════
   AppManager  — orchestrates the whole sequence
   ════════════════════════════════════════════════════════════ */
class AppManager {
  constructor() {
    this._containerMgr = new ContainerManager("component-container", "chip-wrap");
    this._uiMgr        = new UIManager();
    this._running      = false;
    this._timer        = null;

    this._bindEvents();
  }

  _bindEvents() {
    const startBtn = document.getElementById("start-btn");
    const resetBtn = document.getElementById("reset-btn");

    startBtn.addEventListener("click", () => this._start());
    resetBtn.addEventListener("click", () => this._reset());
  }

  /** Kick off the sequential generation loop. */
  async _start() {
    if (this._running) return;
    this._running = true;
    this._uiMgr.setRunning(true);
    this._uiMgr.setStatus("Generating components…");

    const { INITIAL_NUMBER, FINAL_NUMBER, TEXT_LABEL, INTERVAL_MS } = CONFIG;
    let count = 0;

    for (let i = INITIAL_NUMBER; i <= FINAL_NUMBER; i++) {
      // Wait for interval between chips
      await this._delay(INTERVAL_MS);

      // Build chip
      const comp = new TextComponent({
        index    : i,
        label    : TEXT_LABEL,
        colorIdx : i - 1,
      });
      const chipEl = comp.build();

      // Append + animate entry
      await this._containerMgr.appendChip(chipEl);

      // Auto-scroll if overflowing
      await this._containerMgr.autoScrollToBottom();

      // Update UI
      count++;
      this._uiMgr.updateProgress(count);
      this._uiMgr.setStatus(`Rendered ${count} of ${FINAL_NUMBER - INITIAL_NUMBER + 1} components…`);
    }

    // ── All done ──────────────────────────────────────────────
    // Final scroll to make last chip fully visible
    await this._containerMgr.autoScrollToBottom();

    // Release scroll control → free-hand
    this._containerMgr.releaseScrollControl();

    this._running = false;
    this._uiMgr.setStatus("All done! Scroll freely ✦", false);
    this._uiMgr.showComplete();

    // Celebratory header pulse
    gsap.fromTo("h1", { scale: 1 }, {
      scale: 1.04, duration: 0.22, ease: "power1.inOut",
      yoyo: true, repeat: 3,
    });
  }

  _reset() {
    if (this._running) return;
    this._containerMgr.clear();
    this._uiMgr.resetUI();

    // Subtle card shake
    const card = document.querySelector("main");
    gsap.fromTo(card, { x: -6 }, { x: 0, duration: 0.3, ease: "elastic.out(1,0.5)" });
  }

  /** Promise-based delay helper. */
  _delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/* ════════════════════════════════════════════════════════════
   Bootstrap
   ════════════════════════════════════════════════════════════ */
$(document).ready(() => {
  // Page entrance animation
  gsap.from(".blob", { opacity: 0, duration: 1.8, ease: "power2.out" });
  gsap.from("header", { y: -30, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.1 });
  gsap.from("main",   { y:  40, opacity: 0, duration: 0.9, ease: "power3.out", delay: 0.25 });
  gsap.from("footer", { y:  20, opacity: 0, duration: 0.7, ease: "power2.out", delay: 0.5 });

  // Init app
  const app = new AppManager();
  // Expose for debugging (optional)
  window.__app = app;
});
