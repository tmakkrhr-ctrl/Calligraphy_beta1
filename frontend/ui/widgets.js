// 画面表示まわりの部品（手本パネル・キャンバス・ステータス表示）をまとめる。
(function registerWidgets(ns) {
  // 手本表示UI（表示/非表示、読み込み成功/失敗の状態管理）を担当。
  class TemplatePanel {
    constructor({
      root,
      imageEl,
      emptyEl,
      buttonEl,
      appState,
      resolver,
      loader,
      statusBar,
      // 画面ごとに「手本」「下書き」など文言を切り替えられるようにする。
      showLabel = "手本を見る",
      hideLabel = "手本を隠す",
    }) {
      this.root = root;
      this.imageEl = imageEl;
      this.emptyEl = emptyEl;
      this.buttonEl = buttonEl;
      this.appState = appState;
      this.resolver = resolver;
      this.loader = loader;
      this.statusBar = statusBar;
      this.showLabel = showLabel;
      this.hideLabel = hideLabel;
      this.requestToken = 0;
      this.currentChar = "";
    }

    setCurrentChar(char) {
      this.currentChar = char;
    }

    reset() {
      this.appState.templateVisible = false;
      this.appState.templateState = "hidden";
      this.requestToken += 1;
      this.render();
    }

    async toggle() {
      if (!this.currentChar) return;

      if (this.appState.templateVisible) {
        this.appState.templateVisible = false;
        this.appState.templateState = "hidden";
        this.render();
        this.statusBar.set("手本を非表示にしました。");
        return;
      }

      this.appState.templateVisible = true;
      this.appState.templateState = "loading";
      this.render();

      const src = this.resolver.resolve(this.currentChar);
      // 読み込みの新しい番号を発行する。古い読み込み結果が後から返ってきても無視するため。
      const token = ++this.requestToken;

      try {
        await this.loader.load(src);
        if (token !== this.requestToken || !this.appState.templateVisible) return;
        this.imageEl.src = src;
        this.imageEl.alt = `手本: ${this.currentChar}`;
        this.appState.templateState = "shown";
        this.render();
        this.statusBar.set(`手本を表示しました (${src})`);
      } catch {
        if (token !== this.requestToken || !this.appState.templateVisible) return;
        this.appState.templateState = "missing";
        this.render();
        this.statusBar.set("手本がありません。");
      }
    }

    render() {
      const showImage = this.appState.templateVisible && this.appState.templateState === "shown";
      const showMissing = this.appState.templateVisible && this.appState.templateState === "missing";
      this.imageEl.classList.toggle("hidden", !showImage);
      this.emptyEl.classList.toggle("hidden", !showMissing);

      if (!this.appState.templateVisible) {
        this.imageEl.classList.add("hidden");
        this.emptyEl.classList.add("hidden");
      }

      this.buttonEl.textContent = this.appState.templateVisible ? this.hideLabel : this.showLabel;
    }
  }

  // キャンバス描画を担当するクラス。
  // ポインタイベントの管理、座標の保存、再描画をここに集約している。
  class StrokeCanvas {
    constructor(canvasEl, containerEl) {
      this.canvasEl = canvasEl;
      this.containerEl = containerEl;
      this.ctx = this.canvasEl.getContext("2d");
      this.strokes = [];
      this.activeStroke = null;
      this.activePointerId = null;
      this.handlers = null;
      this.resizeObserver = null;
    }

    mount() {
      this.setupStyle();
      this.resize();
      this.bindPointerEvents();

      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.containerEl);
    }

    unmount() {
      if (this.handlers) {
        this.canvasEl.removeEventListener("pointerdown", this.handlers.down);
        this.canvasEl.removeEventListener("pointermove", this.handlers.move);
        this.canvasEl.removeEventListener("pointerup", this.handlers.up);
        this.canvasEl.removeEventListener("pointercancel", this.handlers.up);
        this.canvasEl.removeEventListener("pointerleave", this.handlers.up);
        this.handlers = null;
      }

      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
    }

    setupStyle() {
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.strokeStyle = "#1d2935";
      this.ctx.lineWidth = 5;
    }

    bindPointerEvents() {
      this.handlers = {
        down: (event) => this.onPointerDown(event),
        move: (event) => this.onPointerMove(event),
        up: (event) => this.onPointerUp(event),
      };

      this.canvasEl.addEventListener("pointerdown", this.handlers.down);
      this.canvasEl.addEventListener("pointermove", this.handlers.move);
      this.canvasEl.addEventListener("pointerup", this.handlers.up);
      this.canvasEl.addEventListener("pointercancel", this.handlers.up);
      this.canvasEl.addEventListener("pointerleave", this.handlers.up);
    }

    resize() {
      const rect = this.containerEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const ratio = window.devicePixelRatio || 1;
      this.canvasEl.width = Math.round(rect.width * ratio);
      this.canvasEl.height = Math.round(rect.height * ratio);
      this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.redraw();
    }

    clear() {
      this.reset();
    }

    reset() {
      this.strokes = [];
      this.activeStroke = null;
      this.activePointerId = null;
      this.redraw();
    }

    getStrokes() {
      return this.strokes.map((stroke) => stroke.map((p) => ({ ...p })));
    }

    setStrokes(strokes) {
      this.strokes = strokes.map((stroke) => stroke.map((p) => ({ ...p })));
      this.redraw();
    }

    redraw() {
      this.ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
      for (const stroke of this.strokes) {
        this.drawStroke(stroke);
      }
    }

    drawStroke(stroke) {
      if (!stroke.length) return;

      this.ctx.beginPath();
      this.ctx.moveTo(stroke[0].x, stroke[0].y);

      if (stroke.length === 1) {
        this.ctx.lineTo(stroke[0].x + 0.01, stroke[0].y + 0.01);
      } else {
        for (let i = 1; i < stroke.length; i += 1) {
          this.ctx.lineTo(stroke[i].x, stroke[i].y);
        }
      }

      this.ctx.stroke();
    }

    onPointerDown(event) {
      if (this.activePointerId !== null) return;
      event.preventDefault();

      this.activePointerId = event.pointerId;
      this.canvasEl.setPointerCapture(event.pointerId);

      const point = this.getPoint(event);
      this.activeStroke = [point];
      this.strokes.push(this.activeStroke);
      this.redraw();
    }

    onPointerMove(event) {
      if (this.activePointerId !== event.pointerId || !this.activeStroke) return;
      event.preventDefault();

      const point = this.getPoint(event);
      const last = this.activeStroke[this.activeStroke.length - 1];
      const dx = point.x - last.x;
      const dy = point.y - last.y;

      if ((dx * dx) + (dy * dy) < 2.25) return;

      this.activeStroke.push(point);
      this.redraw();
    }

    onPointerUp(event) {
      if (this.activePointerId !== event.pointerId) return;
      event.preventDefault();

      if (this.canvasEl.hasPointerCapture(event.pointerId)) {
        this.canvasEl.releasePointerCapture(event.pointerId);
      }

      this.activePointerId = null;
      this.activeStroke = null;
    }

    getPoint(event) {
      const rect = this.canvasEl.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }
  }

  // 画面下のステータスメッセージ表示を管理する小さなクラス。
  class StatusBar {
    constructor(el, appState) {
      this.el = el;
      this.appState = appState;
    }

    set(message) {
      this.appState.lastStatusMessage = message;
      this.el.textContent = message;
    }

    restore() {
      this.el.textContent = this.appState.lastStatusMessage || "";
    }
  }

  ns.TemplatePanel = TemplatePanel;
  ns.StrokeCanvas = StrokeCanvas;
  ns.StatusBar = StatusBar;
})(window.MathCalligraphy = window.MathCalligraphy || {});
