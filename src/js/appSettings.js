/**
 * Great Ages アプリケーションの設定ファイル
 * APIエンドポイントやその他の設定値を管理します
 */

// API関連の設定
export const FAMOUS_PEOPLE_API_URL = '/api/famous-people';

// その他の設定値
export const DEFAULT_AGE = 40;
export const MIN_AGE = 40;
export const MAX_AGE = 49;

// エラーメッセージの定義
export const ERROR_MESSAGES = {
  API_FETCH_FAILED: 'APIからのデータ取得に失敗しました',
  INVALID_AGE: '40~49の年齢を入力してください'
}; 