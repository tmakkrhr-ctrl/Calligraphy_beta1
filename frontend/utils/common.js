// DOM 文字列の安全化など、画面表示の小さな共通処理を置くユーティリティ。
(function registerCommonUtils(ns) {
  class DomUtils {
    static escapeHtml(value) {
      return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
    }

    static button(label, className, onClick) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = className;
      button.textContent = label;
      button.addEventListener("click", onClick);
      return button;
    }
  }

  // URL の表記ゆれ（末尾スラッシュ等）をそろえる。
  function normalizePath(path) {
    if (!path) return "/";
    const withoutOrigin = path.replace(/^https?:\/\/[^/]+/, "");
    const trimmed = withoutOrigin.trim();
    if (!trimmed) return "/";
    const ensured = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    return ensured.replace(/\/+$/, "") || "/";
  }

  // ルート定義（例: /practice/char/:setId）と実際のURLを照合し、
  // :setId のようなパラメータを取り出す。
  function matchRoute(pattern, path) {
    const patternParts = normalizePath(pattern).split("/").filter(Boolean);
    const pathParts = normalizePath(path).split("/").filter(Boolean);
    if (patternParts.length !== pathParts.length) return null;

    const params = {};
    for (let i = 0; i < patternParts.length; i += 1) {
      const pp = patternParts[i];
      const pv = pathParts[i];
      if (pp.startsWith(":")) {
        params[pp.slice(1)] = decodeURIComponent(pv);
        continue;
      }
      if (pp !== pv) return null;
    }
    return params;
  }

  // 数値を最小〜最大の範囲に収める共通関数。
  function clampNumber(value, min, max) {
    if (!Number.isFinite(value)) return min;
    return Math.min(max, Math.max(min, value));
  }

  ns.DomUtils = DomUtils;
  ns.normalizePath = normalizePath;
  ns.matchRoute = matchRoute;
  ns.clampNumber = clampNumber;
})(window.MathCalligraphy = window.MathCalligraphy || {});
