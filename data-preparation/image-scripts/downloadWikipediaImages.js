/**
 * Wikipediaイメージダウンロードスクリプト
 * テキストファイルから名前リストを読み込んでWikipediaから画像をダウンロードします
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');

// 非同期関数に変換
const readFileAsync = promisify(fs.readFile);
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
    if (fs.existsSync(outputPath)) {
      console.log(`ファイルは既に存在します: ${outputPath}`);
      return true;
    }
    
    // Wikipediaの検索API
    const searchUrl = `https://ja.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(name)}&format=json&origin=*`;
    
    const searchResponse = await axios.get(searchUrl);
    
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
    
    const imageInfoResponse = await axios.get(imageInfoUrl);
    
    const pages = imageInfoResponse.data.query.pages;
    const pageId = Object.keys(pages)[0];
    
    // サムネイル画像がない場合
    if (!pages[pageId].thumbnail) {
      console.log(`Wikipediaの"${name}"ページに画像が見つかりませんでした`);
      return false;
    }
    
    // 画像URLを取得
    const imageUrl = pages[pageId].thumbnail.source;
    
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
    return false;
  }
}

/**
 * テキストファイルから名前リストを読み込む
 * @param {string} filePath - 名前リストファイルのパス
 * @returns {Promise<string[]>} - 名前リスト
 */
async function readNameList(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`名前リストファイルが存在しません: ${filePath}`);
      return [];
    }
    
    const content = await readFileAsync(filePath, 'utf8');
    const names = content.split('\n').filter(name => name.trim() !== '');
    
    console.log(`名前リストファイルを読み込みました: ${names.length}件`);
    return names;
  } catch (error) {
    console.error(`名前リスト読み込みエラー: ${filePath}`, error.message);
    return [];
  }
}

/**
 * メイン実行関数
 */
async function main() {
  // スクリプトの実行パスを取得
  const scriptDir = __dirname;
  
  // 出力ディレクトリ
  const outputDir = path.join(scriptDir, '..', '..', 'src', 'images', 'all_persons');
  
  // 名前リストファイル
  const nameListPath = path.join(scriptDir, 'extracted_names.txt');
  
  // 名前リストファイルから名前を読み込む
  const names = await readNameList(nameListPath);
  
  if (names.length === 0) {
    console.log('名前リストが空です。まず extractNamesList.js を実行してください。');
    return;
  }
  
  // 出力ディレクトリを作成
  await ensureDirectoryExists(outputDir);
  
  console.log(`${names.length}人の画像のダウンロードを開始します...`);
  
  // 各名前に対して画像をダウンロード
  let successCount = 0;
  let failureCount = 0;
  
  for (const name of names) {
    const sanitizedName = name.replace(/[\/\\?%*:|"<>]/g, '_');
    const outputPath = path.join(outputDir, `${sanitizedName}.jpg`);
    
    console.log(`[${names.indexOf(name) + 1}/${names.length}] ${name}の画像を取得中...`);
    
    const success = await downloadImageFromWikipedia(name, outputPath);
    
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // APIリクエスト間隔を空ける（1秒）
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n===== ダウンロード結果 =====');
  console.log(`成功: ${successCount}件`);
  console.log(`失敗: ${failureCount}件`);
  console.log(`合計: ${names.length}件`);
  console.log(`保存先: ${outputDir}`);
}

// スクリプト実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
}); 