// 各画面のレイアウトとイベント橋渡しをまとめる。
(function registerPages(ns) {

  // ホームや一覧カードで使う、小さな文字プレビュー。
  function createSampleThumbMarkup(char) {
    const safeChar = ns.DomUtils.escapeHtml(char);
    const src = ns.DomUtils.escapeHtml(ns.sampleResolver(char));
    return `
      <span class="mini-sample">
        <img class="mini-sample-image" src="${src}" alt="${safeChar} の見本" data-fallback-char="${safeChar}">
        <span class="mini-sample-fallback hidden">${safeChar}</span>
      </span>
    `;
  }

  function hydrateSampleThumbs(root) {
    const images = root.querySelectorAll("img[data-fallback-char]");
    for (const image of images) {
      const fallback = image.parentElement?.querySelector(".mini-sample-fallback");
      if (!fallback) continue;
      image.addEventListener("error", () => {
        image.classList.add("hidden");
        fallback.classList.remove("hidden");
      }, { once: true });
    }
  }

  function formatLastPracticed(isoString) {
    if (!isoString) return "まだ練習記録はありません。";
    const date = new Date(isoString);
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    const hours = `${date.getHours()}`.padStart(2, "0");
    const minutes = `${date.getMinutes()}`.padStart(2, "0");
    return `前回: ${month}/${day} ${hours}:${minutes}`;
  }

  function sumCounts(values) {
    return values.reduce((total, value) => total + Number(value || 0), 0);
  }

  function createPraiseMarkup(settings) {
    const animated = settings?.praiseAnimationEnabled !== false;
    return `
      <div class="success-praise-area" aria-hidden="true">
        <img class="success-praise-character${animated ? " is-animated" : ""}" src="/picto/praise.png" alt="">
      </div>
    `;
  }

  function createConstructionCardMarkup(message = "工事中") {
    return `
      <div class="placeholder-card placeholder-card-inline">
        <h3>工事中</h3>
        <p>${ns.DomUtils.escapeHtml(message)}</p>
      </div>
    `;
  }

  class Page {
    constructor(router, deps) {
      this.router = router;
      this.deps = deps;
      this.root = null;
    }

    mount(root, _params) {
      this.root = root;
    }

    unmount() {
      if (this.root) this.root.innerHTML = "";
      this.root = null;
    }

    status(message, _seedText = "") {
      return message;
    }
  }

  class PlaceholderPage extends Page {
    constructor(router, deps, config) {
      super(router, deps);
      this.config = config;
    }

    mount(root) {
      super.mount(root);
      root.innerHTML = `
        <section class="page">
          <div class="page-head">
            <div>
              <h2>${ns.DomUtils.escapeHtml(this.config.title)}</h2>
              <p>${ns.DomUtils.escapeHtml(this.config.subtitle)}</p>
            </div>
            <div class="page-head-actions">
              <button id="placeholder-home-button" class="btn btn-ghost" type="button">ホームへ</button>
            </div>
          </div>
          <div class="placeholder-card">
            <h3>工事中</h3>
            <p>${ns.DomUtils.escapeHtml(this.config.message)}</p>
          </div>
        </section>
      `;

      const homeButton = root.querySelector("#placeholder-home-button");
      if (homeButton) {
        homeButton.addEventListener("click", () => this.router.navigate("/"));
      }
    }
  }

  function createPatternPreviewMarkup(pattern, options = {}) {
    const {
      wrapperClass = "formula-preview",
      imageClass = "formula-preview-image",
      fallbackClass = "formula-preview-fallback",
    } = options;
    const fallbackText = pattern?.expression || pattern?.label || "工事中";
    const src = ns.DomUtils.escapeHtml(ns.patternSampleResolver(pattern));
    const safeFallbackText = ns.DomUtils.escapeHtml(fallbackText);
    return `
      <div class="${ns.DomUtils.escapeHtml(wrapperClass)}">
        <img class="${ns.DomUtils.escapeHtml(imageClass)}" src="${src}" alt="${safeFallbackText} の見本" data-pattern-fallback-text="${safeFallbackText}">
        <span class="${ns.DomUtils.escapeHtml(fallbackClass)} hidden">${safeFallbackText}</span>
      </div>
    `;
  }

  function hydratePatternPreviewImages(root) {
    const images = root.querySelectorAll("img[data-pattern-fallback-text]");
    for (const image of images) {
      const fallback = image.parentElement?.querySelector(".formula-preview-fallback, .pattern-card-fallback");
      if (!fallback) continue;
      image.addEventListener("error", () => {
        image.classList.add("hidden");
        fallback.classList.remove("hidden");
      }, { once: true });
    }
  }

  // ホーム画面: 学習サマリーと3つの入口を並べる。
  class StartPage extends Page {
    mount(root) {
      super.mount(root);

      const settings = this.deps.settingsStore.get();
      const firstCharCategory = this.deps.contentRepository.getCharPracticeCategories()[0];
      const firstWordCategory = this.deps.contentRepository.getPatternCategories()[0];

      root.innerHTML = `
        <section class="page">
          <div class="page-head">
            <div>
              <h2>ホーム</h2>
            </div>
            <div class="page-head-actions">
            </div>
          </div>

          <div class="card-grid card-grid-home" id="start-menu-grid">
            <button type="button" class="menu-card menu-card-feature" id="start-char-button">
              <div class="card-preview card-preview-chars">
                ${(firstCharCategory?.previewChars || []).slice(0, 4).map((char) => createSampleThumbMarkup(char)).join("")}
              </div>
              <p class="menu-card-title">1文字練習</p>
            </button>
            <button type="button" class="menu-card menu-card-feature" id="start-word-button">
              ${firstWordCategory?.patterns?.[0]
                ? createPatternPreviewMarkup(firstWordCategory.patterns[0], {
                  wrapperClass: "card-preview card-preview-pattern",
                  imageClass: "formula-preview-image",
                  fallbackClass: "formula-preview-fallback",
                })
                : `<div class="card-preview card-preview-pattern"><p>${ns.DomUtils.escapeHtml(firstWordCategory?.previewText || "工事中")}</p></div>`}
              <p class="menu-card-title">短い表現で練習</p>
            </button>
            <button type="button" class="menu-card menu-card-feature" id="start-settings-button">
              <div class="card-preview card-preview-settings">
                <span>音量 ${settings.volumeLevel}/5</span>
                <span>演出 ${settings.praiseAnimationEnabled ? "ON" : "OFF"}</span>
                <span>名前変更</span>
              </div>
              <p class="menu-card-title">設定</p>
            </button>
          </div>
        </section>
      `;

      hydrateSampleThumbs(root);
      hydratePatternPreviewImages(root);

      root.querySelector("#start-char-button")?.addEventListener("click", () => {
        this.router.navigate("/practice/char");
      });
      root.querySelector("#start-word-button")?.addEventListener("click", () => {
        this.router.navigate("/practice/words");
      });
      root.querySelector("#start-settings-button")?.addEventListener("click", () => {
        this.router.navigate("/settings");
      });
    }
  }

  // 階層: スタート画面 -> 1文字練習 -> 文字の種類
  class CharGroupListPage extends Page {
    mount(root) {
      super.mount(root);
      const groups = this.deps.contentRepository.getCharPracticeCategories();

      root.innerHTML = `
        <section class="page">
          <div class="page-head">
            <div>
              <h2>1文字練習</h2>
            </div>
            <div class="page-head-actions">
              <button id="char-group-home-button" class="btn btn-ghost" type="button">ホームへ</button>
            </div>
          </div>
          <div class="card-grid" id="char-group-grid"></div>
        </section>
      `;

      root.querySelector("#char-group-home-button")?.addEventListener("click", () => {
        this.router.navigate("/");
      });

      const grid = root.querySelector("#char-group-grid");
      for (const group of groups) {
        const sets = this.deps.contentRepository.getCharSetsByGroupId(group.id);
        const totalPractice = sumCounts(sets.map((set) => sumCounts(
          set.chars.map((char) => this.deps.practiceTracker.getItemCount(`char:${set.id}`, char))
        )));
        const button = document.createElement("button");
        button.type = "button";
        button.className = "set-card set-card-detailed";
        button.innerHTML = `
          <div class="set-card-meta">
            <p class="set-card-title">${ns.DomUtils.escapeHtml(group.name)}</p>
            <p class="set-card-desc">${ns.DomUtils.escapeHtml(group.description || "")}</p>
          </div>
          <div class="set-card-preview">
            ${(group.previewChars || []).slice(0, 4).map((char) => createSampleThumbMarkup(char)).join("")}
          </div>
          <div class="set-card-foot">
            <span class="badge">${group.status === "construction" ? "工事中" : `${sets.length}セット`}</span>
            <span class="badge badge-soft">練習 ${totalPractice}回</span>
          </div>
        `;
        button.addEventListener("click", () => this.router.navigate(`/practice/char/${group.id}`));
        grid.append(button);
      }

      hydrateSampleThumbs(root);
    }
  }

  // 階層: スタート画面 -> 1文字練習 -> 文字の種類 -> 文字セット
  class CharSetListPage extends Page {
    mount(root, params) {
      super.mount(root);
      const group = this.deps.contentRepository.getCharPracticeCategoryById(params.groupId);
      if (!group) {
        this.router.navigate("/practice/char");
        return;
      }

      const sets = this.deps.contentRepository.getCharSetsByGroupId(group.id);

      root.innerHTML = `
        <section class="page">
          <div class="page-head">
            <div>
              <h2>1文字練習</h2>
              <p>${ns.DomUtils.escapeHtml(group.name)}</p>
            </div>
            <div class="page-head-actions">
              <button id="charset-back-button" class="btn btn-ghost" type="button">前の画面へ</button>
              <button id="charset-home-button" class="btn btn-ghost" type="button">ホームへ</button>
            </div>
          </div>
          <div class="page-section-intro">
          </div>
          <div class="card-grid card-grid-sets" id="char-set-grid"></div>
        </section>
      `;

      root.querySelector("#charset-back-button")?.addEventListener("click", () => {
        this.router.navigate("/practice/char");
      });
      root.querySelector("#charset-home-button")?.addEventListener("click", () => {
        this.router.navigate("/");
      });

      const grid = root.querySelector("#char-set-grid");
      if (group.status === "construction" || sets.length === 0) {
        grid.innerHTML = createConstructionCardMarkup(`${group.name} は工事中です。`);
        return;
      }

      for (const set of sets) {
        const totalPractice = sumCounts(
          set.chars.map((char) => this.deps.practiceTracker.getItemCount(`char:${set.id}`, char))
        );
        const button = document.createElement("button");
        button.type = "button";
        button.className = "set-card set-card-detailed set-card-wide-preview";
        button.innerHTML = `
          <div class="set-card-meta">
            <p class="set-card-title">${ns.DomUtils.escapeHtml(set.name)}</p>
          </div>
          <div class="set-card-preview set-card-preview-inline">
            ${set.chars.map((char) => createSampleThumbMarkup(char)).join("")}
          </div>
          <div class="set-card-foot">
            <span class="badge">${set.chars.length}文字</span>
            <span class="badge badge-soft">練習 ${totalPractice}回</span>
          </div>
        `;
        button.addEventListener("click", () => this.router.navigate(`/practice/char/${group.id}/${set.id}`));
        grid.append(button);
      }

      hydrateSampleThumbs(root);
    }
  }

  // 1文字練習の実行画面。
  // 左に手本、中央に書く場所、右に操作を寄せたレイアウトにしている。
  class CharPracticePage extends Page {
    constructor(router, deps) {
      super(router, deps);
      this.strokeCanvas = null;
      this.templatePanel = null;
      this.statusBar = null;
      this.dom = null;
      this.isScoring = false;
    }

    mount(root, params) {
      super.mount(root, params);

      const groupId = params.groupId;
      const setId = params.setId;
      const index = Number.parseInt(params.index ?? "0", 10);
      const startIndex = Number.isFinite(index) ? index : 0;
      const set = this.deps.contentRepository.getCharSetById(setId);

      if (!set || set.groupId !== groupId) {
        this.root.innerHTML = "";
        this.router.navigate(groupId ? `/practice/char/${groupId}` : "/practice/char");
        return;
      }

      const ok = this.deps.session.loadSet(setId, startIndex);
      if (!ok) {
        this.root.innerHTML = "";
        this.router.navigate(`/practice/char/${groupId}`);
        return;
      }

      this.deps.appState.currentCharRoute = {
        groupId: this.deps.session.getGroupId(),
        setId: this.deps.session.getSetId(),
        index: this.deps.session.getCurrentIndex(),
      };
      this.deps.appState.resetPracticeUi();

      this.root.innerHTML = this.template();
      this.dom = this.queryDom();
      this.statusBar = new ns.StatusBar(this.dom.statusMessage, this.deps.appState);
      this.strokeCanvas = new ns.StrokeCanvas(this.dom.canvas, this.dom.canvasStage);
      this.strokeCanvas.mount();

      // 手本は独立した表示エリアに出し、キャンバスとは分離して見やすくする。
      this.templatePanel = new ns.TemplatePanel({
        root: this.dom.canvasStage,
        imageEl: this.dom.templateImage,
        emptyEl: this.dom.templateEmpty,
        buttonEl: this.dom.templateButton,
        appState: this.deps.appState,
        // テスト用に、下書き表示でも sample 画像を使う。
        resolver: { resolve: ns.sampleResolver },
        loader: this.deps.templateLoader,
        statusBar: this.statusBar,
        statusLabel:"下書き",
        showLabel: "下書きを表示",
        hideLabel: "下書きを隠す",
      });

      this.bindEvents();
      this.render();
      this.statusBar.set(this.status(`${this.deps.session.getSetName()} を始めました。`, this.deps.session.getCurrent()));
    }

    unmount() {
      this.invalidateAlikeCheck();
      this.isAlikeChecking = false;
      if (this.strokeCanvas) {
        this.strokeCanvas.unmount();
        this.strokeCanvas = null;
      }
      this.templatePanel = null;
      this.statusBar = null;
      this.dom = null;
      super.unmount();
    }

    template() {
      return `
        <section class="page">
          <div class="page-head">
            <div>
              <h2>1文字練習</h2>
              <p id="set-name"></p>
            </div>
          </div>

          <div class="practice-layout practice-layout-char">
            <section class="reference-column">

              <div class="reference-panel">
                <div class="panel-head">
                  <div>
                    <p class="label">手本</p>
                  </div>
                </div>
                <div class="reference-stage" id="reference-stage">
                  <img id="sample-image" class="sample-image hidden" alt="">
                  <div id="sample-empty" class="sample-empty hidden">手本がありません</div>
                </div>
                <p id="page-indicator" class="page-indicator"></p>
                <p id="practice-count" class="sub-count"></p>
              </div>
            </section>

            <section class="canvas-panel practice-canvas-panel">
              <div class="canvas-toolbar">
                <p>手本を見ながら書き写してください</p>
              </div>
              <div class="canvas-stage" id="canvas-stage">
                <div id="score-display" class="score-display hidden">一致度: 0%</div>
                <img id="template-image" class="template-image hidden" alt="">
                <div id="template-empty" class="template-empty hidden">下書きがありません</div>
                <img id="alike-image" class="hidden" alt="" aria-hidden="true">
                <canvas id="draw-canvas" class="draw-canvas" aria-label="文字を書くキャンバス"></canvas>
              </div>
            </section>

            <aside class="practice-side">
              <div class="actions">
                <button id="template-button" class="btn btn-primary" type="button">下書きを表示</button>
                <div class="action-row action-row-practice" role="group" aria-label="練習操作">
                  <button id="clear-button" class="btn btn-secondary" type="button">文字を消去</button>
                  <button id="score-button" class="btn btn-secondary" type="button">採点する</button>
                </div>
                <div class="action-row action-row-progress" role="group" aria-label="進行操作">
                  <button id="prev-button" class="btn btn-ghost" type="button">前の文字へ</button>
                  <button id="next-button" class="btn btn-accent" type="button">次の文字へ</button>
                </div>
                <div class="action-row action-row-nav" role="group" aria-label="画面移動">
                  <button id="back-list-button" class="btn btn-ghost" type="button">セット一覧へ</button>
                  <button id="home-button" class="btn btn-ghost" type="button">ホームへ</button>
                </div>
              </div>
            </aside>
          </div>

          <div id="alike-notice-popup" class="alike-notice-popup hidden" role="status" aria-live="assertive" aria-atomic="true">
            <div class="alike-notice-card">
              <img class="alike-notice-image" src="${window.location.protocol === "file:" ? "./picto/alikeNotice.png" : "/picto/alikeNotice.png"}" alt="">
              <p id="alike-notice-text" class="alike-notice-text"></p>
            </div>
          </div>
        </section>
      `;
    }

    queryDom() {
      return {
        setName: this.root.querySelector("#set-name"),
        pageIndicator: this.root.querySelector("#page-indicator"),
        practiceCount: this.root.querySelector("#practice-count"),
        templateButton: this.root.querySelector("#template-button"),
        clearButton: this.root.querySelector("#clear-button"),
        scoreButton: this.root.querySelector("#score-button"),
        prevButton: this.root.querySelector("#prev-button"),
        nextButton: this.root.querySelector("#next-button"),
        backListButton: this.root.querySelector("#back-list-button"),
        homeButton: this.root.querySelector("#home-button"),
        referenceStage: this.root.querySelector("#reference-stage"),
        templatePlaceholder: this.root.querySelector("#template-placeholder"),
        templateImage: this.root.querySelector("#template-image"),
        templateEmpty: this.root.querySelector("#template-empty"),
        alikeImage: this.root.querySelector("#alike-image"),
        sampleImage: this.root.querySelector("#sample-image"),
        sampleEmpty: this.root.querySelector("#sample-empty"),
        canvasStage: this.root.querySelector("#canvas-stage"),
        canvas: this.root.querySelector("#draw-canvas"),
        scoreDisplay: this.root.querySelector("#score-display"),
        alikeNoticePopup: this.root.querySelector("#alike-notice-popup"),
        alikeNoticeText: this.root.querySelector("#alike-notice-text"),
      };
    }

    bindEvents() {
      this.dom.templateButton.addEventListener("click", async () => {
        this.templatePanel.setCurrentChar(this.deps.session.getCurrent());
        await this.templatePanel.toggle();
        this.renderReferencePlaceholder();
      });

      // ペンが止まってから 1.5 秒後にだけ、似字チェックを走らせる。
      this.dom.canvas.addEventListener("pointerdown", () => {
        this.invalidateAlikeCheck();
      });
      this.dom.canvas.addEventListener("pointerup", () => {
        this.scheduleAlikeCheck();
      });
      this.dom.canvas.addEventListener("pointercancel", () => {
        this.invalidateAlikeCheck();
      });

      this.dom.clearButton.addEventListener("click", () => {
        this.invalidateAlikeCheck();
        this.strokeCanvas.clear();
        this.resetScoreDisplay();
        this.statusBar.set(this.status("文字を消しました。", this.deps.session.getCurrent()));
      });

      this.dom.scoreButton.addEventListener("click", async () => {
        await this.scoreDrawing();
      });

      this.dom.prevButton.addEventListener("click", () => {
        if (!this.deps.session.prev()) {
          this.statusBar.set(this.status("このセットの最初の文字です。", this.deps.session.getCurrent()));
          return;
        }

        this.onCharacterChanged("前の文字に戻りました。");
        this.router.navigate(this.currentRoutePath(), { replace: true });
      });

      this.dom.nextButton.addEventListener("click", () => {
        this.recordCurrentPractice();
        if (!this.deps.session.canGoNext()) {
          // 最後の文字で終了画面へ進むときだけ歓声を流す。
          this.deps.soundEffects.playCelebration();
          this.router.navigate(this.currentSuccessRoutePath(), { replace: true });
          return;
        }

        this.deps.session.next();
        this.onCharacterChanged("次の文字に進みました。");
        this.router.navigate(this.currentRoutePath(), { replace: true });
      });

      this.dom.backListButton.addEventListener("click", () => {
        this.router.navigate(`/practice/char/${this.deps.session.getGroupId()}`);
      });

      this.dom.homeButton.addEventListener("click", () => {
        this.router.navigate("/");
      });

      this.dom.alikeNoticePopup?.addEventListener("click", () => {
        this.hideAlikeNotice();
      });
    }

    // 「次へ」で進むタイミングに、現在の文字の練習回数を記録する。
    recordCurrentPractice() {
      const currentChar = this.deps.session.getCurrent();
      const strokes = this.strokeCanvas.getStrokes();
      if (!currentChar || strokes.length === 0) return false;

      this.deps.practiceTracker.recordPractice({
        mode: "char",
        bucketId: `char:${this.deps.session.getSetId()}`,
        itemId: currentChar,
        label: currentChar,
        strokeCount: strokes.length,
      });
      return true;
    }

    onCharacterChanged(message) {
      this.invalidateAlikeCheck();
      this.deps.appState.currentCharRoute = {
        groupId: this.deps.session.getGroupId(),
        setId: this.deps.session.getSetId(),
        index: this.deps.session.getCurrentIndex(),
      };
      this.deps.appState.resetPracticeUi();
      this.strokeCanvas.reset();
      this.resetScoreDisplay();
      this.templatePanel.reset();
      this.render();
      this.statusBar.set(this.status(`${message}（${this.deps.session.getCurrent()}）`, this.deps.session.getCurrent()));
    }

    currentRoutePath() {
      return `/practice/char/${this.deps.session.getGroupId()}/${this.deps.session.getSetId()}/${this.deps.session.getCurrentIndex()}`;
    }

    currentSuccessRoutePath() {
      return `/practice/char/${this.deps.session.getGroupId()}/${this.deps.session.getSetId()}/success`;
    }

    // browser では比較用マスクを作り、実際の一致度計算は server に依頼する。
    async scoreDrawing() {
      if (this.isScoring) return;

      const currentChar = this.deps.session.getCurrent();
      const strokes = this.strokeCanvas.getStrokes();
      if (!currentChar || strokes.length === 0) {
        this.statusBar.set("採点するには文字を書いてください。");
        return;
      }

      const sampleImage = this.dom.sampleImage;
      if (!sampleImage || !sampleImage.complete || sampleImage.naturalWidth === 0) {
        this.statusBar.set("手本画像が読み込まれていません。");
        return;
      }

      try {
        this.setScoreLoading(true);
        const score = await this.requestScoreAgainstImage(sampleImage);
        this.dom.scoreDisplay.textContent = `一致度: ${score}%`;
        this.dom.scoreDisplay.classList.remove("hidden");
        // IPO: 採点結果が90%以上なら、採点達成時の歓声音を再生する。
        if (score >= 90) {
          this.deps.soundEffects.playScorePraise();
        }
        this.statusBar.set(`採点完了: 一致度 ${score}%`);
      } catch (error) {
        this.statusBar.set(this.getScoringErrorMessage(error));
        console.error("Scoring error:", error);
      } finally {
        this.setScoreLoading(false);
      }
    }

    // 同じ採点 API を使って、任意の比較画像との一致度を返す。
    async requestScoreAgainstImage(sampleImage) {
      const strokes = this.strokeCanvas.getStrokes();
      const payload = this.createScoringPayload(sampleImage, strokes, this.strokeCanvas.canvasEl);
      const result = await this.deps.scoringClient.scoreDrawing(payload);
      return ns.clampNumber(Number(result?.score ?? 0), 0, 100);
    }

    scheduleAlikeCheck() {
      this.cancelAlikeCheck();
      if (!ns.resolveAlikeChar(this.deps.session.getCurrent())) return;
      if (this.strokeCanvas.getStrokes().length === 0) return;

      const checkVersion = this.alikeCheckVersion || 0;
      this.alikeCheckTimeoutId = window.setTimeout(() => {
        this.alikeCheckTimeoutId = null;
        this.checkAlikeCharacter(checkVersion);
      }, 1000);
    }

    cancelAlikeCheck() {
      if (!this.alikeCheckTimeoutId) return;
      window.clearTimeout(this.alikeCheckTimeoutId);
      this.alikeCheckTimeoutId = null;
    }

    invalidateAlikeCheck() {
      this.alikeCheckVersion = (this.alikeCheckVersion || 0) + 1;
      this.cancelAlikeCheck();
      this.hideAlikeNotice();
    }

    // IPO: 似字画像との一致度が高いときは、注意ポップアップを表示する。
    async checkAlikeCharacter(checkVersion) {
      if (this.isScoring || this.isAlikeChecking) return;

      const alikeChar = ns.resolveAlikeChar(this.deps.session.getCurrent());
      const alikeImage = this.dom.alikeImage;
      const strokes = this.strokeCanvas.getStrokes();
      if (!alikeChar || !alikeImage || strokes.length === 0) return;
      if (!alikeImage.complete || alikeImage.naturalWidth === 0) return;

      try {
        this.isAlikeChecking = true;
        const score = await this.requestScoreAgainstImage(alikeImage);
        if (checkVersion !== (this.alikeCheckVersion || 0)) return;
        if (score >= 45) {
          this.showAlikeNotice(`${alikeChar} に似ているので注意!`);
        }
      } catch (error) {
        console.error("Alike check error:", error);
      } finally {
        this.isAlikeChecking = false;
      }
    }

    // 似字警告は画像付きのポップアップで表示し、同時に通知音を鳴らす。
    showAlikeNotice(message) {
      const popupEl = this.dom.alikeNoticePopup;
      const textEl = this.dom.alikeNoticeText;
      if (!popupEl || !textEl) return;

      if (this.alikeNoticeHideTimeoutId) {
        window.clearTimeout(this.alikeNoticeHideTimeoutId);
      }

      textEl.textContent = message;
      popupEl.classList.remove("hidden");
      popupEl.classList.add("is-visible");
      this.deps.soundEffects.playAlikeNotice();

      this.alikeNoticeHideTimeoutId = window.setTimeout(() => {
        this.hideAlikeNotice();
      }, 3600);
    }

    hideAlikeNotice() {
      const popupEl = this.dom?.alikeNoticePopup;
      if (this.alikeNoticeHideTimeoutId) {
        window.clearTimeout(this.alikeNoticeHideTimeoutId);
        this.alikeNoticeHideTimeoutId = null;
      }
      if (!popupEl) return;
      popupEl.classList.add("hidden");
      popupEl.classList.remove("is-visible");
    }

    // 比較用データは browser で作るが、送信量を減らすため固定サイズへ縮小する。
    createScoringPayload(sampleImg, userStrokes, canvasEl) {
      const analysisSize = this.getAnalysisSize(canvasEl);
      const sampleCanvas = this.createAnalysisCanvas(analysisSize);
      const userCanvas = this.createAnalysisCanvas(analysisSize);
      const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });
      const userCtx = userCanvas.getContext("2d", { willReadFrequently: true });

      this.drawFittedSampleImage(sampleCtx, sampleImg, canvasEl, analysisSize);
      this.drawScaledStrokes(userCtx, userStrokes, canvasEl, analysisSize);

      const sampleMask = this.extractMaskIndices(
        sampleCtx.getImageData(0, 0, analysisSize.width, analysisSize.height),
        ({ r, g, b, a }) => a > 24 && ((r + g + b) / 3) < 200
      );
      const userMask = this.extractMaskIndices(
        userCtx.getImageData(0, 0, analysisSize.width, analysisSize.height),
        ({ a }) => a > 24
      );

      if (sampleMask.length === 0) {
        throw new Error("手本画像から比較用の線を取得できませんでした。");
      }

      if (userMask.length === 0) {
        throw new Error("描画データが小さすぎて採点できませんでした。");
      }

      return {
        setId: this.deps.session.getSetId(),
        char: this.deps.session.getCurrent(),
        analysisVersion: "browser-rasterized-mask-v1",
        canvas: analysisSize,
        sampleMask,
        userMask,
      };
    }

    createAnalysisCanvas({ width, height }) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      return canvas;
    }

    // 実際のキャンバスと同じ contain 配置で手本画像を描く。
    drawFittedSampleImage(ctx, sampleImg, canvasEl, { width, height }) {
      const sourceWidth = Math.max(1, canvasEl.clientWidth || canvasEl.width || width);
      const sourceHeight = Math.max(1, canvasEl.clientHeight || canvasEl.height || height);
      const paddingX = 22 * (width / sourceWidth);
      const paddingY = 22 * (height / sourceHeight);
      const innerWidth = Math.max(1, width - (paddingX * 2));
      const innerHeight = Math.max(1, height - (paddingY * 2));
      const imgAspect = sampleImg.naturalWidth / sampleImg.naturalHeight;
      const canvasAspect = innerWidth / innerHeight;
      let drawWidth;
      let drawHeight;
      let offsetX;
      let offsetY;

      if (imgAspect > canvasAspect) {
        drawWidth = innerWidth;
        drawHeight = innerWidth / imgAspect;
        offsetX = paddingX;
        offsetY = paddingY + ((innerHeight - drawHeight) / 2);
      } else {
        drawHeight = innerHeight;
        drawWidth = innerHeight * imgAspect;
        offsetX = paddingX + ((innerWidth - drawWidth) / 2);
        offsetY = paddingY;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(sampleImg, offsetX, offsetY, drawWidth, drawHeight);
    }

    // ユーザー線を縮小した比較用キャンバスへ描き直す。
    drawScaledStrokes(ctx, userStrokes, canvasEl, { width, height }) {
      const sourceWidth = Math.max(1, canvasEl.clientWidth || canvasEl.width || width);
      const sourceHeight = Math.max(1, canvasEl.clientHeight || canvasEl.height || height);
      const scaleX = width / sourceWidth;
      const scaleY = height / sourceHeight;

      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "#1d2935";
      ctx.lineWidth = Math.max(1.25, 5 * ((scaleX + scaleY) / 2));
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      for (const stroke of userStrokes) {
        if (!stroke.length) continue;

        ctx.beginPath();
        ctx.moveTo(stroke[0].x * scaleX, stroke[0].y * scaleY);

        if (stroke.length === 1) {
          ctx.lineTo((stroke[0].x * scaleX) + 0.01, (stroke[0].y * scaleY) + 0.01);
        } else {
          for (let i = 1; i < stroke.length; i += 1) {
            ctx.lineTo(stroke[i].x * scaleX, stroke[i].y * scaleY);
          }
        }

        ctx.stroke();
      }
    }

    // ImageData を走査して、条件に合うピクセルだけを server へ送る。
    extractMaskIndices(imageData, predicate) {
      const indices = [];
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const pixel = {
          r: data[i],
          g: data[i + 1],
          b: data[i + 2],
          a: data[i + 3],
        };

        if (predicate(pixel)) {
          indices.push(i / 4);
        }
      }

      return indices;
    }

    getAnalysisSize(canvasEl) {
      const sourceWidth = Math.max(64, Math.round(canvasEl.clientWidth || canvasEl.width || 64));
      const sourceHeight = Math.max(64, Math.round(canvasEl.clientHeight || canvasEl.height || 64));
      const maxSide = 128;
      const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));

      return {
        width: Math.max(48, Math.round(sourceWidth * scale)),
        height: Math.max(48, Math.round(sourceHeight * scale)),
      };
    }

    setScoreLoading(loading) {
      this.isScoring = loading;
      this.dom.scoreButton.disabled = loading;
      this.dom.scoreButton.textContent = loading ? "採点中..." : "採点する";
    }

    resetScoreDisplay() {
      this.dom.scoreDisplay.textContent = "一致度: 0%";
      this.dom.scoreDisplay.classList.add("hidden");
    }

    getScoringErrorMessage(error) {
      if (error instanceof TypeError) {
        return "採点サーバーに接続できません。node backend/server.js を起動してください。";
      }

      if (error?.message) {
        return `採点中にエラーが発生しました。${error.message}`;
      }

      return "採点中にエラーが発生しました。";
    }

    updateActionLabels() {
      const canGoPrev = this.deps.session.canGoPrev();
      this.dom.prevButton.classList.toggle("btn-slot-hidden", !canGoPrev);
      this.dom.prevButton.disabled = !canGoPrev;
      this.dom.nextButton.disabled = false;
      this.dom.nextButton.textContent = this.deps.session.canGoNext() ? "次の文字へ" : "練習終了へ";
    }

    renderSampleImage(currentChar) {
      const src = ns.sampleResolver(currentChar);
      const imageEl = this.dom.sampleImage;
      const emptyEl = this.dom.sampleEmpty;

      if (!imageEl || !emptyEl) return;

      imageEl.onload = () => {
        imageEl.classList.remove("hidden");
        emptyEl.classList.add("hidden");
      };

      imageEl.onerror = () => {
        imageEl.classList.add("hidden");
        emptyEl.textContent = `手本がありません（${currentChar}）`;
        emptyEl.classList.remove("hidden");
      };

      imageEl.alt = `手本: ${currentChar}`;
      imageEl.src = src;
    }

    // 似字チェック用の画像は DOM に置くだけにして、画面上には見せない。
    renderAlikeImage(currentChar) {
      const imageEl = this.dom.alikeImage;
      if (!imageEl) return;

      const src = ns.alikeResolver(currentChar);
      if (!src) {
        imageEl.removeAttribute("src");
        return;
      }

      imageEl.src = src;
    }

    renderReferencePlaceholder() {
      if (!this.dom.templatePlaceholder) return;
      const visible = this.deps.appState.templateVisible;
      this.dom.templatePlaceholder.classList.toggle("hidden", visible);
    }

    render() {
      const setName = this.deps.session.getSetName();
      const currentChar = this.deps.session.getCurrent();
      const currentIndex = this.deps.session.getCurrentIndex();
      const total = this.deps.session.getTotalCount();
      const practiced = this.deps.practiceTracker.getItemCount(`char:${this.deps.session.getSetId()}`, currentChar);

      this.dom.setName.textContent = setName;
      this.renderSampleImage(currentChar);
      this.renderAlikeImage(currentChar);
      this.dom.pageIndicator.textContent = `${currentIndex + 1}/${total}`;
      this.dom.practiceCount.textContent = `これまでに ${practiced} 回練習`;

      this.templatePanel.setCurrentChar(currentChar);
      this.templatePanel.render();
      this.renderReferencePlaceholder();
      this.updateActionLabels();
    }
  }

  class CharPracticeSuccessPage extends Page {
    mount(root, params) {
      super.mount(root, params);

      const groupId = params.groupId;
      const setId = params.setId;
      const set = this.deps.contentRepository.getCharSetById(setId);
      if (!set || set.groupId !== groupId) {
        this.router.navigate(groupId ? `/practice/char/${groupId}` : "/practice/char");
        return;
      }

      const totalPractice = sumCounts(
        set.chars.map((char) => this.deps.practiceTracker.getItemCount(`char:${set.id}`, char))
      );
      const settings = this.deps.settingsStore.get();

      root.innerHTML = `
        <section class="page success-page">
          <div class="page-head">
            <div>
              <h2>1文字練習: 終了</h2>
              <p>${ns.DomUtils.escapeHtml(set.name)}</p>
            </div>
            <div class="page-head-actions">
              <button id="success-home-button" class="btn btn-ghost" type="button">ホーム</button>
            </div>
          </div>

          <div class="success-center">
            <p class="success-title">練習終わり！</p>
            <p class="success-subtitle">練習回数:  ${totalPractice} 回</p>
            ${createPraiseMarkup(settings)}
          </div>
        </section>
      `;

      root.querySelector("#success-home-button")?.addEventListener("click", () => {
        this.router.navigate("/");
      });
    }
  }

  // 「短い表現で練習」のカテゴリ一覧。
  class WordCategoryListPage extends Page {
    mount(root) {
      super.mount(root);
      const categories = this.deps.contentRepository.getPatternCategories();

      root.innerHTML = `
        <section class="page">
          <div class="page-head">
            <div>
              <h2>短い表現で練習</h2>
            </div>
            <div class="page-head-actions">
              <button id="word-home-button" class="btn btn-ghost" type="button">ホームへ</button>
            </div>
          </div>
          <div class="card-grid" id="word-category-grid"></div>
        </section>
      `;

      root.querySelector("#word-home-button")?.addEventListener("click", () => {
        this.router.navigate("/");
      });

      const grid = root.querySelector("#word-category-grid");
      for (const category of categories) {
        const practiceCount = sumCounts(
          category.patterns.map((pattern) => this.deps.practiceTracker.getItemCount(`word:${category.id}`, pattern.id))
        );
        const button = document.createElement("button");
        button.type = "button";
        button.className = "set-card set-card-detailed";
        button.innerHTML = `
          <div class="set-card-meta">
            <p class="set-card-title">${ns.DomUtils.escapeHtml(category.name)}</p>
          </div>
          ${category.patterns[0]
            ? createPatternPreviewMarkup(category.patterns[0], {
              wrapperClass: "formula-preview",
              imageClass: "formula-preview-image",
              fallbackClass: "formula-preview-fallback",
            })
            : `<div class="formula-preview">${ns.DomUtils.escapeHtml(category.previewText || "工事中")}</div>`}
          <div class="set-card-foot">
            <span class="badge">${category.status === "construction" ? "工事中" : `${category.patterns.length}項目`}</span>
            <span class="badge badge-soft">練習 ${practiceCount}回</span>
          </div>
        `;
        button.addEventListener("click", () => this.router.navigate(`/practice/words/${category.id}`));
        grid.append(button);
      }

      hydratePatternPreviewImages(root);
    }
  }

  // カテゴリを開いた後の、練習パターン選択画面。
  class WordPatternListPage extends Page {
    mount(root, params) {
      super.mount(root, params);
      const category = this.deps.contentRepository.getPatternCategoryById(params.categoryId);
      if (!category) {
        this.router.navigate("/practice/words");
        return;
      }

      root.innerHTML = `
        <section class="page">
          <div class="page-head">
            <div>
              <h2>短い表現で練習</h2>
              <p>${ns.DomUtils.escapeHtml(category.name)}</p>
            </div>
            <div class="page-head-actions">
              <button id="word-back-button" class="btn btn-ghost" type="button">前の画面へ</button>
              <button id="word-list-home-button" class="btn btn-ghost" type="button">ホームへ</button>
            </div>
          </div>
          <div class="pattern-list" id="pattern-list"></div>
        </section>
      `;

      root.querySelector("#word-back-button")?.addEventListener("click", () => {
        this.router.navigate("/practice/words");
      });
      root.querySelector("#word-list-home-button")?.addEventListener("click", () => {
        this.router.navigate("/");
      });

      const list = root.querySelector("#pattern-list");
      if (category.status === "construction" || category.patterns.length === 0) {
        list.innerHTML = createConstructionCardMarkup(`${category.name} は工事中です。`);
        return;
      }

      for (const pattern of category.patterns) {
        if (pattern.status === "construction") {
          const placeholder = document.createElement("div");
          placeholder.innerHTML = createConstructionCardMarkup(`${pattern.label || category.name} は工事中です。`);
          list.append(placeholder.firstElementChild);
          continue;
        }

        const button = document.createElement("button");
        button.type = "button";
        button.className = "pattern-card";
        button.innerHTML = `
          <p class="pattern-card-title">${ns.DomUtils.escapeHtml(pattern.label)}</p>
          ${createPatternPreviewMarkup(pattern, {
            wrapperClass: "pattern-card-expression",
            imageClass: "pattern-card-image",
            fallbackClass: "pattern-card-fallback",
          })}
        `;
        button.addEventListener("click", () => {
          this.router.navigate(`/practice/words/${category.id}/${pattern.id}`);
        });
        list.append(button);
      }

      hydratePatternPreviewImages(root);
    }
  }

  // 短い表現の練習画面。
  // 上に手本、下にノート風キャンバス、右に操作を置く構成。
  class WordPracticePage extends Page {
    constructor(router, deps) {
      super(router, deps);
      this.strokeCanvas = null;
      this.statusBar = null;
      this.dom = null;
      this.guideVisible = false;
    }

    mount(root, params) {
      super.mount(root, params);

      const ok = this.deps.patternSession.loadCategory(params.categoryId, params.patternId);
      if (!ok) {
        this.router.navigate("/practice/words");
        return;
      }

      const category = this.deps.contentRepository.getPatternCategoryById(params.categoryId);
      const pattern = this.deps.patternSession.getCurrent();
      if (!category || category.status === "construction" || !pattern || pattern.status === "construction") {
        this.router.navigate(`/practice/words/${params.categoryId}`);
        return;
      }

      this.deps.appState.currentWordRoute = {
        categoryId: this.deps.patternSession.getCategoryId(),
        patternId: this.deps.patternSession.getCurrent()?.id ?? null,
      };

      // patternId を URL に持たせて、再読み込みでも同じ式を開けるようにする。
      this.root.innerHTML = this.template();
      this.dom = this.queryDom();
      this.statusBar = new ns.StatusBar(this.dom.statusMessage, this.deps.appState);
      this.strokeCanvas = new ns.StrokeCanvas(this.dom.canvas, this.dom.canvasStage);
      this.strokeCanvas.mount();

      this.bindEvents();
      this.render();
      this.statusBar.set(this.status(`${this.deps.patternSession.getCategoryName()} を始めました。`));
    }

    unmount() {
      if (this.strokeCanvas) {
        this.strokeCanvas.unmount();
        this.strokeCanvas = null;
      }
      this.statusBar = null;
      this.dom = null;
      super.unmount();
    }

    template() {
      return `
        <section class="page word-practice-page">
          <div class="page-head">
            <div>
              <h2>短い表現で練習</h2>
              <p id="word-category-name"></p>
            </div>
          </div>

          <div class="practice-layout practice-layout-words">
            <section class="word-main-panel">
              <div class="reference-panel word-model-panel">
                <div class="panel-head">
                  <div>
                    <p class="panel-caption" id="word-pattern-title"></p>
                    <p class="label">手本</p>
                  </div>
                  <button id="guide-button" class="btn btn-primary" type="button">下書きを表示</button>
                </div>
                <div class="reference-stage notebook-stage reference-stage-word">
                  <img id="word-model-image" class="word-stage-image hidden" alt="">
                  <div id="word-model-fallback" class="word-model-expression hidden"></div>
                </div>
                <p id="word-pattern-note" class="pattern-helper"></p>
              </div>

              <div class="canvas-panel notebook-panel">
                <div class="canvas-toolbar">
                </div>
                <div class="canvas-stage notebook-stage notebook-stage-practice" id="word-canvas-stage">
                  <img id="guide-overlay-image" class="word-stage-image word-stage-image-guide hidden" alt="">
                  <div id="guide-overlay-fallback" class="guide-overlay guide-overlay-fallback hidden"></div>
                  <canvas id="word-draw-canvas" class="draw-canvas" aria-label="式を書くキャンバス"></canvas>
                </div>
              </div>
            </section>

            <aside class="practice-side">
              <div class="current-char-card compact-card">
                <p class="practice-title" id="word-progress-label"></p>
                <p class="sub-count" id="word-practice-count"></p>
              </div>

              <div class="actions">
                <div class="action-row action-row-practice" role="group" aria-label="練習操作">
                  <button id="word-clear-button" class="btn btn-secondary" type="button">線を消去</button>
                </div>
                <div class="action-row action-row-progress" role="group" aria-label="進行操作">
                  <button id="word-prev-button" class="btn btn-ghost" type="button">前に戻る</button>
                  <button id="word-next-button" class="btn btn-accent" type="button">次へ進む</button>
                </div>
                <div class="action-row action-row-nav" role="group" aria-label="画面移動">
                  <button id="word-list-button" class="btn btn-ghost" type="button">選択画面へ</button>
                  <button id="word-home-button" class="btn btn-ghost" type="button">ホームへ</button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      `;
    }

    queryDom() {
      return {
        categoryName: this.root.querySelector("#word-category-name"),
        patternTitle: this.root.querySelector("#word-pattern-title"),
        modelImage: this.root.querySelector("#word-model-image"),
        modelFallback: this.root.querySelector("#word-model-fallback"),
        patternNote: this.root.querySelector("#word-pattern-note"),
        progressLabel: this.root.querySelector("#word-progress-label"),
        practiceCount: this.root.querySelector("#word-practice-count"),
        guideButton: this.root.querySelector("#guide-button"),
        guideImage: this.root.querySelector("#guide-overlay-image"),
        guideFallback: this.root.querySelector("#guide-overlay-fallback"),
        clearButton: this.root.querySelector("#word-clear-button"),
        prevButton: this.root.querySelector("#word-prev-button"),
        nextButton: this.root.querySelector("#word-next-button"),
        listButton: this.root.querySelector("#word-list-button"),
        homeButton: this.root.querySelector("#word-home-button"),
        canvasStage: this.root.querySelector("#word-canvas-stage"),
        canvas: this.root.querySelector("#word-draw-canvas"),
      };
    }

    bindEvents() {
      this.dom.guideButton.addEventListener("click", () => {
        this.guideVisible = !this.guideVisible;
        this.renderGuide();
        this.statusBar.set(this.status(
          this.guideVisible ? "下書きを表示しました。" : "下書きを隠しました。",
          this.deps.patternSession.getCurrent()?.id || ""
        ));
      });

      this.dom.clearButton.addEventListener("click", () => {
        this.strokeCanvas.clear();
        this.statusBar.set(this.status("線を消去しました。", this.deps.patternSession.getCurrent()?.id || ""));
      });

      this.dom.prevButton.addEventListener("click", () => {
        if (!this.deps.patternSession.prev()) {
          this.statusBar.set(this.status("このカテゴリの最初のパターンです。"));
          return;
        }
        this.onPatternChanged("前のパターンに戻りました。");
        this.router.navigate(this.currentRoutePath(), { replace: true });
      });

      this.dom.nextButton.addEventListener("click", () => {
        this.recordCurrentPractice();
        if (!this.deps.patternSession.canGoNext()) {
          // 最後の式で終了画面へ進むときだけ歓声を流す。
          this.deps.soundEffects.playCelebration();
          this.router.navigate(this.currentSuccessRoutePath(), { replace: true });
          return;
        }
        this.deps.patternSession.next();
        this.onPatternChanged("次のパターンに進みました。");
        this.router.navigate(this.currentRoutePath(), { replace: true });
      });

      this.dom.listButton.addEventListener("click", () => {
        this.router.navigate(`/practice/words/${this.deps.patternSession.getCategoryId()}`);
      });

      this.dom.homeButton.addEventListener("click", () => {
        this.router.navigate("/");
      });
    }

    recordCurrentPractice() {
      const pattern = this.deps.patternSession.getCurrent();
      const strokes = this.strokeCanvas.getStrokes();
      if (!pattern || strokes.length === 0) return false;

      this.deps.practiceTracker.recordPractice({
        mode: "word",
        bucketId: `word:${this.deps.patternSession.getCategoryId()}`,
        itemId: pattern.id,
        label: pattern.expression,
        strokeCount: strokes.length,
      });
      return true;
    }

    currentRoutePath() {
      const pattern = this.deps.patternSession.getCurrent();
      return `/practice/words/${this.deps.patternSession.getCategoryId()}/${pattern?.id || ""}`;
    }

    currentSuccessRoutePath() {
      return `/practice/words/${this.deps.patternSession.getCategoryId()}/success`;
    }

    onPatternChanged(message) {
      this.deps.appState.currentWordRoute = {
        categoryId: this.deps.patternSession.getCategoryId(),
        patternId: this.deps.patternSession.getCurrent()?.id ?? null,
      };
      this.strokeCanvas.reset();
      this.guideVisible = false;
      this.render();
      this.statusBar.set(this.status(message, this.deps.patternSession.getCurrent()?.id || ""));
    }

    // 「下書きを表示」で、式全体の薄いガイドをノート上に重ねる。
    renderGuide() {
      const pattern = this.deps.patternSession.getCurrent();

      if (!this.guideVisible) {
        this.dom.guideImage.classList.add("hidden");
        this.dom.guideFallback.classList.add("hidden");
        this.dom.guideButton.textContent = "下書きを表示";
        return;
      }

      this.renderPatternImage({
        imageEl: this.dom.guideImage,
        fallbackEl: this.dom.guideFallback,
        pattern,
        altPrefix: "下書き",
      });
      this.dom.guideButton.textContent = this.guideVisible ? "下書きを隠す" : "下書きを表示";
    }

    renderWordModel(pattern) {
      this.renderPatternImage({
        imageEl: this.dom.modelImage,
        fallbackEl: this.dom.modelFallback,
        pattern,
        altPrefix: "手本",
      });
    }

    renderPatternImage({ imageEl, fallbackEl, pattern, altPrefix }) {
      const src = ns.patternSampleResolver(pattern);

      imageEl.onload = () => {
        imageEl.classList.remove("hidden");
        fallbackEl.classList.add("hidden");
      };
      imageEl.onerror = () => {
        imageEl.classList.add("hidden");
        fallbackEl.textContent = pattern?.expression || "";
        fallbackEl.classList.remove("hidden");
      };
      imageEl.alt = `${altPrefix}: ${pattern?.label || pattern?.expression || ""}`;
      imageEl.src = src;
    }

    render() {
      const categoryName = this.deps.patternSession.getCategoryName();
      const pattern = this.deps.patternSession.getCurrent();
      const practiced = this.deps.practiceTracker.getItemCount(
        `word:${this.deps.patternSession.getCategoryId()}`,
        pattern?.id || ""
      );

      this.dom.categoryName.textContent = categoryName;
      this.dom.patternTitle.textContent = pattern?.label || "";
      this.renderWordModel(pattern);
      this.dom.patternNote.textContent = pattern?.note || "";
      this.dom.progressLabel.textContent = this.deps.patternSession.getProgressLabel();
      this.dom.practiceCount.textContent = `この式は ${practiced} 回練習`;
      this.dom.prevButton.classList.toggle("hidden", !this.deps.patternSession.canGoPrev());
      this.dom.nextButton.textContent = this.deps.patternSession.canGoNext() ? "次へ進む" : "練習終了";
      this.renderGuide();
    }
  }

  class WordPracticeSuccessPage extends Page {
    mount(root, params) {
      super.mount(root, params);
      const category = this.deps.contentRepository.getPatternCategoryById(params.categoryId);
      if (!category) {
        this.router.navigate("/practice/words");
        return;
      }

      const totalPractice = sumCounts(
        category.patterns.map((pattern) => this.deps.practiceTracker.getItemCount(`word:${category.id}`, pattern.id))
      );
      const settings = this.deps.settingsStore.get();

      root.innerHTML = `
        <section class="page success-page">
          <div class="page-head">
            <div>
              <h2>短い表現で練習: 終了</h2>
              <p>${ns.DomUtils.escapeHtml(category.name)}</p>
            </div>
            <div class="page-head-actions">
              <button id="word-success-home-button" class="btn btn-ghost" type="button">ホーム</button>
            </div>
          </div>

          <div class="success-center">
            <p class="success-title">練習終了</p>
            <p class="success-subtitle">このカテゴリの記録は ${totalPractice} 回です。</p>
            ${createPraiseMarkup(settings)}
          </div>
        </section>
      `;

      root.querySelector("#word-success-home-button")?.addEventListener("click", () => {
        this.router.navigate("/");
      });
    }
  }

  // 設定画面: 名前、音量、終了画面のアニメーション表示を編集する。
  class SettingsPage extends Page {
    mount(root) {
      super.mount(root);
      const settings = this.deps.settingsStore.get();
      
      root.innerHTML = `
        <section class="page">
          <div class="page-head">
            <div>
              <h2>設定</h2>
              <p>使い方に合わせて、表示や操作感を調整できます。</p>
            </div>
            <div class="page-head-actions">
              <button id="settings-home-button" class="btn btn-ghost" type="button">ホームへ</button>
            </div>
          </div>

          <div class="settings-layout">
            <form id="settings-form" class="settings-card">
              <label class="settings-field">
                <span class="settings-label">ユーザー名</span>
                <input id="settings-username" class="text-input" type="text" maxlength="20" value="${ns.DomUtils.escapeHtml(settings.username)}">
              </label>

              <label class="settings-field">
                <span class="settings-label">音量調整</span>
                <input id="settings-volume" type="range" min="0" max="5" step="1" value="${settings.volumeLevel}">
                <span id="settings-volume-label" class="inline-note">${settings.volumeLevel}/5</span>
              </label>

              <label class="settings-field settings-field-toggle">
                <span class="settings-label">アニメーション</span>
                <input id="settings-praise-animation" type="checkbox" ${settings.praiseAnimationEnabled ? "checked" : ""}>
              </label>

              <div class="settings-actions">
                <button class="btn btn-primary" type="submit">変更する</button>
                <button id="settings-reset-button" class="btn btn-secondary" type="button">初期設定に戻す</button>
                <p id="settings-save-message" class="settings-save-message hidden" aria-live="polite"></p>
              </div>
            </form>
          </div>
        </section>
        <section class="reference">
          <p> 音声は「効果音ラボ」 https://soundeffect-lab.info/，
          画像は「human pictogram 2.0」 https://pictogram2.com/ よりお借りしました． <p>
        </section>
      `;

      this.bindSettingsEvents();
    }

    bindSettingsEvents() {
      const homeButton = this.root.querySelector("#settings-home-button");
      const form = this.root.querySelector("#settings-form");
      const usernameInput = this.root.querySelector("#settings-username");
      const volumeInput = this.root.querySelector("#settings-volume");
      const volumeLabel = this.root.querySelector("#settings-volume-label");
      const praiseAnimationInput = this.root.querySelector("#settings-praise-animation");
      const resetButton = this.root.querySelector("#settings-reset-button");
      const saveMessage = this.root.querySelector("#settings-save-message");
      let saveTimeoutId = null;
      
      // フォーム値に合わせて、その場で補助表示を更新する。
      const syncSettingsForm = () => {
        volumeLabel.textContent = `${volumeInput.value}/5`;
      };

      const showSaveMessage = (message) => {
        if (!saveMessage) return;

        if (saveTimeoutId){
          window.clearTimeout(saveTimeoutId);
        }

        saveMessage.textContent = message;
        saveMessage.classList.remove("hidden");
        saveMessage.classList.add("is-visible");
        
        saveTimeoutId = window.setTimeout(() => {
          saveMessage.classList.remove("is-visible");
          saveMessage.classList.add("hidden")
          saveMessage.textContent = "";
        }, 2500);

      }; 
      
      homeButton?.addEventListener("click", () => {
        this.router.navigate("/");
      });

      volumeInput?.addEventListener("input", () => {
        this.deps.soundEffects.setVolumeLevel(Number(volumeInput.value));
        syncSettingsForm();
      });
      
      usernameInput?.addEventListener("input", () => {
        syncSettingsForm();
      });
      
      
      praiseAnimationInput?.addEventListener("change", () => {
        syncSettingsForm();
      });

      form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const next = this.deps.settingsStore.update({
          username: usernameInput.value,
          volumeLevel: Number(volumeInput.value),
          praiseAnimationEnabled: praiseAnimationInput.checked,
        });

        this.deps.soundEffects.setVolumeLevel(next.volumeLevel);
        syncSettingsForm();

        showSaveMessage("設定を変更しました。");
      });

      
      resetButton?.addEventListener("click", () => {
        const reset = this.deps.settingsStore.reset();
        usernameInput.value = reset.username;
        volumeInput.value = String(reset.volumeLevel);
        praiseAnimationInput.checked = reset.praiseAnimationEnabled;
        this.deps.soundEffects.setVolumeLevel(reset.volumeLevel);
        syncSettingsForm();
      });
    }
  }

  ns.Page = Page;
  ns.PlaceholderPage = PlaceholderPage;
  ns.StartPage = StartPage;
  ns.CharGroupListPage = CharGroupListPage;
  ns.CharSetListPage = CharSetListPage;
  ns.CharPracticePage = CharPracticePage;
  ns.CharPracticeSuccessPage = CharPracticeSuccessPage;
  ns.WordCategoryListPage = WordCategoryListPage;
  ns.WordPatternListPage = WordPatternListPage;
  ns.WordPracticePage = WordPracticePage;
  ns.WordPracticeSuccessPage = WordPracticeSuccessPage;
  ns.SettingsPage = SettingsPage;
})(window.MathCalligraphy = window.MathCalligraphy || {});
