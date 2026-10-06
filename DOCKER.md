# Docker で開発する

Docker を起動してから、プロジェクトのルートで実行します。ホストへの Node.js のインストールは不要です。

```sh
docker compose up --build
```

`docker compose` が使えず `docker-compose` がインストールされている環境では、以下のコマンドの `docker compose` を `docker-compose` に置き換えてください。

http://localhost:4321/ を開きます。`src` と `public` の編集は自動反映されます。ソースと設定ファイルは読み取り専用でマウントされ、依存パッケージと生成物（`node_modules`・`.astro`・`dist`）はコンテナ内に保存されます。

停止・コンテナ削除:

```sh
docker compose down
```

型チェックとビルドもコンテナ内で実行できます。

```sh
docker compose run --rm web npm run check
docker compose run --rm web npm run build
```

`package.json` や `package-lock.json` を変更したら、`docker compose up --build` でイメージを再ビルドしてください。マウント対象以外のファイルを変更した場合も再ビルドが必要です。

公開先の URL とパスを指定してビルドする場合:

```sh
SITE_URL=https://example.com BASE_PATH=/portfolio/ docker compose run --rm web npm run build
```

Compose はルートの `.env` があれば読み込みます。`.env.example` の `BASE_PATH=/portfolio/` を使う場合、開発サイトも http://localhost:4321/portfolio/ で開きます。環境ファイルはイメージには含めません。
