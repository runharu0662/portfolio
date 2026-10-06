# 記事内のリンクカード

`make new TITLE="Docker Network" CATEGORY=docker` で、LinkCard の import を含む `.mdx` 記事を作成できます。本文に `<LinkCard url="https://example.com/" />` を追加してください。`FORMAT=md` を指定すると従来の `.md` を作成します。

既存の記事を `.md` から `.mdx` に変更し、frontmatter の後にコンポーネントを import します。`src/content/learning/docker/` 内の記事の場合:

```mdx
import LinkCard from '../../../components/LinkCard.astro';

## 参考リンク

<LinkCard url="https://docs.astro.build/en/guides/integrations-guide/mdx/" />
```

Astro ページでは通常の Astro コンポーネントとして import できます。通常の `.md` はコンポーネントの import に対応しないため `.mdx` を使います。[Astro MDX ドキュメント](https://docs.astro.build/en/guides/integrations-guide/mdx/)

`src/lib/ogp.ts` は取得・解析・URL検証を担当し、`src/components/LinkCard.astro` は表示を担当します。将来の bare URL 自動展開プラグインからも `getOgp()` と `parseOgp()` を再利用できます。現時点では自動展開は行いません。

OGP は静的ビルド時（開発中はページ表示時）に取得します。title / description / image / siteName を読み取り、OGP がなければ Twitter metadata、HTML title、description も利用します。相対画像URLはリダイレクト後のページURLを基準に解決します。

取得はURLごとに最大5秒、リダイレクトは5回まで、HTMLは1MiBまでです。HTTPエラー、非HTML、タイトルなし、ネットワーク障害、タイムアウトは通常リンクに戻り、ビルドを継続します。HTTP(S)以外や認証情報入りのURLは取得せず、リンク化せず文字列として表示します。外部の文字列はAstroのエスケープを通して表示します。

同じURLへの取得はプロセス内で5分間キャッシュし、同時取得と失敗も共有します（最大256件）。永続キャッシュではないため、次のビルドでは再取得します。画像はブラウザが外部URLから読み込み、読み込みに失敗すると非表示にします。既存のLight/Dark変数、画像なし、モバイルとprose内の表示に対応しています。

コンテナで実行:

```sh
make dev
make build
docker-compose run --rm --build web node --experimental-strip-types --test scripts/ogp.test.mjs
docker-compose run --rm --build web node --test scripts/link-card.test.mjs
```

依存関係はDockerイメージ内にインストールされます。記事編集の反映には `make dev` を使用してください。
