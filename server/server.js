/**
 * server.js
 * Great Ages アプリケーションのサーバーサイドJavaScript
 * 静的HTMLファイルを提供するための最小限の設定
 * 
 * 使用パッケージ：
 * - express: HTTPサーバーとルーティングの実装に使用
 * - path: ファイルパス操作のためのユーティリティ
 * - pg: PostgreSQL接続用クライアント
 */

// 必要なモジュールのインポート
const express = require('express');
const path = require('path');
const db = require('../db/dbConnection');

// Expressアプリの初期化
const app = express();
const PORT = process.env.PORT || 3000;

// データベース接続テスト
db.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('PostgreSQL接続エラー:', err);
  } else {
    console.log('PostgreSQL接続成功:', res.rows[0]);
  }
});

// JSONパース用ミドルウェア
app.use(express.json());

// 静的ファイルの提供設定
app.use(express.static(path.join(__dirname, '..')));

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('アプリケーションエラー:', err);
  res.status(500).json({
    error: 'サーバーエラーが発生しました',
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

/**
 * ルートパスへのGETリクエストを処理
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

/**
 * 有名人データを取得するAPIエンドポイント
 * クエリパラメータで年齢フィルタリングが可能
 * @param {Object} req - リクエストオブジェクト（クエリパラメータにage=NN形式で年齢指定可能）
 * @param {Object} res - レスポンスオブジェクト
 */
app.get('/api/famous-people', async (req, res) => {
  try {
    // 年齢が指定されている場合
    const { age } = req.query;
    let query;
    let params = [];

    if (age) {
      // 年齢が指定されている場合は、その年齢の有名人を取得
      query = `
        SELECT 
          id, 
          name, 
          birth_date, 
          description, 
          image_url, 
          current_age,
          EXTRACT(YEAR FROM birth_date) as birth_year
        FROM 
          famous_people_with_age
        WHERE 
          current_age = $1
        ORDER BY 
          name
      `;
      params = [age];
    } else {
      // 年齢が指定されていない場合は全ての有名人を取得
      query = `
        SELECT 
          id, 
          name, 
          birth_date, 
          description, 
          image_url, 
          current_age,
          EXTRACT(YEAR FROM birth_date) as birth_year
        FROM 
          famous_people_with_age
        ORDER BY 
          name
      `;
    }

    console.log('実行するクエリ:', query);
    console.log('パラメータ:', params);

    // データベースクエリを実行
    const { rows } = await db.query(query, params);
    console.log('取得結果:', rows.length, '件');

    // クライアント向けに整形
    const formattedData = rows.map(person => ({
      name: person.name,
      age: person.current_age,
      achievement: person.description,
      image: person.image_url,
      birthDate: person.birth_date,
      birthYear: person.birth_year
    }));

    // 結果を返す
    res.json(formattedData);
  } catch (error) {
    console.error('有名人データの取得エラー:', error);
    res.status(500).json({ 
      error: 'データの取得中にエラーが発生しました',
      message: error.message,
      detail: error.detail,
      code: error.code 
    });
  }
});

/**
 * 今日が誕生日の有名人を取得するAPIエンドポイント
 * @param {Object} req - リクエストオブジェクト
 * @param {Object} res - レスポンスオブジェクト
 */
app.get('/api/famous-people/today-birthday', async (req, res) => {
  try {
    // 今日の月日と一致する誕生日の有名人を取得
    const query = `
      SELECT 
        id, 
        name, 
        birth_date, 
        description, 
        image_url, 
        current_age,
        EXTRACT(YEAR FROM birth_date) as birth_year
      FROM 
        famous_people_with_age
      WHERE 
        EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM birth_date) = EXTRACT(DAY FROM CURRENT_DATE)
      ORDER BY 
        name
    `;

    console.log('実行するクエリ:', query);

    // データベースクエリを実行
    const { rows } = await db.query(query);
    console.log('取得結果:', rows.length, '件');

    // クライアント向けに整形
    const formattedData = rows.map(person => ({
      name: person.name,
      age: person.current_age,
      achievement: person.description,
      image: person.image_url,
      birthDate: person.birth_date,
      birthYear: person.birth_year
    }));

    // 結果を返す
    res.json(formattedData);
  } catch (error) {
    console.error('今日が誕生日の有名人データの取得エラー:', error);
    res.status(500).json({ 
      error: 'データの取得中にエラーが発生しました',
      message: error.message,
      detail: error.detail,
      code: error.code 
    });
  }
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
}); 