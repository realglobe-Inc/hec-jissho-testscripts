# hec-jissho-testscripts
総務省IoT実証実験。負荷実験用スクリプト

## 測定するケース

+ ケース1 - 通報が大量に来る（通報クライアントは WebSocket 接続を継続する）
+ ケース2 - 通報が大量に来る（通報クライアントは一度通報したら WebSocket 接続を切断する）
+ ケース3 - 画像投稿が大量に来る

ケース 1, 2 においては、 WebSocket 接続数がボトルネックになりうるので、同時にブラウザも複数立てて計測する。

## 計測する指標

各実験に共通する指標は、以下。

+ アプリケーション VM のメモリとCPU使用率
+ Redis VM のメモリとCPU使用率
+ データベース VM のメモリとCPU使用率

ケース 1, 2 においては、共通指標に加えて以下を計測する。

+ 通報クライアントが通報を開始する直前の時間から、ブラウザが最初に通報を受け取るまでの時間（秒）

ケース 3 においては、共通指標に加えて以下を計測する。

+ 画像投稿クライアントが画像投稿のための HTTP POST リクエストを開始してから、終了するまでの時間（秒）

## 計測する状況

各ケースにおいて、計測する状況は以下のすべての組み合わせである。

ケース1

+ 通報クライアント数 - 100, 200, 500, 1000, 2000, 5000
+ ブラウザ数 - 1, 10, 50, 100, 150, 200, 500

ケース2

+ 1秒あたりの通報数 - 1, 10, 20, 30, 40, 50, 100
+ ブラウザ数 - 1, 10, 50, 100, 150, 200, 500

ケース3

+ 1秒あたりの画像投稿数 ... 1, 10, 20, 50, 100
+ 画像サイズ ... 320×180, 1280x720, 1920×1080, 4096×2160

なお、各画像のファイルサイズは以下の通りである。

|画像サイズ|ファイルサイズ|
|---|---|
|320x180|8.52KB|
|1280x720|141KB|
|1920x1080|743KB|
|4096x2160|1.223MB|

## VM のスペック

各 VM のスペックは同じ。詳細は JOSE の資料参照のこと。

+ OS - ubuntu14.04
+ CPU - 2CPU
+ メモリ - 8GB
+ ディスク容量 - 8GB

## 実験結果

+ [ケース 1 の実験結果(csv)](./results/report_connect.csv)
+ [ケース 2 の実験結果(csv)](./results/report_disconnect.csv)
+ [ケース 3 の実験結果(csv)](./results/upload.csv)

## 実験実行スクリプト

以下は実行例である。

ケース 1 - 通報クライアント

```sh
$ REPORTERS=100 ./scripts/experiment/report_connect.js &> var/log/report_connect.log
```

ケース 2 - 通報クライアント

```sh
$ REPORT_PER_SECOND=1 ./scripts/experiment/report_disconnect.js &> var/log/report_disconnect.log
```

ケース 3 - 画像投稿クライアント

```sh
$ POSTS_PAR_SECOND=1 IMG_SIZE =320x180 ./scripts/experiment/upload.js &> var/log/upload.log
```

ケース 1, 2 - ブラウザ

```sh
$ ./scripts/experiment/browser.js &> var/log/browser.log
```
