// 文字セットの元データ。
// 将来は API 取得に置き換えやすいように、まずはデータを先頭にまとめている。
(function registerCharData(ns) {
  ns.practiceSetsData = [
    {
      id: "greek-basic1",
      name: "ギリシャ文字小文字 1",
      chars: ["α", "β", "γ", "δ"],
    },
    {
      id: "greek-basic2",
      name: "ギリシャ文字小文字 2",
      chars: ["ε", "ζ", "η", "θ"],
    },
    {
      id: "greek-basic3",
      name: "ギリシャ文字小文字 3",
      chars: ["ι", "κ", "λ", "μ"],
    },
    {
      id: "greek-basic4",
      name: "ギリシャ文字小文字 4",
      chars: ["ν", "ξ", "o", "π"],
    },
    {
      id: "greek-basic5",
      name: "ギリシャ文字小文字 5",
      chars: ["ρ", "σ", "τ", "υ"],
    },
    {
      id: "greek-basic6",
      name: "ギリシャ文字小文字 6",
      chars: ["φ", "χ", "ψ", "ω"],
    },
    {
      id: "fraktur-Capital-basic1",
      name: "フラクトゥール大文字 1",
      chars: ["フラクトゥールA", "フラクトゥールB", "フラクトゥールC", "フラクトゥールD"],
    },
    {
      id: "fraktur-Capital-basic2",
      name: "フラクトゥール大文字 2",
      chars: ["フラクトゥールE", "フラクトゥールF", "フラクトゥールG", "フラクトゥールH"],
    },
    {
      id: "fraktur-Capital-basic3",
      name: "フラクトゥール大文字 3",
      chars: ["フラクトゥールI", "フラクトゥールJ", "フラクトゥールK", "フラクトゥールL"],
    },
    {
      id: "fraktur-Capital-basic4",
      name: "フラクトゥール大文字 4",
      chars: ["フラクトゥールM", "フラクトゥールN", "フラクトゥールO", "フラクトゥールP"],
    },
    {
      id: "fraktur-Capital-basic5",
      name: "フラクトゥール大文字 5",
      chars: ["フラクトゥールQ", "フラクトゥールR", "フラクトゥールS", "フラクトゥールT"],
    },
    {
      id: "fraktur-Capital-basic6",
      name: "フラクトゥール大文字 6",
      chars: ["フラクトゥールU", "フラクトゥールV", "フラクトゥールW", "フラクトゥールX"],
    },
    {
      id: "fraktur-Capital-basi7",
      name: "フラクトゥール大文字 7",
      chars: ["フラクトゥールY", "フラクトゥールZ"],
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
    praiseAnimationEnabled: true,
    volumeLevel: 3,
  };

  // 練習文字 → 画像ファイル名(拡張子なし) の対応表。
  // TemplateResolver（手本）と SampleResolver（「今回の文字」表示）で共通利用する。
  ns.charSlugMap = {
    "α": "alpha",
    "β": "beta",
    "γ": "gamma",
    "δ": "delta",
    "ε": "epsilon",
    "ζ": "zeta",
    "η": "eta",
    "θ": "theta",
    "ι": "iota",
    "κ": "kappa",
    "λ": "lambda",
    "μ": "mu",
    "ν": "nu",
    "ξ": "xi",
    "o": "omicron",
    "π": "pi",
    "ρ": "rho",
    "σ": "sigma",
    "τ": "tau",
    "υ": "upsilon",
    "φ": "phi",
    "χ": "chi",
    "ψ": "psi",
    "ω": "omega",
    "フラクトゥールA": "frakCapitalA",
    "フラクトゥールB": "frakCapitalB",
    "フラクトゥールC": "frakCapitalC",
    "フラクトゥールD": "frakCapitalD",
    "フラクトゥールE": "frakCapitalE",
    "フラクトゥールF": "frakCapitalF",
    "フラクトゥールG": "frakCapitalG",
    "フラクトゥールH": "frakCapitalH",
    "フラクトゥールI": "frakCapitalI",
    "フラクトゥールJ": "frakCapitalJ",
    "フラクトゥールK": "frakCapitalK",
    "フラクトゥールL": "frakCapitalL",
    "フラクトゥールM": "frakCapitalM",
    "フラクトゥールN": "frakCapitalN",
    "フラクトゥールO": "frakCapitalO",
    "フラクトゥールP": "frakCapitalP",
    "フラクトゥールQ": "frakCapitalQ",
    "フラクトゥールR": "frakCapitalR",
    "フラクトゥールS": "frakCapitalS",
    "フラクトゥールT": "frakCapitalT",
    "フラクトゥールU": "frakCapitalU",
    "フラクトゥールV": "frakCapitalV",
    "フラクトゥールW": "frakCapitalW",
    "フラクトゥールX": "frakCapitalX",
    "フラクトゥールY": "frakCapitalY",
    "フラクトゥールZ": "frakCapitalZ",
    // "フラクトゥールa": "fraka",
    // "フラクトゥールb": "frakb",
    // "フラクトゥールc": "frakc",
    // "フラクトゥールd": "frakd",
  };
})(window.MathCalligraphy = window.MathCalligraphy || {});
