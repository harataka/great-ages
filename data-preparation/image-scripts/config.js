/**
 * APIキーやその他設定情報の管理ファイル
 * .envファイルや環境変数からAPIキーを読み取り、なければデフォルト値を使用します
 */

// .envファイルを読み込む（存在する場合）
try {
  require('dotenv').config({ path: __dirname + '/.env' });
} catch (error) {
  // dotenvパッケージがない場合のエラーハンドリング
  console.log('注意: dotenvパッケージが見つかりません。.envファイルは読み込みません。');
  console.log('環境変数を直接設定している場合は無視してください。');
  console.log('dotenvを使用するには: npm install dotenv');
}

// 環境変数から設定値を取得（なければデフォルト値を使用）
const config = {
  // Google Custom Search API設定
  google: {
    apiKey: process.env.GOOGLE_API_KEY || '',
    searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID || ''
  },
  
  // その他の設定
  requestDelay: parseInt(process.env.REQUEST_DELAY || '2000'), // リクエスト間隔（ミリ秒）
  
  // 職業情報マッピング
  occupationMap: {
    '天海祐希': '女優',
    'タモリ': 'タレント 司会者',
    '白川静': '漢字学者 教授'
    // 必要に応じて追加
  }
};

/**
 * Google API設定値が正しく設定されているか確認する
 * @returns {boolean} - 設定値が有効かどうか
 */
function validateConfig() {
  if (!config.google.apiKey || !config.google.searchEngineId) {
    console.log('\n⚠️ Google API設定が見つかりません。');
    console.log('以下のいずれかの方法で設定してください:');
    console.log('\n1. 環境変数を直接設定:');
    console.log('Windowsの場合:');
    console.log('  set GOOGLE_API_KEY=あなたのAPIキー');
    console.log('  set GOOGLE_SEARCH_ENGINE_ID=あなたのSearch Engine ID');
    console.log('\nLinux/Macの場合:');
    console.log('  export GOOGLE_API_KEY=あなたのAPIキー');
    console.log('  export GOOGLE_SEARCH_ENGINE_ID=あなたのSearch Engine ID');
    
    console.log('\n2. .envファイルを使用:');
    console.log('  .env.exampleを.envにコピーして値を設定');
    console.log('  npm install dotenvを実行してdotenvをインストール');
    
    return false;
  }
  return true;
}

module.exports = {
  config,
  validateConfig
}; 