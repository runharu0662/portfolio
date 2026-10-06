# Docker で開発する

Docker を起動してから、プロジェクトのルートで実行します。ホストへの Node.js のインストールは不要です。

```sh
make dev
```

Makefile は `docker compose` を優先し、利用できない場合は `docker-compose` を使います。`make dev COMPOSE=docker-compose` のように明示することもできます。

http://localhost:4321/ を開きます。`src` と `public` の編集は自動反映されます。ソースと設定ファイルは読み取り専用でマウントされ、依存パッケージと生成物（`node_modules`・`.astro`・`dist`）はコンテナ内に保存されます。

Docker 内のファイル監視は300ミリ秒間隔のポーリングを使い、ホスト側の変更通知が届かない環境でも編集を検知します。この設定を既存のコンテナに適用するには、一度 `make dev` でコンテナを再作成してください。その後の記事やスタイルの編集に `make build` は不要です。

停止・コンテナ削除:

```sh
make stop
```

型チェックとビルドもコンテナ内で実行できます。

```sh
make check
make build
```

`make dev`・`make check`・`make build`・`make new` は実行前にイメージをビルドするので、依存関係やマウント対象以外のファイルの変更も取り込みます。`make build` の生成物は一時コンテナ内に保存され、終了時に削除されます。

記事生成とログの確認:

```sh
make new TITLE="Docker Network" CATEGORY=docker SLUG=docker-network
make logs
```

`make new` は記事をホストに保存するため、このコマンドだけ `src` を書き込み可能にマウントします。`TITLE` は必須、`CATEGORY`・`SLUG` は省略可能です。標準では LinkCard の import を含む `.mdx` 記事を作成します。従来の `.md` を作る場合は `make new TITLE="Docker Network" CATEGORY=docker FORMAT=md` を指定します。同じカテゴリ・slugの `.md` または `.mdx` が存在する場合は作成を拒否します。`make publish MSG="docs: update portfolio"` はホストの Git でコミットとプッシュを実行します。

公開先の URL とパスを指定してビルドする場合:

```sh
SITE_URL=https://example.com BASE_PATH=/portfolio/ make build
```

Compose はルートの `.env` があれば読み込みます。`.env.example` の `BASE_PATH=/portfolio/` を使う場合、開発サイトも http://localhost:4321/portfolio/ で開きます。環境ファイルはイメージには含めません。
