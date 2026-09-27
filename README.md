# Ukulele Rhythm Game

Vite、React、TypeScript で作成した、ウクレレのコードリズムゲームのプロトタイプです。

**開発ステータス: 開発中**

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで Vite が表示するローカル URL を開いてください。

## 操作方法

「リズムモード開始」を押し、流れてくるコードが中央の判定ラインに重なるタイミングでキーを押します。

| キー | コード |
| --- | --- |
| `C` | C |
| `G` | G |
| `A` | Am |
| `F` | F |

入力タイミングに応じて `Great`、`Good`、`Miss` が判定され、スコアとコンボが更新されます。

## コマンド

```bash
npm run dev      # 開発サーバー
npm run build    # プロダクションビルド
npm run lint     # ESLint
npm run preview  # ビルド結果のプレビュー
```
