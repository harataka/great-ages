/**
 * server.js
 * Great Ages アプリケーションのサーバーサイドJavaScript
 * 静的HTMLファイルを提供するための最小限の設定
 * 
 * 使用パッケージ：
 * - express: HTTPサーバーとルーティングの実装に使用
 * - path: ファイルパス操作のためのユーティリティ
 */

// 必要なモジュールのインポート
const express = require('express');
const path = require('path');

// Expressアプリの初期化
const app = express();
const PORT = process.env.PORT || 3000;

// 静的ファイルの提供設定
app.use(express.static(path.join(__dirname, '..')));

/**
 * ルートパスへのGETリクエストを処理
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
}); 