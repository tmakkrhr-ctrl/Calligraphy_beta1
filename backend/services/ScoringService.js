// browser が抽出した比較用マスクを受け取り、server 側で一致度を計算する。
class ScoringService {
  score(payload = {}) {
    const normalized = this.normalizePayload(payload);
    const matchPixels = this.countMatches(normalized.sampleMaskSet, normalized.userMask);
    const score = normalized.userMask.length === 0
      ? 0
      : Math.round((matchPixels / normalized.userMask.length) * 100);

    return {
      implemented: true,
      message: "手本画像と描画線の一致度を計算しました。",
      score,
      details: {
        algorithm: normalized.analysisVersion,
        setId: normalized.setId,
        char: normalized.char,
        canvas: {
          width: normalized.width,
          height: normalized.height,
        },
        samplePixels: normalized.sampleMask.length,
        userPixels: normalized.userMask.length,
        matchedPixels: matchPixels,
      },
    };
  }

  // 採点前に payload を検証し、計算しやすい形へ正規化する。
  normalizePayload(payload) {
    const width = this.readPositiveInt(payload?.canvas?.width, "canvas.width");
    const height = this.readPositiveInt(payload?.canvas?.height, "canvas.height");
    const pixelLimit = width * height;

    if (pixelLimit > 65536) {
      throw new Error("比較用マスクが大きすぎます。");
    }

    const sampleMask = this.readMask(payload.sampleMask, pixelLimit, "sampleMask");
    const userMask = this.readMask(payload.userMask, pixelLimit, "userMask");

    if (sampleMask.length === 0) {
      throw new Error("手本画像の比較データが空です。");
    }

    return {
      analysisVersion: String(payload.analysisVersion || "browser-rasterized-mask-v1"),
      setId: String(payload.setId || ""),
      char: String(payload.char || ""),
      width,
      height,
      sampleMask,
      userMask,
      sampleMaskSet: new Set(sampleMask),
    };
  }

  // 数値であることと、ピクセル範囲内であることを確認して重複を取り除く。
  readMask(mask, pixelLimit, label) {
    if (!Array.isArray(mask)) {
      throw new Error(`${label} は配列で送ってください。`);
    }

    const uniqueValues = [];
    const seen = new Set();

    for (const rawValue of mask) {
      const value = Number(rawValue);
      if (!Number.isInteger(value) || value < 0 || value >= pixelLimit) {
        throw new Error(`${label} に不正なピクセル番号が含まれています。`);
      }
      if (seen.has(value)) continue;
      seen.add(value);
      uniqueValues.push(value);
    }

    return uniqueValues;
  }

  readPositiveInt(value, label) {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
      throw new Error(`${label} は正の整数で送ってください。`);
    }
    return number;
  }

  // ユーザー線のピクセルが、手本の線に何個重なっているか数える。
  countMatches(sampleMaskSet, userMask) {
    let matched = 0;

    for (const pixelIndex of userMask) {
      if (sampleMaskSet.has(pixelIndex)) {
        matched += 1;
      }
    }

    return matched;
  }
}

module.exports = {
  ScoringService,
};
