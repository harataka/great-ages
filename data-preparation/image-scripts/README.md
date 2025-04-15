# 画像ダウンロードスクリプト

このディレクトリには、必要な人物画像をダウンロードするためのスクリプトが含まれています。

## 名前リスト抽出からWikipedia画像ダウンロードまでの手順

1. `extractNamesList.js` - data.jsファイルから人物名リストを抽出してテキストファイルに保存
2. `downloadWikipediaImages.js` - 抽出された名前リストを使用してWikipediaから画像をダウンロード

## 実行方法

### 1. 名前リストの抽出

```bash
node extractNamesList.js
```

これにより、`extracted_names.txt`ファイルが作成されます。

### 2. Wikipedia画像のダウンロード

```bash
node downloadWikipediaImages.js
```

このスクリプトは、`extracted_names.txt`ファイルから名前リストを読み込み、Wikipediaから画像をダウンロードします。
画像は `src/images/all_persons` ディレクトリに保存されます。

## 参考: その他のスクリプト

- `downloadImages.js` - より多くの画像ソース（Google、Unsplash）からのダウンロードもサポートする古いスクリプト

## 前提条件

これらのスクリプトを実行するには、Node.jsとnpmがインストールされている必要があります。
また、以下のnpmパッケージが必要です：

```bash
npm install axios
```

## ローカル実行時
 cd C:\Users\harat\Dropbox\02_dev\Web\great-ages\
 
 C:\Users\harat\Dropbox\02_dev\Web\great-ages\data-preparation\image-scripts
 ↓
 node extractNamesList.js

## 注意事項

- APIリクエストの制限を超えないようにするため、リクエスト間に1秒の遅延を設けています。
- すでに画像が存在する場合は、ダウンロードをスキップします。
- ダウンロードに失敗した場合は、ログに記録されます。
