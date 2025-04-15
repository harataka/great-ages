/**
 * 偉人データ取得モジュール
 * データベースから偉人情報を取得する機能を提供
 */

import { FAMOUS_PEOPLE_API_URL, ERROR_MESSAGES } from './appSettings.js';

/**
 * データベースから有名人データを取得する関数
 * @param {number} age - 検索する年齢（指定した場合はその年齢の有名人のみ返す）
 * @returns {Promise<Array>} - 有名人データの配列
 * @throws {Error} - API呼び出しに失敗した場合
 */
async function fetchFamousPeopleData(age = null) {
    // APIエンドポイントのURL
    let url = FAMOUS_PEOPLE_API_URL;
    
    // 年齢が指定されている場合はクエリパラメータを追加
    if (age !== null) {
        url += `?age=${age}`;
    }
    
    // データを取得
    const response = await fetch(url);
    
    // レスポンスが正常でない場合はエラーをスロー
    if (!response.ok) {
        throw new Error(ERROR_MESSAGES.API_FETCH_FAILED);
    }
    
    // JSONデータを解析して返す
    const data = await response.json();
    return data;
}

// グローバルで利用できるようにエクスポート
export { fetchFamousPeopleData };