// アプリ起動時の組み立て役。
// 各クラスを生成し、Router にまとめて渡して開始する。
(function registerBootstrap(ns) {
  class AppBootstrap {
    constructor(root) {
      this.root = root;

      this.headerSummaryRoot = document.getElementById("app-header-summary");

      // 1文字練習用データと、短い表現練習用データをまとめて渡す。
      this.contentRepository = new ns.ContentRepository({
        charSets: ns.practiceSetsData,
        patternCategories: ns.patternCategoriesData,
      });
      this.appState = new ns.AppState();
      this.session = new ns.PracticeSession(this.contentRepository);
      this.patternSession = new ns.PatternPracticeSession(this.contentRepository);
      this.templateResolver = new ns.TemplateResolver(ns.charSlugMap);
      this.templateLoader = new ns.TemplateLoader();
      this.scoringClient = new ns.ScoringClient();
      // ホーム/設定/進捗表示で使う永続データ。
      this.settingsStore = new ns.SettingsStore(ns.settingsDefaults);
      this.practiceTracker = new ns.PracticeTracker();
      this.soundEffects = new ns.SoundEffects(this.settingsStore.get().volumeLevel);
      this.router = null;
      this.handleSettingsChange = this.handleSettingsChange.bind(this);
      this.handlePracticeChange = this.handlePracticeChange.bind(this);
    }

    handleSettingsChange(settings = this.settingsStore.get()) {
      this.soundEffects.setVolumeLevel(settings.volumeLevel);
      this.renderHeaderSummary(settings);
    }

    handlePracticeChange() {
      this.renderHeaderSummary();
    }

    renderHeaderSummary(settings = this.settingsStore.get()) {
      if (!this.headerSummaryRoot) return;

      const summary = this.practiceTracker.getSummary();

      this.headerSummaryRoot.innerHTML = `
      <div class="page-head-summary-item">
        <p class="label">ユーザー</p>
        <p class="dashboard-value">${window.MathCalligraphy.DomUtils.escapeHtml(settings.username)} さん</p>
      </div>
      <div class="page-head-summary-item">
        <p class="label">連続日数</p>
        <p class="dashboard-value">${summary.streakDays}日</p>
      </div>
      <div class="page-head-summary-item">
        <p class="label">合計練習回数</p>
        <p class="dashboard-value">${summary.totalSessions}回</p>
      </div>
      `;
    }

    start() {
      const deps = {
        contentRepository: this.contentRepository,
        appState: this.appState,
        session: this.session,
        patternSession: this.patternSession,
        templateResolver: this.templateResolver,
        templateLoader: this.templateLoader,
        scoringClient: this.scoringClient,
        settingsStore: this.settingsStore,
        practiceTracker: this.practiceTracker,
        soundEffects: this.soundEffects,
        supportMessages: ns.supportMessages,
      };

      // file:// 直開きでも動くように、実行環境で URL の扱いを切り替える。
      const urlAdapter = window.location.protocol === "file:" ? new ns.HashUrlAdapter() : new ns.HistoryUrlAdapter();

      // どのURLでどのPageを出すかをここで定義する。
      this.router = new ns.Router({
        root: this.root,
        urlAdapter,
        routes: [
          { pattern: "/", createPage: () => new ns.StartPage(this.router, deps) },
          { pattern: "/practice/char", createPage: () => new ns.CharSetListPage(this.router, deps) },
          { pattern: "/practice/char/:setId", createPage: () => new ns.CharPracticePage(this.router, deps) },
          // :index より先に success ルートを定義しないと、"success" が index 扱いされてしまう。
          { pattern: "/practice/char/:setId/success", createPage: () => new ns.CharPracticeSuccessPage(this.router, deps) },
          { pattern: "/practice/char/:setId/:index", createPage: () => new ns.CharPracticePage(this.router, deps) },
          // PDFで追加した「短い表現で練習」の一覧・実行・完了画面。
          { pattern: "/practice/words", createPage: () => new ns.WordCategoryListPage(this.router, deps) },
          { pattern: "/practice/words/:categoryId/success", createPage: () => new ns.WordPracticeSuccessPage(this.router, deps) },
          { pattern: "/practice/words/:categoryId/:patternId", createPage: () => new ns.WordPracticePage(this.router, deps) },
          { pattern: "/practice/words/:categoryId", createPage: () => new ns.WordPatternListPage(this.router, deps) },
          // 設定画面ではユーザー名・音量・応援表示を編集できる。
          { pattern: "/settings", createPage: () => new ns.SettingsPage(this.router, deps) },
          {
            pattern: "/stats",
            createPage: () => new ns.PlaceholderPage(this.router, deps, {
              title: "練習記録",
              subtitle: "文字ごとの練習回数・推移など",
              path: "/stats",
              message: "工事中",
            }),
          },
        ],
        notFoundFactory: () => new ns.PlaceholderPage(this.router, deps, {
          title: "404",
          subtitle: "ページが見つかりません",
          path: "(not found)",
          message: "URLを確認するか、ホーム画面に戻ってください。",
        }),
      });

      this.settingsStore.subscribe(this.handleSettingsChange);
      this.practiceTracker.subscribe(this.handlePracticeChange);
      this.handleSettingsChange();

      // ルーター起動後、現在のURLに対応する最初のページが描画される。
      // どのページのボタンでも同じ操作音が鳴るよう、全体に接続する。
      this.soundEffects.attach(document.body);
      this.router.start();
    }
  }

  ns.AppBootstrap = AppBootstrap;
})(window.MathCalligraphy = window.MathCalligraphy || {});
