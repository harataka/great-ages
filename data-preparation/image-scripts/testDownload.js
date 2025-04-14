/**
 * Web画像ダウンロードのテストスクリプト
 * 単一の人物名を指定してWikipediaから画像をダウンロードします
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');

// 非同期関数に変換
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * 指定されたパスにディレクトリが存在しない場合は作成する
 * @param {string} dirPath - 作成するディレクトリパス
 * @returns {Promise<void>} - 処理結果のPromise
 */
async function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      await mkdirAsync(dirPath, { recursive: true });
      console.log(`ディレクトリを作成しました: ${dirPath}`);
    }
  } catch (error) {
    console.error(`ディレクトリ作成エラー: ${dirPath}`, error);
  }
}

/**
 * Wikipediaから画像を検索・ダウンロードする
 * @param {string} name - 検索する人物名
 * @param {string} outputPath - 保存先パス
 * @returns {Promise<boolean>} - 成功したかどうか
 */
async function downloadImageFromWikipedia(name, outputPath) {
  try {    
    // Wikipediaの検索API
    const searchUrl = `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
    console.log(`検索URL: ${searchUrl}`);
    
    const searchResponse = await axios.get(searchUrl);
    console.log('検索結果:', JSON.stringify(searchResponse.data, null, 2).substring(0, 500) + '...');
    
    // 検索結果がない場合
    if (!searchResponse.data.query.search.length) {
      console.log(`Wikipediaで"${name}"が見つかりませんでした`);
      return false;
    }
    
    // 最初の検索結果のページタイトルを取得
    const pageTitle = searchResponse.data.query.search[0].title;
    console.log(`ページタイトル: ${pageTitle}`);
    
    // ページ情報を取得（画像を含む）
    const imageInfoUrl = `https://ja.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
    console.log(`画像情報URL: ${imageInfoUrl}`);
    
    const imageInfoResponse = await axios.get(imageInfoUrl);
    console.log('画像情報:', JSON.stringify(imageInfoResponse.data, null, 2));
    
    const pages = imageInfoResponse.data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    // サムネイル画像がない場合
    if (!pages[pageId].thumbnail) {
      console.log(`Wikipediaの"${name}"ページに画像が見つかりませんでした`);
      return false;
    }
    
    // 画像URLを取得
    const imageUrl = pages[pageId].thumbnail.source;
    console.log(`画像URL: ${imageUrl}`);
    
    // 画像をダウンロード
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    // 出力ディレクトリを確認
    await ensureDirectoryExists(path.dirname(outputPath));
    
    // ファイルに保存
    await writeFileAsync(outputPath, Buffer.from(imageResponse.data));
    console.log(`Wikipediaから画像をダウンロードしました: ${outputPath} (名前: ${name})`);
    
    return true;
  } catch (error) {
    console.error(`Wikipediaからの画像ダウンロードエラー: ${name}`, error.message);
    console.error('詳細エラー:', error);
    return false;
  }
}

/**
 * テスト実行
 */
async function main() {
  // コマンドライン引数から人物名を取得
  const args = process.argv.slice(2);
  const personName = args[0] || 'アインシュタイン'; // デフォルト名
  
  // スクリプトの実行パスを取得
  const scriptDir = __dirname;
  
  // 出力パス
  const outputDir = path.join(scriptDir, '..', '..', 'src', 'images', 'test');
  const outputPath = path.join(outputDir, `${personName.replace(/\s+/g, '_')}.jpg`);
  
  console.log(`人物名: ${personName}`);
  console.log(`保存先: ${outputPath}`);
  
  // Wikipediaから画像をダウンロード
  const success = await downloadImageFromWikipedia(personName, outputPath);
  
  if (success) {
    console.log('テスト成功: 画像のダウンロードに成功しました');
  } else {
    console.log('テスト失敗: 画像のダウンロードに失敗しました');
  }
}

// スクリプト実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
}); 