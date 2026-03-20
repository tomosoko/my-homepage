# my-homepage - ファイルマップ

高木滉平の個人ポートフォリオサイト。放射線技師＆AI研究者として対外アピール用。
GitHub Pages で公開中: https://tomosoko.github.io/my-homepage/

技術構成: HTML / CSS / TypeScript + Vite（GitHub Actions でビルド＆デプロイ）

---

## どこに何があるか

| ファイル | 役割 |
|---|---|
| `index.html` | メインHTML（全セクション） |
| `style.css` | スタイル |
| `src/main.ts` | インタラクション・アニメーション（TypeScript） |
| `script.js.bak` | 旧JS（バックアップ） |
| `vite.config.ts` | Vite設定（base: /my-homepage/） |
| `tsconfig.json` | TypeScript設定 |
| `.github/workflows/deploy.yml` | GitHub Actions デプロイワークフロー |

## セクション構成

- About（自己紹介）
- Projects（OsteoVision・ElbowVision・FMC Diet等）
- Presentations（学会発表）
- Skills（技術スタック）
- Contact

## 開発

```bash
npm run dev      # ローカル開発サーバー
npm run build    # 本番ビルド（dist/に出力）
npm run preview  # ビルド結果のプレビュー
```

## デプロイ

```bash
git add . && git commit -m "update" && git push
# GitHub Actions が自動でビルド＆GitHub Pagesにデプロイ
```

GitHub リポジトリの Settings > Pages で Source を「GitHub Actions」に変更すること。

## 注意

- 実名・所属が掲載されている対外公開サイト
- プロジェクト情報は最新の成果を反映させる
- 英語・日本語混在（対外向けは英語優先）
