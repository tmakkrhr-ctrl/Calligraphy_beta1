// バックエンドが返す文字セット定義。
// フロントエンド表示用のデータと形を合わせている。
const practiceSetsData = [
  { id: "greek-basic1", name: "ギリシャ文字 1", chars: ["α", "β", "γ", "δ"] },
  { id: "fraktur-Capital-basic1", name: "フラクトゥール大文字 1", chars: ["フラクトゥールA", "フラクトゥールB", "フラクトゥールC", "フラクトゥールD"] },
  // { id: "fractur-basic1", name: "フラクトゥール 1", chars: ["フラクトゥールa", "フラクトゥールb", "フラクトゥールc", "フラクトゥールd"] }
];

module.exports = {
  practiceSetsData,
};
