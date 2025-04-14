/**
 * 画像生成・ダウンロードツールのヘルプスクリプト
 * 使用方法と利用可能なオプションを表示します
 */

console.log(`
================================================
  画像生成・ダウンロードツール 使用方法
================================================

このツールは、data.jsファイルに登録されている人物の画像を生成またはダウンロードします。

【基本的な使用方法】

1. プレースホルダー画像を生成する（デフォルト）:
   node data-preparation/image-scripts/downloadImages.js

2. Web上から実際の人物画像をダウンロードする:
   node data-preparation/image-scripts/downloadImages.js --web
   または
   node data-preparation/image-scripts/downloadImages.js -w

【Web画像ダウンロード機能について】

Web画像ダウンロード機能を使用する場合は、以下のAPIキーを設定する必要があります:
* Unsplash API (一部機能)
* Google Custom Search API (一部機能)

これらのAPIキーを取得して、data-preparation/image-scripts/downloadImages.jsファイル内の
対応する変数に設定してください。

【機能詳細】

* プレースホルダー画像生成:
  - 人物名から自動的にイニシャルと背景色を設定した画像を生成
  - 偉人と有名人で異なる色使いで区別

* Web画像ダウンロード:
  - Wikipedia: 人物名でWikipediaを検索し、見つかったページの画像を取得
  - Unsplash: 高品質なフリー画像をAPI経由で取得 (APIキーが必要)
  - Google検索: 最後の手段としてGoogle検索結果から画像を取得 (APIキーが必要)

【注意事項】

* Web上の画像を使用する場合は、著作権や利用規約にしたがってください
* APIの利用制限に注意してください
* ダウンロードした画像は自動的にsrc/imagesディレクトリに保存されます

================================================
`); 