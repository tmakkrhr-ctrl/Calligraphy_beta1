// アプリ状態・データ取得・練習進行など、画面とAPIの間にある中核ロジックをまとめる。
(function registerDomain(ns) {
  // 設定値と練習記録は localStorage に分けて保持する。
  const STORAGE_KEYS = {
    settings: "math-calligraphy-settings",
    practice: "math-calligraphy-practice",
    apiBaseUrl: "math-calligraphy-api-base-url",
  };

  // 「今回の文字」欄で使う画像パスを作る関数。
  // 文字そのものではなく、/sample 配下の画像を表示したいときに使う。
  function sampleResolver(char) {
    const mapped = ns.charSlugMap[char];
    if (mapped) return `/samples/${mapped}.png`;
    if (/^[a-z0-9]$/i.test(char)) return `/samples/${char.toLowerCase()}.png`;
    return `/samples/${encodeURIComponent(char)}.png`;
  }

  // アプリ全体で共有したい UI 状態を保持するクラス。
  // 例: 手本表示のON/OFF、ステータスメッセージなど。
  class AppState {
    constructor() {
      this.currentCharRoute = null;
      this.currentWordRoute = null;
      this.templateVisible = false;
      this.templateState = "hidden";
      this.lastStatusMessage = "";
    }

    resetPracticeUi() {
      this.templateVisible = false;
      this.templateState = "hidden";
      this.lastStatusMessage = "";
    }
  }

  // コンテンツ取得の窓口。
  // 今はローカル配列を返すだけだが、将来 API に差し替えやすくするための層。
  class ContentRepository {
    constructor({ charSets, patternCategories }) {
      this.charSets = charSets;
      this.patternCategories = patternCategories;
    }

    getCharSets() {
      return this.charSets.map((set) => ({ ...set, chars: [...set.chars] }));
    }

    getCharSetById(setId) {
      const found = this.charSets.find((set) => set.id === setId);
      if (!found) return null;
      return { ...found, chars: [...found.chars] };
    }

    getPatternCategories() {
      return this.patternCategories.map((category) => ({
        ...category,
        patterns: category.patterns.map((pattern) => ({ ...pattern })),
      }));
    }

    getPatternCategoryById(categoryId) {
      const found = this.patternCategories.find((category) => category.id === categoryId);
      if (!found) return null;
      return {
        ...found,
        patterns: found.patterns.map((pattern) => ({ ...pattern })),
      };
    }
  }

  // 1文字練習の進行状態を管理するクラス。
  // 現在のセット、何文字目か、次へ進めるか、などをまとめる。
  class PracticeSession {
    constructor(contentRepository) {
      this.contentRepository = contentRepository;
      this.currentSet = null;
      this.currentIndex = 0;
    }

    loadSet(setId, startIndex = 0) {
      const set = this.contentRepository.getCharSetById(setId);
      if (!set) return false;

      this.currentSet = set;
      const maxIndex = Math.max(0, set.chars.length - 1);
      this.currentIndex = ns.clampNumber(startIndex, 0, maxIndex);
      return true;
    }

    reset() {
      this.currentSet = null;
      this.currentIndex = 0;
    }

    hasLoadedSet() {
      return Boolean(this.currentSet);
    }

    getSetId() {
      return this.currentSet?.id ?? null;
    }

    getSetName() {
      return this.currentSet?.name ?? "";
    }

    getTotalCount() {
      return this.currentSet?.chars.length ?? 0;
    }

    getCurrentIndex() {
      return this.currentIndex;
    }

    getCurrent() {
      if (!this.currentSet) return "";
      return this.currentSet.chars[this.currentIndex] ?? "";
    }

    canGoPrev() {
      if (!this.currentSet) return false;
      return this.currentIndex > 0;
    }

    // 1つ前の文字へ戻る。先頭なら false を返して移動しない。
    prev() {
      if (!this.canGoPrev()) return false;
      this.currentIndex -= 1;
      return true;
    }

    canGoNext() {
      if (!this.currentSet) return false;
      return this.currentIndex < this.currentSet.chars.length - 1;
    }

    next() {
      if (!this.canGoNext()) return false;
      this.currentIndex += 1;
      return true;
    }

    getProgressLabel() {
      const total = this.getTotalCount();
      if (total === 0) return "0/0";
      return `${this.currentIndex + 1}/${total}`;
    }
  }

  // 「短い表現で練習」の現在位置を管理するセッション。
  class PatternPracticeSession {
    constructor(contentRepository) {
      this.contentRepository = contentRepository;
      this.currentCategory = null;
      this.currentIndex = 0;
    }

    loadCategory(categoryId, startPatternId = null) {
      const category = this.contentRepository.getPatternCategoryById(categoryId);
      if (!category) return false;

      this.currentCategory = category;
      const foundIndex = startPatternId
        ? category.patterns.findIndex((pattern) => pattern.id === startPatternId)
        : 0;
      const safeIndex = foundIndex >= 0 ? foundIndex : 0;
      const maxIndex = Math.max(0, category.patterns.length - 1);
      this.currentIndex = ns.clampNumber(safeIndex, 0, maxIndex);
      return true;
    }

    reset() {
      this.currentCategory = null;
      this.currentIndex = 0;
    }

    getCategoryId() {
      return this.currentCategory?.id ?? null;
    }

    getCategoryName() {
      return this.currentCategory?.name ?? "";
    }

    getTotalCount() {
      return this.currentCategory?.patterns.length ?? 0;
    }

    getCurrentIndex() {
      return this.currentIndex;
    }

    getCurrent() {
      if (!this.currentCategory) return null;
      return this.currentCategory.patterns[this.currentIndex] ?? null;
    }

    canGoPrev() {
      if (!this.currentCategory) return false;
      return this.currentIndex > 0;
    }

    prev() {
      if (!this.canGoPrev()) return false;
      this.currentIndex -= 1;
      return true;
    }

    canGoNext() {
      if (!this.currentCategory) return false;
      return this.currentIndex < this.currentCategory.patterns.length - 1;
    }

    next() {
      if (!this.canGoNext()) return false;
      this.currentIndex += 1;
      return true;
    }

    getProgressLabel() {
      const total = this.getTotalCount();
      if (total === 0) return "0/0";
      return `${this.currentIndex + 1}/${total}`;
    }
  }

  // 文字から手本画像のパスを作る責務だけを持つクラス。
  class TemplateResolver {
    constructor(slugMap) {
      this.slugMap = slugMap;
    }

    resolve(char) {
      const mapped = this.slugMap[char];
      if (mapped) return `/templates/${mapped}.png`;
      if (/^[a-z0-9]$/i.test(char)) return `/templates/${char.toLowerCase()}.png`;
      return `/templates/${encodeURIComponent(char)}.png`;
    }
  }

  // 画像の非同期読み込みを担当するクラス。
  // onload / onerror を Promise に包んで扱いやすくしている。
  class TemplateLoader {
    load(src) {
      return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`Template not found: ${src}`));
        image.src = src;
      });
    }
  }

  function readConfiguredBackendBaseUrl() {
    if (typeof window === "undefined") return "";

    const configured = window.MathCalligraphyConfig?.apiBaseUrl;
    if (typeof configured === "string" && configured.trim()) {
      return configured.trim();
    }

    try {
      const params = new URLSearchParams(window.location.search || "");
      const fromQuery = params.get("apiBaseUrl");
      if (fromQuery) {
        window.localStorage.setItem(STORAGE_KEYS.apiBaseUrl, fromQuery);
        return fromQuery;
      }

      const stored = window.localStorage.getItem(STORAGE_KEYS.apiBaseUrl);
      return stored ? stored.trim() : "";
    } catch {
      return "";
    }
  }

  // Express が同じオリジンで画面と API を配信する場合は相対パスを使う。
  // file:// や別配信の場合だけ上書き設定を使えるようにしておく。
  function resolveBackendBaseUrl() {
    if (typeof window === "undefined" || !window.location) {
      return "";
    }

    const configuredBaseUrl = readConfiguredBackendBaseUrl();
    if (configuredBaseUrl) return configuredBaseUrl;

    return window.location.protocol === "http:" || window.location.protocol === "https:" ? "" : "http://localhost:3000";
  }

  // 採点APIとの通信だけを担当する小さなクライアント。
  class ScoringClient {
    constructor(baseUrl = resolveBackendBaseUrl()) {
      this.baseUrl = String(baseUrl || "").replace(/\/+$/, "");
    }

    async scoreDrawing(payload) {
      const response = await fetch(`${this.baseUrl}/api/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let body = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      if (!response.ok) {
        throw new Error(body?.details || body?.error || "採点APIの呼び出しに失敗しました。");
      }

      return body;
    }
  }

  // 設定画面の内容を localStorage に保存・復元する。
  class SettingsStore {
    constructor(defaults) {
      this.defaults = { ...defaults };
      this.state = this.load();
      this.listeners = new Set();
    }

    load() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.settings);
        if (!raw) return { ...this.defaults };
        const parsed = JSON.parse(raw);
        return {
          username: String(parsed.username || this.defaults.username),
          encouragementEnabled: Boolean(
            parsed.encouragementEnabled ?? this.defaults.encouragementEnabled
          ),
          volumeLevel: ns.clampNumber(
            Number(parsed.volumeLevel ?? this.defaults.volumeLevel),
            0,
            5
          ),
        };
      } catch {
        return { ...this.defaults };
      }
    }

    persist() {
      window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(this.state));
    }

    get() {
      return { ...this.state };
    }

    subscribe(listener) {
      if (typeof listener !== "function") {
        return () => {};
      }

      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }

    notify() {
      const snapshot = this.get();
      this.listeners.forEach((listener) => {
        try {
          listener(snapshot);
        } catch {
          // 個別の購読エラーで全体の更新を止めない。
        }
      });
    }

    update(partial) {
      this.state = {
        ...this.state,
        ...partial,
      };
      this.state.username = String(this.state.username || this.defaults.username).trim() || this.defaults.username;
      this.state.volumeLevel = ns.clampNumber(Number(this.state.volumeLevel), 0, 5);
      this.state.encouragementEnabled = Boolean(this.state.encouragementEnabled);
      this.persist();
      this.notify();
      return this.get();
    }

    reset() {
      this.state = { ...this.defaults };
      this.persist();
      this.notify();
      return this.get();
    }
  }

  // 文字練習・短い表現練習の回数をまとめて保持する。
  class PracticeTracker {
    constructor() {
      this.state = this.load();
      this.listeners = new Set();
    }

    load() {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEYS.practice);
        if (!raw) return { totals: {}, events: [] };
        const parsed = JSON.parse(raw);
        return {
          totals: parsed?.totals && typeof parsed.totals === "object" ? parsed.totals : {},
          events: Array.isArray(parsed?.events) ? parsed.events : [],
        };
      } catch {
        return { totals: {}, events: [] };
      }
    }

    persist() {
      window.localStorage.setItem(STORAGE_KEYS.practice, JSON.stringify(this.state));
    }

    subscribe(listener) {
      if (typeof listener !== "function") {
        return () => {};
      }

      this.listeners.add(listener);
      return () => {
        this.listeners.delete(listener);
      };
    }

    notify() {
      const summary = this.getSummary();
      this.listeners.forEach((listener) => {
        try {
          listener(summary);
        } catch {
          // 個別の購読エラーで全体の更新を止めない。
        }
      });
    }

    recordPractice({ mode, bucketId, itemId, label, strokeCount = 0, practicedAt = new Date().toISOString() }) {
      const safeBucketId = String(bucketId || "");
      const safeItemId = String(itemId || "");
      if (!safeBucketId || !safeItemId) return null;

      const bucket = this.state.totals[safeBucketId] || {};
      bucket[safeItemId] = Number(bucket[safeItemId] || 0) + 1;
      this.state.totals[safeBucketId] = bucket;
      this.state.events.push({
        mode: String(mode || "practice"),
        bucketId: safeBucketId,
        itemId: safeItemId,
        label: String(label || safeItemId),
        strokeCount: Number(strokeCount || 0),
        practicedAt,
      });
      this.state.events = this.state.events.slice(-200);
      this.persist();
      this.notify();
      return { totalCount: bucket[safeItemId] };
    }

    getItemCount(bucketId, itemId) {
      return Number(this.state.totals?.[bucketId]?.[itemId] || 0);
    }

    // ホーム画面のサマリー表示用に、合計回数や連続日数を返す。
    getSummary() {
      const events = [...this.state.events].sort((a, b) => (
        new Date(a.practicedAt).getTime() - new Date(b.practicedAt).getTime()
      ));
      const totalSessions = events.length;
      const lastPracticedAt = events.length ? events[events.length - 1].practicedAt : null;
      const streakDays = this.calculateStreak(events);
      return {
        totalSessions,
        lastPracticedAt,
        streakDays,
        recentEvents: events.slice(-5).reverse(),
      };
    }

    calculateStreak(events) {
      if (!events.length) return 0;

      const days = [...new Set(events.map((event) => this.toDayKey(event.practicedAt)))].sort();
      let streak = 1;
      for (let i = days.length - 1; i > 0; i -= 1) {
        const current = new Date(`${days[i]}T00:00:00`);
        const prev = new Date(`${days[i - 1]}T00:00:00`);
        const diff = Math.round((current.getTime() - prev.getTime()) / 86400000);
        if (diff !== 1) break;
        streak += 1;
      }
      return streak;
    }

    toDayKey(value) {
      const date = new Date(value);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  // 設定画面の音量に連動する軽い操作音。
  class SoundEffects {
    constructor(volumeLevel = 0) {
      this.volumeLevel = ns.clampNumber(Number(volumeLevel), 0, 5);
      this.audioContext = null;
      this.boundRoot = null;
      this.boundClick = null;
    }

    setVolumeLevel(level) {
      this.volumeLevel = ns.clampNumber(Number(level), 0, 5);
    }

    // 全体の button click を拾って、操作音をまとめて鳴らす。
    attach(root) {
      if (this.boundRoot) return;
      this.boundRoot = root;
      this.boundClick = (event) => {
        const button = event.target.closest("button");
        if (!button) return;
        this.playTap();
      };
      root.addEventListener("click", this.boundClick);
    }

    async getAudioContext() {
      if (typeof window === "undefined") return null;
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return null;
      if (!this.audioContext) {
        this.audioContext = new AudioContextCtor();
      }
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      return this.audioContext;
    }

    playTap() {
      this.playTone(392, 0.045);
    }

    playTone(frequency, duration) {
      if (this.volumeLevel <= 0) return;
      this.getAudioContext().then((ctx) => {
        if (!ctx) return;
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        const now = ctx.currentTime;
        const baseGain = (this.volumeLevel / 5) * 0.03;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(baseGain, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);
        oscillator.start(now);
        oscillator.stop(now + duration);
      }).catch(() => {});
    }
  }

  ns.sampleResolver = sampleResolver;
  ns.AppState = AppState;
  ns.ContentRepository = ContentRepository;
  ns.PracticeSession = PracticeSession;
  ns.PatternPracticeSession = PatternPracticeSession;
  ns.TemplateResolver = TemplateResolver;
  ns.TemplateLoader = TemplateLoader;
  ns.ScoringClient = ScoringClient;
  ns.SettingsStore = SettingsStore;
  ns.PracticeTracker = PracticeTracker;
  ns.SoundEffects = SoundEffects;
})(window.MathCalligraphy = window.MathCalligraphy || {});
