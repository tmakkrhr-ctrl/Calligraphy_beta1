// 文字セットの元データ。
// 将来は API 取得に置き換えやすいように、まずはデータを先頭にまとめている。
(function registerCharData(ns) {
  ns.practiceSetsData = [
    {
      id: "greek-basic1",
      name: "ギリシャ文字 1",
      description: "数学・物理でよく見る基本の4文字です。",
      chars: ["α", "β", "γ", "δ"],
    },
    {
      id: "fraktur-Capital-basic1",
      name: "フラクトゥール大文字 1",
      description: "集合や代数で見かける大文字を集めました。",
      chars: ["フラクトゥールA", "フラクトゥールB", "フラクトゥールC", "フラクトゥールD"],
    },
    // { id: "fractur-basic1", name: "フラクトゥール 1", chars: ["フラクトゥールa", "フラクトゥールb", "フラクトゥールc", "フラクトゥールd"] }
  ];

  // 「短い表現で練習」で使う、数式パターンごとの練習データ。
  ns.patternCategoriesData = [
    // {
    //   id: "calculus-patterns",
    //   name: "微分・積分でよく使う形",
    //   description: "導関数や積分の表し方を、まとまりで練習します。",
    //   patterns: [
    //     {
    //       id: "derivative-basic",
    //       label: "導関数の基本形",
    //       expression: "d/dx f(x) = f'(x)",
    //       note: "分数形の d/dx と右辺のダッシュに慣れる練習です。",
    //     },
    //     {
    //       id: "integral-basic",
    //       label: "定積分の形",
    //       expression: "∫_a^b f(x) dx",
    //       note: "積分記号と上下の添字のバランスを意識します。",
    //     },
    //     {
    //       id: "series-basic",
    //       label: "総和の形",
    //       expression: "Σ_(n=1)^N a_n",
    //       note: "Σ と添字をひとかたまりで書く練習です。",
    //     },
    //   ],
    // },
    {
      id: "linear-algebra-patterns",
      name: "線形代数でよく使う形",
      description: "集合記号やベクトル・行列の書き方を反復します。",
      patterns: [
        {
          id: "matrix-basic",
          label: "行列サイズの表現",
          expression: "A ∈ ℝ^(2×2)",
          note: "所属記号と右肩のサイズ表記を整える練習です。",
          imageid: "matrixExample",
        },
        {
          id: "vector-basic",
          label: "ベクトルの内積",
          expression: "u・v = |u||v|cosθ",
          note: "縦線や cos の続き方を滑らかに書く練習です。",
          imageid: "vectorExample",
        },
        {
          id: "set-basic",
          label: "部分空間の表現",
          expression: "W ⊂ V",
          note: "包含記号と大文字の間隔を意識します。",
          imageid: "setExample",
        },
      ],
    },
    {
      id: "greek-patterns",
      name: "ギリシャ文字の並び",
      description: "授業ノートで続けて書くことの多い並びを練習します。",
      patterns: [
        {
          id: "alpha-beta-gamma",
          label: "連続するギリシャ文字",
          expression: "α + β = γ",
          note: "ギリシャ文字どうしの高さと傾きをそろえます。",
          imageid: "alphaBetaGammaExample",
        },
        {
          id: "delta-epsilon",
          label: "ε-δ論法の表現",
          expression: "∀ε>0 ∃δ>0 ...",
          note: "イプシロンデルタ論法を一通り書く練習です。",
          imageid: "epsilonDelta_definitionLimit",

        },
      ],
    },
  ];

  // 設定画面で編集する初期値。
  ns.settingsDefaults = {
    username: "ユーザー",
    encouragementEnabled: true,
    volumeLevel: 3,
  };

  // ステータス欄に添える、短い応援メッセージ候補。
  ns.supportMessages = [
    "いい流れです。",
    "この調子で続けましょう。",
    "少しずつ整ってきています。",
    "丁寧に書けています。",
  ];

  // 練習文字 → 画像ファイル名(拡張子なし) の対応表。
  // TemplateResolver（手本）と SampleResolver（「今回の文字」表示）で共通利用する。
  ns.charSlugMap = {
    "α": "alpha",
    "β": "beta",
    "γ": "gamma",
    "δ": "delta",
    "フラクトゥールA": "frakCapitalA",
    "フラクトゥールB": "frakCapitalB",
    "フラクトゥールC": "frakCapitalC",
    "フラクトゥールD": "frakCapitalD",
    // "フラクトゥールa": "fraka",
    // "フラクトゥールb": "frakb",
    // "フラクトゥールc": "frakc",
    // "フラクトゥールd": "frakd",
  };
})(window.MathCalligraphy = window.MathCalligraphy || {});
