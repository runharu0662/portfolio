# 検証記録

実施日: 2026-10-05

## 実装済み

- Astro / TypeScript / MDX構成、Content Collectionsのschema
- Home / About / Projects / Learning / カテゴリー / 記事詳細
- プロフィールとサイト情報のプレースホルダー
- 目次、最終更新日、タグ、同一カテゴリー内の前後記事
- production時のdraft除外（共通の記事取得関数を使用）
- Light / Dark切り替え、レスポンシブCSS、キーボードfocus、skip link
- Makefile、記事生成、Git publishスクリプト
- GitHub公式Pages actionsを使うworkflow、origin/base設定
- README / .gitignore / favicon

## 実行して確認済み

- `make new TITLE="Test Article" CATEGORY=docker`: 正しい場所にdraft記事を生成
- 同じコマンドの再実行: エラー終了して既存ファイルの上書きを拒否
- テンプレートのfrontmatterとコードフェンスの整合性
- `node --check scripts/new-article.mjs`
- `bash -n scripts/new-article.sh scripts/publish.sh`
- `make publish`: 一時ディレクトリ内のGitリポジトリとbare remoteを使い、stage / 指定MSGでcommit / pushを実行。remoteのcommit一致を確認
- MSG省略時のデフォルトメッセージ、および変更がない場合のcommitスキップとpush

テスト用記事と一時リポジトリは削除済み。実際のGitHubへのpushは実行していません。

## 環境制限により未完了

`npm install` は `registry.npmjs.org` の名前解決が `ENOTFOUND` となり、依存関係を取得できませんでした。オフラインキャッシュにもAstroはありません。

このため次は未確認です:

- `npm install` の成功とpackage-lock.json生成
- `npm ci` / `npm run build` / `make build` の成功
- `npm run dev` / `make dev` の正常起動
- ビルド生成物でのdraft除外・Markdown/MDX・内部リンク・base path検証
- ブラウザーでのPC/mobileレイアウトとテーマ・アクセシビリティ検証
- GitHub Actions実行と実際のGitHub Pages表示

`npm run build`, `make build`, `npm run dev` は実行しましたが、未インストールのため `astro: command not found` で失敗しています。ビルド成功とは扱えません。

workflowは公式Actionsの構成と権限を照合していますが、GitHub上での実行は未検証です。CIが使う `npm ci` とsetup-nodeのcacheにはpackage-lock.jsonが必要です。依存関係をインストールして生成・コミットするまではworkflowを正常実行できません。

## 続きの検証

```bash
npm install
make build
make dev
```

さらに以下でProject Pagesのbaseを確認します:

```bash
SITE_URL=https://USERNAME.github.io BASE_PATH=/portfolio/ make build
npm run preview
```

`/portfolio/` と記事・カテゴリー・制作物ページを開き、CSS / JS / favicon / 内部リンクを確認してください。draft記事を一つ作りproduction一覧・詳細ページに出ないこと、draftをfalseにすると自動で一覧に反映されることも確認します。

READMEのGit初期設定とPages設定を行い、mainへのpush後にActionsのbuild/deploy成功と公開URLを確認してください。
