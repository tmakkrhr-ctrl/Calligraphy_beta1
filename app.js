// フロントエンド構成を分割した後の起動エントリ。
// 各機能は frontend/ 配下のファイルにあり、ここでは起動だけを担当する。
(function startApp(ns) {
  const appRoot = document.getElementById("app-root");
  const app = new ns.AppBootstrap(appRoot);
  app.start();
})(window.MathCalligraphy = window.MathCalligraphy || {});
