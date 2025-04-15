/**
 * データベース接続設定を管理するファイル
 * Heroku PostgreSQLとの接続を処理します
 */
const { Pool } = require('pg');

/**
 * データベース接続プールを作成
 * 環境変数DATABASE_URLがある場合はそちらを使用し、ない場合はローカル設定を使用
 * @returns {Pool} PostgreSQL接続プール
 */
const createPool = () => {
  if (process.env.DATABASE_URL) {
    // Heroku環境用の設定
    return new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  } else {
    // ローカル開発環境用の設定
    return new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'great_ages_db',
      password: process.env.DB_PASSWORD || 'postgres',
      port: process.env.DB_PORT || 5432,
    });
  }
};

const pool = createPool();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
}; 