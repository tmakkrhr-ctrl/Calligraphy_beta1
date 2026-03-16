# backend

文字練習アプリのバックエンド処理をこのディレクトリに分離しています。

## 起動

```bash
node backend/server.js
```

既定ポートは `3000` です。既定ホストは `0.0.0.0` なので、同じ LAN 内のスマートフォンや別PCからも `http://<このPCのIPアドレス>:3000` でアクセスできます。

## API

- `GET /api/char-sets`
  - 文字セット一覧を返す
- `GET /api/char-sets/:setId`
  - 文字セット詳細を返す
- `POST /api/practice-records`
  - 練習回数を保存する
  - body: `{ "setId": "...", "char": "...", "strokeCount": 12 }`
- `GET /api/practice-stats`
  - 練習回数の集計と最近の保存イベントを返す
- `POST /api/score`
  - `browser` が生成した比較用マスクを受け取り、一致度を返す
  - body:
    `{ "setId": "greek", "char": "α", "analysisVersion": "browser-rasterized-mask-v1", "canvas": { "width": 96, "height": 96 }, "sampleMask": [12, 18], "userMask": [18, 19] }`
