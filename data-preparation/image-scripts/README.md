# 画像生成・ダウンロードツール

このディレクトリには、偉人や有名人の画像を生成またはダウンロードするための各種スクリプトが含まれています。

## 利用可能なスクリプト

### 1. `downloadImages.js`

メインスクリプト。`data.js`ファイルに登録されている人物の画像を生成またはダウンロードします。

**使用方法:**

```bash
# プレースホルダー画像を生成（デフォルト）
node data-preparation/image-scripts/downloadImages.js

# Web上から実際の人物画像をダウンロード
node data-preparation/image-scripts/downloadImages.js --web
# または
node data-preparation/image-scripts/downloadImages.js -w
```

### 2. `downloadFromList.js`

テキストファイルのリストから名前を読み込み、Wikipediaから画像をダウンロードします。

**使用方法:**

```bash
node data-preparation/image-scripts/downloadFromList.js
```

初回実行時にサンプルの名前リスト（`name_list.txt`）が作成されます。必要に応じて編集してから再実行してください。

### 3. `testDownload.js`

単一の人物名を指定してWikipediaから画像をダウンロードするテスト用スクリプトです。

**使用方法:**

```bash
node data-preparation/image-scripts/testDownload.js "人物名"
# 例:
node data-preparation/image-scripts/testDownload.js "レオナルド・ダ・ヴィンチ"
```

### 4. `imageHelp.js`

画像生成・ダウンロードツールの使用方法とオプションを表示します。

**使用方法:**

```bash
node data-preparation/image-scripts/imageHelp.js
```

## Web画像ダウンロード機能について

Web画像ダウンロード機能では、以下のソースから順番に画像の取得を試みます：

1. **Wikipedia**: 人物名でWikipediaを検索し、見つかったページの画像を取得（APIキー不要）
2. **Unsplash**: 高品質なフリー画像をAPI経由で取得（APIキーが必要）
3. **Google検索**: Google検索結果から画像を取得（APIキーが必要）

すべてのソースから画像が見つからない場合は、プレースホルダー画像を生成します。

## APIキーの設定

Unsplash APIとGoogle Custom Search APIを使用するには、APIキーを取得して`downloadImages.js`ファイル内の対応する変数に設定する必要があります：

```javascript
// UnsplashのAPIキー
const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';

// Google Custom Search APIのキー
const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
const GOOGLE_CSE_ID = 'YOUR_GOOGLE_CSE_ID';
```

## 注意事項

- Web上の画像を使用する場合は、著作権や利用規約にしたがってください
- APIの利用制限に注意してください
- ダウンロードした画像は自動的に`src/images`ディレクトリに保存されます 