```bash
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
