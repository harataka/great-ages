/**
 * Google画像検索ダウンロードスクリプト
 * Google Custom Search APIを使用して有名人の画像を検索・ダウンロードします
 * Wikipediaから画像が取得できない場合の代替手段として利用します
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { promisify } = require('util');
const { config, validateConfig } = require('./config');

// 非同期関数に変換
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

/**
 * ディレクトリが存在するか確認し、なければ作成する
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
 * Google Custom Search APIを使用して画像を検索・ダウンロードする
 * @param {string} name - 検索する人物名
 * @param {string} occupation - 職業や役割（検索精度向上のため）
 * @param {string} outputPath - 保存先パス
 * @returns {Promise<boolean>} - 成功したかどうか
 */
async function downloadImageFromGoogle(name, occupation = '有名人', outputPath) {
  try {
    if (fs.existsSync(outputPath)) {
      console.log(`ファイルは既に存在します: ${outputPath}`);
      return true;
    }
    
    // APIキーとエンジンIDの有効性を確認
    if (!validateConfig()) {
      return false;
    }
    
    // 検索クエリの構築
    const searchQuery = `${name} ${occupation} 顔写真 公式`;
    
    // Google Custom Search APIのエンドポイント
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${config.google.apiKey}&cx=${config.google.searchEngineId}&q=${encodeURIComponent(searchQuery)}&searchType=image&imgSize=large&imgType=face&num=1`;
    
    console.log(`Google Custom Search APIで "${searchQuery}" を検索中...`);
    
    // 画像を検索
    const searchResponse = await axios.get(searchUrl);
    
    // 検索結果がない場合
    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      console.log(`Google検索で "${name}" の画像が見つかりませんでした`);
      return false;
    }
    
    // 最初の画像のURLを取得
    const imageUrl = searchResponse.data.items[0].link;
    console.log(`画像URL: ${imageUrl}`);
    
    // 画像をダウンロード
    const imageResponse = await axios.get(imageUrl, { 
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // 出力ディレクトリを確認
    await ensureDirectoryExists(path.dirname(outputPath));
    
    // ファイルに保存
    await writeFileAsync(outputPath, Buffer.from(imageResponse.data));
    console.log(`Googleから画像をダウンロードしました: ${outputPath} (名前: ${name})`);
    
    return true;
  } catch (error) {
    console.error(`Googleからの画像ダウンロードエラー: ${name}`, error.message);
    return false;
  }
}

/**
 * テキストファイルから名前リストを読み込む
 * @param {string} filePath - 名前リストファイルのパス
 * @returns {Promise<Array<{name: string, occupation: string}>>} - 名前と職業のリスト
 */
async function readNameList(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`名前リストファイルが存在しません: ${filePath}`);
      return [];
    }
    
    const content = await readFileAsync(filePath, 'utf8');
    // 各行を処理し、名前と職業に分割（タブ区切りの場合）
    const names = content.split('\n')
      .filter(line => line.trim() !== '')
      .map(line => {
        const parts = line.split('\t');
        return {
          name: parts[0].trim(),
          occupation: parts.length > 1 ? parts[1].trim() : ''
        };
      });
    
    console.log(`名前リストファイルを読み込みました: ${names.length}件`);
    return names;
  } catch (error) {
    console.error(`名前リスト読み込みエラー: ${filePath}`, error.message);
    return [];
  }
}

/**
 * 名前に職業情報を追加する
 * @param {Array<{name: string, occupation: string}>} namesData - 名前データ
 * @returns {Array<{name: string, occupation: string}>} - 職業情報が追加された名前データ
 */
function addOccupationInfo(namesData) {
  return namesData.map(item => {
    // すでに職業情報がある場合はそのまま使用
    if (item.occupation) {
      return item;
    }
    
    // 職業マッピングから情報を取得
    return {
      name: item.name,
      occupation: config.occupationMap[item.name] || '有名人'
    };
  });
}

/**
 * Wikipediaから取得できなかった画像のリストを作成する
 * @param {string} inputFile - 名前リストファイルのパス
 * @param {string} imagesDir - 画像ディレクトリパス
 * @returns {Promise<Array<{name: string, occupation: string}>>} - ダウンロードが必要な名前のリスト
 */
async function createMissingImagesList(inputFile, imagesDir) {
  // 名前リストを読み込む
  const namesList = await readNameList(inputFile);
  
  // 職業情報を追加
  const namesWithOccupation = addOccupationInfo(namesList);
  
  // 既存の画像を持たない名前だけをフィルタリング
  const missingImages = [];
  
  for (const item of namesWithOccupation) {
    const sanitizedName = item.name.replace(/[\/\\?%*:|"<>]/g, '_');
    const imagePath = path.join(imagesDir, `${sanitizedName}.jpg`);
    
    if (!fs.existsSync(imagePath)) {
      missingImages.push(item);
    }
  }
  
  console.log(`合計${namesList.length}人のうち、${missingImages.length}人の画像が不足しています`);
  return missingImages;
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
  
  // 出力ディレクトリを作成
  await ensureDirectoryExists(outputDir);
  
  // Wikipediaから取得できなかった名前のリストを作成
  const namesToDownload = await createMissingImagesList(nameListPath, outputDir);
  
  if (namesToDownload.length === 0) {
    console.log('すべての画像が既にダウンロード済みです。');
    return;
  }
  
  console.log(`${namesToDownload.length}人の画像のダウンロードを開始します...`);
  
  // 各名前に対して画像をダウンロード
  let successCount = 0;
  let failureCount = 0;
  
  for (const item of namesToDownload) {
    const sanitizedName = item.name.replace(/[\/\\?%*:|"<>]/g, '_');
    const outputPath = path.join(outputDir, `${sanitizedName}.jpg`);
    
    const index = namesToDownload.indexOf(item) + 1;
    console.log(`[${index}/${namesToDownload.length}] ${item.name}の画像を取得中...`);
    
    const success = await downloadImageFromGoogle(item.name, item.occupation, outputPath);
    
    if (success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // APIリクエスト間隔を空ける
    await new Promise(resolve => setTimeout(resolve, config.requestDelay));
  }
  
  console.log('\n===== ダウンロード結果 =====');
  console.log(`成功: ${successCount}件`);
  console.log(`失敗: ${failureCount}件`);
  console.log(`合計: ${namesToDownload.length}件`);
  console.log(`保存先: ${outputDir}`);
  
  if (failureCount > 0) {
    console.log('\n注意: いくつかの画像のダウンロードに失敗しました。');
    console.log('以下の代替手段を検討してください:');
    console.log('1. 出力ディレクトリを確認し、手動でダウンロードする');
    console.log('2. 検索クエリを調整してもう一度試す');
    console.log('3. Bing Image Search APIなど別のAPIを試す');
  }
}

// スクリプト実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
}); 