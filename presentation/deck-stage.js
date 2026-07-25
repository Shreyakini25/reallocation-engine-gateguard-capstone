/* ════════════════════════════════════════════════════════════════════
   deck-stage.js — <deck-stage> Web Component
   Auto-scale · keyboard/touch nav · overlay pill · speaker notes ·
   thumbnail rail · print · slidechange events · fonts-pending guard
   ════════════════════════════════════════════════════════════════════ */

class DeckStage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._index = 0;
    this._slides = [];
    this._notes = [];
    this._railWidth = parseInt(localStorage.getItem("deck-rail-width") || "220", 10);
    this._overlayTimer = null;
  }

  get baseW() { return parseInt(this.getAttribute("width") || "1920", 10); }
  get baseH() { return parseInt(this.getAttribute("height") || "1080", 10); }
  get noRail() { return this.hasAttribute("no-rail"); }

  connectedCallback() {
    this._buildShadow();
    // Move light-DOM <section.slide> into the canvas (keep in light DOM via slot)
    this._collectSlides();
    this._collectNotes();
    this._buildRail();
    this._bindEvents();
    this._scale();
    this._fontsGuard();
    this._goto(0, { reason: "init" });
  }

  _buildShadow() {
    const style = document.createElement("style");
    style.textContent = `
      :host {
        position: fixed; inset: 0; display: block;
        background: var(--brand-navy, #0A1628);
        overflow: hidden;
      }
      .wrap { position: absolute; inset: 0; display: flex; }
      .rail {
        flex: 0 0 auto; height: 100%; overflow-y: auto; overflow-x: hidden;
        background: rgba(10,22,40,0.92);
        border-right: 1px solid var(--brand-navy-border, #1E3A5F);
        padding: 12px; box-sizing: border-box;
        display: flex; flex-direction: column; gap: 10px;
        scrollbar-width: thin;
      }
      .rail-handle {
        position: absolute; top: 0; width: 6px; height: 100%;
        cursor: col-resize; z-index: 20;
      }
      .thumb {
        position: relative; border-radius: 6px; overflow: hidden;
        border: 2px solid transparent; cursor: pointer; flex: 0 0 auto;
        background: var(--brand-navy-mid, #0D1F3C);
      }
      .thumb.active { border-color: var(--brand-cyan, #00BCD4); }
      .thumb.skip { opacity: 0.4; }
      .thumb .thumb-num {
        position: absolute; top: 4px; left: 6px; z-index: 2;
        font: 700 12px "Exo 2", sans-serif; color: #fff;
        background: rgba(21,101,192,0.85); padding: 1px 7px; border-radius: 8px;
      }
      .thumb .thumb-inner { transform-origin: top left; pointer-events: none; }
      .stage-area { flex: 1 1 auto; position: relative; overflow: hidden; }
      .canvas {
        position: absolute; top: 50%; left: 50%;
        width: ${this.baseW}px; height: ${this.baseH}px;
        transform-origin: center center;
      }
      .navbar {
        position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%);
        display: flex; align-items: center; gap: 14px;
        background: rgba(10,22,40,0.80); color: #fff;
        border: 1px solid var(--brand-navy-border, #1E3A5F);
        border-radius: 999px; padding: 8px 18px;
        backdrop-filter: blur(12px); z-index: 30;
        opacity: 0.55; transition: opacity 0.2s ease;
        font-family: "Exo 2", sans-serif;
      }
      .navbar:hover { opacity: 1; }
      .nav-btn {
        width: 36px; height: 36px; border-radius: 50%; border: none; cursor: pointer;
        background: var(--brand-blue, #1565C0); color: #fff; font-size: 22px; line-height: 1;
        display: flex; align-items: center; justify-content: center; padding: 0;
        transition: background 0.15s ease;
      }
      .nav-btn:hover { background: var(--brand-blue-bright, #1E88E5); }
      .nav-btn:disabled { opacity: 0.28; cursor: default; }
      .nav-count { font: 600 16px "Exo 2", sans-serif; min-width: 60px; text-align: center; letter-spacing: 0.04em; }
      .nav-legend {
        font: 400 14px "Exo 2", sans-serif; color: rgba(255,255,255,0.6);
        border-left: 1px solid rgba(255,255,255,0.18); padding-left: 14px; white-space: nowrap;
      }
      ::slotted(section.slide) { }
      .ctx-menu {
        position: fixed; z-index: 200; background: rgba(13,31,60,0.97);
        border: 1px solid var(--brand-navy-border, #1E3A5F); border-radius: 8px;
        padding: 6px; min-width: 150px; backdrop-filter: blur(16px);
        box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      }
      .ctx-menu button {
        display: block; width: 100%; text-align: left; background: none;
        border: none; color: #fff; font: 400 14px "Exo 2", sans-serif;
        padding: 8px 12px; border-radius: 5px; cursor: pointer;
      }
      .ctx-menu button:hover { background: var(--brand-blue, #1565C0); }
      @media print {
        .rail, .overlay, .rail-handle { display: none !important; }
        .canvas { position: static !important; transform: none !important; }
        .stage-area { overflow: visible !important; }
      }
      @media (pointer: fine) { .touch-zone { display: none; } }
      .touch-zone { position: absolute; top: 0; height: 100%; width: 33.33%; z-index: 25; }
      .touch-zone.left { left: 0; } .touch-zone.right { right: 0; }
    `;
    const wrap = document.createElement("div");
    wrap.className = "wrap";
    wrap.innerHTML = `
      <nav class="rail" part="rail" style="width:${this._railWidth}px">
        <div class="rail-handle"></div>
      </nav>
      <div class="stage-area">
        <div class="canvas"><slot></slot></div>
        <div class="touch-zone left" data-dir="prev"></div>
        <div class="touch-zone right" data-dir="next"></div>
        <div class="navbar">
          <button class="nav-btn" data-dir="prev" title="Previous slide (←)" aria-label="Previous slide">&lsaquo;</button>
          <span class="nav-count">1 / 1</span>
          <button class="nav-btn" data-dir="next" title="Next slide (→)" aria-label="Next slide">&rsaquo;</button>
          <span class="nav-legend">&larr; Prev&nbsp;·&nbsp;Next &rarr;</span>
        </div>
      </div>`;
    this.shadowRoot.append(style, wrap);
    this._railEl = wrap.querySelector(".rail");
    this._canvasEl = wrap.querySelector(".canvas");
    this._stageArea = wrap.querySelector(".stage-area");
    this._navEl = wrap.querySelector(".navbar");
    this._navCountEl = wrap.querySelector(".nav-count");
    this._navPrevEl = wrap.querySelector('.nav-btn[data-dir="prev"]');
    this._navNextEl = wrap.querySelector('.nav-btn[data-dir="next"]');
    this._handleEl = wrap.querySelector(".rail-handle");
    if (this.noRail) this._railEl.style.display = "none";
  }

  _collectSlides() {
    this._slides = Array.from(this.querySelectorAll("section.slide"));
    this._slides.forEach((s, i) => {
      s.setAttribute("role", "region");
      if (s.dataset.label) s.setAttribute("aria-label", s.dataset.label);
      if (!s.id) s.id = `slide-${i + 1}`;
    });
  }

  _collectNotes() {
    const el = this.querySelector("#speaker-notes") ||
               document.querySelector("#speaker-notes");
    if (el) { try { this._notes = JSON.parse(el.textContent); } catch (e) { this._notes = []; } }
  }

  _buildRail() {
    if (this.noRail) return;
    this._handleEl.style.left = (this._railWidth - 3) + "px";
    this._slides.forEach((slide, i) => {
      const thumb = document.createElement("div");
      thumb.className = "thumb";
      thumb.dataset.index = i;
      const inner = document.createElement("div");
      inner.className = "thumb-inner";
      const clone = slide.cloneNode(true);
      clone.style.position = "relative";
      clone.style.visibility = "visible";
      clone.style.opacity = "1";
      inner.appendChild(clone);
      const num = document.createElement("span");
      num.className = "thumb-num";
      num.textContent = i + 1;
      thumb.append(num, inner);
      thumb.addEventListener("click", () => this._goto(i, { reason: "rail" }));
      thumb.addEventListener("contextmenu", (e) => this._ctxMenu(e, i));
      this._railEl.appendChild(thumb);
    });
    requestAnimationFrame(() => this._scaleThumbs());
  }

  _scaleThumbs() {
    const w = this._railWidth - 28;
    const s = w / this.baseW;
    this._railEl.querySelectorAll(".thumb").forEach((t) => {
      const inner = t.querySelector(".thumb-inner");
      inner.style.transform = `scale(${s})`;
      inner.style.width = this.baseW + "px";
      inner.style.height = this.baseH + "px";
      t.style.height = (this.baseH * s) + "px";
      t.style.width = w + "px";
    });
  }

  _ctxMenu(e, i) {
    e.preventDefault();
    this.shadowRoot.querySelectorAll(".ctx-menu").forEach((m) => m.remove());
    const menu = document.createElement("div");
    menu.className = "ctx-menu";
    menu.style.left = e.clientX + "px";
    menu.style.top = e.clientY + "px";
    const mk = (label, fn) => {
      const b = document.createElement("button");
      b.textContent = label;
      b.addEventListener("click", () => { fn(); menu.remove(); });
      return b;
    };
    menu.append(
      mk(this._slides[i].hasAttribute("data-deck-skip") ? "Unskip" : "Skip", () => this._toggleSkip(i)),
      mk("Move Up", () => this._move(i, -1)),
      mk("Move Down", () => this._move(i, 1)),
      mk("Delete", () => this._delete(i)),
    );
    this.shadowRoot.appendChild(menu);
    const close = () => { menu.remove(); document.removeEventListener("click", close); };
    setTimeout(() => document.addEventListener("click", close), 0);
  }

  _toggleSkip(i) {
    const s = this._slides[i];
    s.toggleAttribute("data-deck-skip");
    this._refreshRail();
  }
  _move(i, dir) {
    const j = i + dir;
    if (j < 0 || j >= this._slides.length) return;
    const a = this._slides[i], b = this._slides[j];
    if (dir < 0) this.insertBefore(a, b); else this.insertBefore(b, a);
    this._collectSlides(); this._refreshRail(); this._goto(j, { reason: "reorder" });
  }
  _delete(i) {
    this._slides[i].remove();
    this._collectSlides(); this._refreshRail();
    this._goto(Math.min(this._index, this._slides.length - 1), { reason: "delete" });
  }
  _refreshRail() {
    this._railEl.querySelectorAll(".thumb").forEach((t) => t.remove());
    this._buildRail();
    this._updateRailActive();
  }

  _bindEvents() {
    window.addEventListener("keydown", (e) => this._onKey(e));
    window.addEventListener("resize", () => { this._scale(); });
    // touch zones + on-screen arrow buttons
    this.shadowRoot.querySelectorAll(".touch-zone, .nav-btn").forEach((z) => {
      z.addEventListener("click", () => {
        if (z.dataset.dir === "next") this.next(); else this.prev();
      });
    });
    // rail resize
    let dragging = false;
    this._handleEl.addEventListener("mousedown", (e) => { dragging = true; e.preventDefault(); });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      this._railWidth = Math.max(140, Math.min(420, e.clientX));
      this._railEl.style.width = this._railWidth + "px";
      this._handleEl.style.left = (this._railWidth - 3) + "px";
      this._scaleThumbs();
    });
    window.addEventListener("mouseup", () => {
      if (dragging) { dragging = false; localStorage.setItem("deck-rail-width", this._railWidth); }
    });
  }

  _onKey(e) {
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    switch (e.key) {
      case "ArrowRight": case "PageDown": case " ": this.next(); e.preventDefault(); break;
      case "ArrowLeft": case "PageUp": this.prev(); e.preventDefault(); break;
      case "Home": this._goto(0, { reason: "key" }); break;
      case "End": this._goto(this._slides.length - 1, { reason: "key" }); break;
      case "r": case "R": this._goto(0, { reason: "reset" }); break;
      default:
        if (/^[1-9]$/.test(e.key)) {
          const n = parseInt(e.key, 10) - 1;
          if (n < this._slides.length) this._goto(n, { reason: "key" });
        }
    }
  }

  next() { this._goto(Math.min(this._index + 1, this._slides.length - 1), { reason: "nav" }); }
  prev() { this._goto(Math.max(this._index - 1, 0), { reason: "nav" }); }

  _goto(i, opts = {}) {
    const prev = this._index;
    const prevSlide = this._slides[prev];
    this._index = i;
    this._slides.forEach((s, k) => {
      const active = k === i;
      s.style.visibility = active ? "visible" : "hidden";
      s.style.opacity = active ? "1" : "0";
      s.style.pointerEvents = active ? "auto" : "none";
      s.classList.remove("animating");
    });
    const slide = this._slides[i];
    // retrigger card animations
    void slide.offsetWidth;
    slide.classList.add("animating");
    this._setCardDelays(slide);
    this._updateRailActive();
    this._updateNav();
    // speaker notes broadcast
    const note = this._notes[i] || "";
    try { window.postMessage({ slideIndexChanged: i, note }, "*"); } catch (e) {}
    // focus h1 for a11y
    const h1 = slide.querySelector("h1");
    if (h1 && opts.reason !== "init") { h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
    this.dispatchEvent(new CustomEvent("slidechange", {
      detail: { index: i, previousIndex: prev, total: this._slides.length,
                slide, previousSlide: prevSlide, reason: opts.reason || "nav" }
    }));
  }

  _setCardDelays(slide) {
    const groups = slide.querySelectorAll(
      ".icon-card, .evidence-card, .verdict-card, .stat-card, .cover-card, .data-table tbody tr"
    );
    groups.forEach((c, i) => { c.style.animationDelay = (i * 80) + "ms"; });
  }

  _updateRailActive() {
    this._railEl.querySelectorAll(".thumb").forEach((t) => {
      const idx = parseInt(t.dataset.index, 10);
      t.classList.toggle("active", idx === this._index);
      t.classList.toggle("skip", this._slides[idx] && this._slides[idx].hasAttribute("data-deck-skip"));
    });
  }

  _updateNav() {
    if (this._navCountEl) this._navCountEl.textContent = `${this._index + 1} / ${this._slides.length}`;
    if (this._navPrevEl) this._navPrevEl.disabled = this._index === 0;
    if (this._navNextEl) this._navNextEl.disabled = this._index === this._slides.length - 1;
  }

  _scale() {
    const vw = this._stageArea.clientWidth;
    const vh = this._stageArea.clientHeight;
    const s = Math.min(vw / this.baseW, vh / this.baseH);
    this._canvasEl.style.transform = `translate(-50%,-50%) scale(${s})`;
  }

  _fontsGuard() {
    this.setAttribute("data-fonts-pending", "");
    const done = () => this.removeAttribute("data-fonts-pending");
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2000))]).then(done);
    } else { setTimeout(done, 2000); }
  }
}

customElements.define("deck-stage", DeckStage);
