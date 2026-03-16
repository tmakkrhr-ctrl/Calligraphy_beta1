// URL とページ描画を結びつけるルーター層をまとめる。
(function registerRouter(ns) {
  // URL と Page クラスを結びつけるルーター。
  // URL が変わるたびに、対応するページを作って app-root に表示する。
  class Router {
    constructor({ root, urlAdapter, routes, notFoundFactory }) {
      this.root = root;
      this.urlAdapter = urlAdapter;
      this.routes = routes;
      this.notFoundFactory = notFoundFactory;
      this.currentPage = null;
      this.onChange = () => this.renderCurrent();
    }

    start() {
      this.urlAdapter.start(this.onChange);
      this.renderCurrent();
    }

    stop() {
      this.urlAdapter.stop(this.onChange);
      if (this.currentPage) {
        this.currentPage.unmount();
        this.currentPage = null;
      }
    }

    navigate(path, options = {}) {
      this.urlAdapter.navigate(path, options);
      this.renderCurrent();
    }

    renderCurrent() {
      // 現在URLを見て、対応するページを毎回作り直して表示する。
      const path = this.urlAdapter.getPath();
      const match = this.match(path);

      if (this.currentPage) {
        this.currentPage.unmount();
        this.currentPage = null;
      }

      if (!match) {
        this.currentPage = this.notFoundFactory();
        this.currentPage.mount(this.root, { path });
        return;
      }

      this.currentPage = match.route.createPage();
      this.currentPage.mount(this.root, match.params);
    }

    match(path) {
      for (const route of this.routes) {
        const params = ns.matchRoute(route.pattern, path);
        if (params) return { route, params };
      }
      return null;
    }
  }

  // file:// で直接開くとき用の URL アダプタ。
  // #/practice/char/... のようなハッシュURLを使う。
  class HashUrlAdapter {
    constructor() {
      this.bound = null;
    }

    getPath() {
      const raw = window.location.hash.replace(/^#/, "") || "/";
      return ns.normalizePath(raw);
    }

    navigate(path, options = {}) {
      const normalized = ns.normalizePath(path);
      const nextHash = `#${normalized}`;
      if (options.replace) {
        window.history.replaceState(null, "", nextHash);
      } else {
        window.location.hash = normalized;
      }
    }

    start(listener) {
      this.bound = listener;
      window.addEventListener("hashchange", this.bound);
      if (!window.location.hash) {
        window.location.hash = "/";
      }
    }

    stop(listener) {
      window.removeEventListener("hashchange", listener);
    }
  }

  // Web サーバー配信時の URL アダプタ。
  // /practice/char/... のような通常パスを扱う。
  class HistoryUrlAdapter {
    constructor() {
      this.bound = null;
    }

    getPath() {
      return ns.normalizePath(window.location.pathname || "/");
    }

    navigate(path, options = {}) {
      const normalized = ns.normalizePath(path);
      if (options.replace) {
        window.history.replaceState(null, "", normalized);
      } else {
        window.history.pushState(null, "", normalized);
      }
    }

    start(listener) {
      this.bound = listener;
      window.addEventListener("popstate", this.bound);
    }

    stop(listener) {
      window.removeEventListener("popstate", listener);
    }
  }

  ns.Router = Router;
  ns.HashUrlAdapter = HashUrlAdapter;
  ns.HistoryUrlAdapter = HistoryUrlAdapter;
})(window.MathCalligraphy = window.MathCalligraphy || {});
