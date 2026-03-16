const express = require("express");
const os = require("os");
const path = require("path");
const { practiceSetsData } = require("./data/charData");
const { PracticeRecordStore } = require("./repositories/PracticeRecordStore");
const { ScoringService } = require("./services/ScoringService");

const app = express();
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);
const publicDir = path.resolve(__dirname, "..");
const store = new PracticeRecordStore();
const scoringService = new ScoringService();


function findSetById(setId) {
  return practiceSetsData.find((set) => set.id === setId) || null;
}

function getAccessibleUrls(bindHost, bindPort) {
  const urls = new Set([`http://localhost:${bindPort}`]);

  if (bindHost && bindHost !== "0.0.0.0" && bindHost !== "::") {
    urls.add(`http://${bindHost}:${bindPort}`);
    return [...urls];
  }

  const networkInterfaces = os.networkInterfaces();
  Object.values(networkInterfaces).forEach((entries) => {
    (entries || []).forEach((entry) => {
      if (!entry || entry.internal || entry.family !== "IPv4") return;
      urls.add(`http://${entry.address}:${bindPort}`);
    });
  });

  return [...urls];
}


app.use(express.json({ limit: "1mb" }));
app.use(express.static(publicDir));

app.get("/api/char-sets", (_req, res) => {
  res.status(200).json({ items: practiceSetsData });
});

app.get("/api/char-sets/:setId", (req, res) => {
  const set = findSetById(req.params.setId);
  if (!set) {
    res.status(404).json({ error: "指定された文字セットが見つかりません。" });
    return;
  }
  res.status(200).json(set);
});

app.post("/api/practice-records", (req, res) => {
  try {
    const result = store.savePractice({
      setId: req.body.setId,
      char: req.body.char,
      strokeCount: req.body.strokeCount,
      practicedAt: req.body.practicedAt,
    });
    res.status(201).json({
      message: "練習回数を保存しました。",
      ...result,
    });
  } catch (error) {
    res.status(400).json({
      error: "練習回数の保存に失敗しました。",
      details: error.message,
    });
  }
});

app.get("/api/practice-stats", (_req, res) => {
  res.status(200).json(store.getStats());
});

app.post("/api/score", (req, res) => {
  try {
    const result = scoringService.score(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: "採点リクエストの解析または採点処理に失敗しました。",
      details: error.message,
    });
  }
});

app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API が見つかりません。" });
});

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) {
    next();
    return;
  }

  if (path.extname(req.path)) {
    next();
    return;
  }

  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(port, host, () => {
  console.log(`express server listening on ${host}:${port}`);
  getAccessibleUrls(host, port).forEach((url) => {
    console.log(`  -> ${url}`);
  });
});
