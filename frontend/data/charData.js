// 文字セットの元データ。
// 将来は API 取得に置き換えやすいように、まずはデータを先頭にまとめている。
(function registerCharData(ns) {
  // 階層: スタート画面 -> 1文字練習 -> 文字の種類
  ns.charPracticeCategoriesData = [
    {
      id: "greek-lower",
      name: "ギリシャ文字　小文字",
      description: "α から ω まで、4文字ずつのセットで練習します。",
      previewChars: ["α", "β", "γ", "δ"],
      status: "ready",
    },
    {
      id: "greek-upper",
      name: "ギリシャ文字　大文字",
      description: "工事中",
      previewChars: ["Α", "Β", "Γ", "Δ"],
      status: "construction",
    },
    {
      id: "fraktur-lower",
      name: "フラクトゥール　小文字",
      description: "工事中",
      previewChars: ["a", "b", "c", "d"],
      status: "construction",
    },
    {
      id: "fraktur-upper",
      name: "フラクトゥール　大文字",
      description: "A から Z まで、4文字ずつのセットで練習します。",
      previewChars: ["フラクトゥールA", "フラクトゥールB", "フラクトゥールC", "フラクトゥールD"],
      status: "ready",
    },
  ];

  // 階層: スタート画面 -> 1文字練習 -> 各文字種別 -> 文字セット
  ns.practiceSetsData = [
    {
      id: "greek-basic1",
      name: "ギリシャ文字　小文字 1",
      groupId: "greek-lower",
      chars: ["α", "β", "γ", "δ"],
    },
    {
      id: "greek-basic2",
      name: "ギリシャ文字　小文字 2",
      groupId: "greek-lower",
      chars: ["ε", "ζ", "η", "θ"],
    },
    {
      id: "greek-basic3",
      name: "ギリシャ文字　小文字 3",
      groupId: "greek-lower",
      chars: ["ι", "κ", "λ", "μ"],
    },
    {
      id: "greek-basic4",
      name: "ギリシャ文字　小文字 4",
      groupId: "greek-lower",
      chars: ["ν", "ξ", "o", "π"],
    },
    {
      id: "greek-basic5",
      name: "ギリシャ文字　小文字 5",
      groupId: "greek-lower",
      chars: ["ρ", "σ", "τ", "υ"],
    },
    {
      id: "greek-basic6",
      name: "ギリシャ文字　小文字 6",
      groupId: "greek-lower",
      chars: ["φ", "χ", "ψ", "ω"],
    },
    {
      id: "fraktur-Capital-basic1",
      name: "フラクトゥール　大文字 1",
      groupId: "fraktur-upper",
      chars: ["フラクトゥールA", "フラクトゥールB", "フラクトゥールC", "フラクトゥールD"],
    },
    {
      id: "fraktur-Capital-basic2",
      name: "フラクトゥール　大文字 2",
      groupId: "fraktur-upper",
      chars: ["フラクトゥールE", "フラクトゥールF", "フラクトゥールG", "フラクトゥールH"],
    },
    {
      id: "fraktur-Capital-basic3",
      name: "フラクトゥール　大文字 3",
      groupId: "fraktur-upper",
      chars: ["フラクトゥールI", "フラクトゥールJ", "フラクトゥールK", "フラクトゥールL"],
    },
    {
      id: "fraktur-Capital-basic4",
      name: "フラクトゥール　大文字 4",
      groupId: "fraktur-upper",
      chars: ["フラクトゥールM", "フラクトゥールN", "フラクトゥールO", "フラクトゥールP"],
    },
    {
      id: "fraktur-Capital-basic5",
      name: "フラクトゥール　大文字 5",
      groupId: "fraktur-upper",
      chars: ["フラクトゥールQ", "フラクトゥールR", "フラクトゥールS", "フラクトゥールT"],
    },
    {
      id: "fraktur-Capital-basic6",
      name: "フラクトゥール　大文字 6",
      groupId: "fraktur-upper",
      chars: ["フラクトゥールU", "フラクトゥールV", "フラクトゥールW", "フラクトゥールX"],
    },
    {
      id: "fraktur-Capital-basi7",
      name: "フラクトゥール　大文字 7",
      groupId: "fraktur-upper",
      chars: ["フラクトゥールY", "フラクトゥールZ"],
    },
    // { id: "fractur-basic1", name: "フラクトゥール 1", chars: ["フラクトゥールa", "フラクトゥールb", "フラクトゥールc", "フラクトゥールd"] }
  ];

  // 階層: スタート画面 -> 短い表現で練習 -> カテゴリー -> 練習する表現
  ns.patternCategoriesData = [
    {
      id: "DerivativeIntegral",
      name: "微分積分学",
      description: "微分積分学で書くことの多い並びを練習します。",
      status: "ready",
      patterns: [
        {
          id: "delta-epsilon",
          label: "イプシロンデルタ論法",
          expression: "∀ε>0 ∃δ>0 ...",
          note: "イプシロンデルタ論法を一通り書く練習です。",
        },
      ],
    },
    {
      id: "physics-expressions",
      name: "物理で使う表現",
      description: "工事中",
      status: "construction",
      previewText: "工事中",
      patterns: [],
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

  // 練習する短い表現 -> 画像ファイル名(拡張子なし) の対応表。
  // 「1文字練習」と同じく、画面側ではこの対応表を通して画像を引く。
  ns.patternSlugMap = {
    "delta-epsilon": "epsilondelta",
  };
})(window.MathCalligraphy = window.MathCalligraphy || {});
