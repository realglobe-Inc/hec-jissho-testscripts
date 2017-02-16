# hec-jissho-testscripts
総務省IoT実証実験。負荷実験用スクリプト

### 1.通報が大量に来る

接続維持

+ 通報数 ... 100, 200, 500, 1000, 2000, 5000

```sh
$ REPORTERS=100 ./bin/report_connect.js &> var/log/report_connect.log
```

通報したら切断

+ 1秒あたりの通報数 ... 1, 10, 20, 30, 40, 50, 100

```sh
$ REPORT_PER_SECOND=1 ./bin/report_disconnect.js &> var/log/report_disconnect.log
```

### 2. 画像が大量に来る

+ 1秒あたりの画像投稿数 ... 1, 10, 20, 50, 100
+ 画像サイズ ... 320×180, 1280x720, 1920×1080, 4096×2160

```sh
$ POSTS_PAR_SECOND=1 IMG_SIZE =320x180 ./bin/upload.js &> var/log/upload.log
```

### 3. 閲覧者が大量にいる

+ ブラウザ ... 1, 10, 50, 100, 150, 200, 500

```sh
$ ./bin/browser.js &> var/log/browser.log
```

## 実験後の作業ログ

+ logs/ にログを移動
+ nginx log を app-nginx/ に移してファイル名整理
+ app/vmstat.log を app-vmstat/ に移動
+ app/ の中で不要なログファイルを削除(実験が失敗しているものなど) : `bin/evaluate/rm_needless_logs.js`
+ 実験できていない項目を洗い出して再実験した : `bin/evaluate/check.js`
