const fs = require("fs");
const path = require("path");

// 練習回数の保存を担当する層。
// 現時点では JSON ファイルに保存し、将来DBに置き換えやすい構成にしている。
class PracticeRecordStore {
  constructor(filePath = path.join(__dirname, "..", "data", "practiceRecords.json")) {
    this.filePath = filePath;
    this.state = this.load();
  }

  load() {
    try {
      const raw = fs.readFileSync(this.filePath, "utf-8");
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return { totals: {}, events: [] };
      return {
        totals: parsed.totals || {},
        events: Array.isArray(parsed.events) ? parsed.events : [],
      };
    } catch {
      return { totals: {}, events: [] };
    }
  }

  persist() {
    const payload = JSON.stringify(this.state, null, 2);
    fs.writeFileSync(this.filePath, `${payload}\n`, "utf-8");
  }

  savePractice({ setId, char, strokeCount, practicedAt }) {
    const safeSetId = String(setId || "");
    const safeChar = String(char || "");
    if (!safeSetId || !safeChar) {
      throw new Error("setId と char は必須です。");
    }

    const setBucket = this.state.totals[safeSetId] || {};
    setBucket[safeChar] = Number(setBucket[safeChar] || 0) + 1;
    this.state.totals[safeSetId] = setBucket;

    this.state.events.push({
      setId: safeSetId,
      char: safeChar,
      strokeCount: Number(strokeCount || 0),
      practicedAt: practicedAt || new Date().toISOString(),
    });

    this.persist();
    return { totalCount: setBucket[safeChar] };
  }

  getStats() {
    return {
      totals: this.state.totals,
      recentEvents: this.state.events.slice(-20).reverse(),
    };
  }
}

module.exports = {
  PracticeRecordStore,
};
