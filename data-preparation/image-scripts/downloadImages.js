/**
 * 画像生成・収集スクリプト
 * data.jsファイルから画像パスと人物名を抽出し、以下の機能を提供します：
 * 1. ローカルでプレースホルダー画像を生成して保存
 * 2. Web APIを使用して実際の人物画像を検索・ダウンロード
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const { promisify } = require('util');
const axios = require('axios');

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
 * テキストのラッピングを行う補助関数
 * @param {CanvasRenderingContext2D} context - キャンバスコンテキスト
 * @param {string} text - ラップするテキスト
 * @param {number} maxWidth - 最大幅
 * @returns {string[]} - ラップされたテキスト行の配列
 */
function wrapText(context, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = context.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * 16進数の色コードをRGBに変換
 * @param {string} hex - 16進数の色コード
 * @returns {object} - RGBオブジェクト
 */
function hexToRgb(hex) {
  // #を削除
  hex = hex.replace(/^#/, '');
  
  // ショートハンドの場合は展開
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * RGBの明るさを計算する
 * @param {number} r - 赤
 * @param {number} g - 緑
 * @param {number} b - 青
 * @returns {number} - 明るさ (0-255)
 */
function getBrightness(r, g, b) {
  // 人間の目は色によって感度が異なるため、適切な重みを使用
  return (r * 0.299 + g * 0.587 + b * 0.114);
}

/**
 * ローカルでプレースホルダー画像を生成する
 * @param {string} name - 人物名
 * @param {string} outputPath - 保存先パス
 * @param {string} type - 画像の種類（偉人/有名人）
 * @returns {Promise<void>} - 処理結果のPromise
 */
async function generatePlaceholderImage(name, outputPath, type) {
  try {
    if (fs.existsSync(outputPath)) {
      console.log(`ファイルは既に存在します: ${outputPath}`);
      return;
    }

    // 画像のサイズやテキストをカスタマイズ
    const width = 800;
    const height = 600;
    
    // 背景色を設定（偉人と有名人で色を変える）
    const bgColor = type === 'greatPeople' ? '#3498db' : '#27ae60';
    
    // 背景色に基づいてテキスト色を計算（明るい背景には暗いテキスト、暗い背景には明るいテキスト）
    const rgb = hexToRgb(bgColor);
    const brightness = getBrightness(rgb.r, rgb.g, rgb.b);
    const textColor = brightness > 128 ? '#000000' : '#ffffff';
    
    // イニシャル取得
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2); // 最大2文字
    
    // キャンバスを作成
    const canvas = createCanvas(width, height);
    const context = canvas.getContext('2d');
    
    // 背景を描画
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);
    
    // 円形でイニシャルを描画
    const centerX = width / 2;
    const centerY = height / 3;
    const radius = Math.min(width, height) / 6;
    
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
    context.fillStyle = textColor;
    context.fill();
    
    // イニシャルを描画
    context.fillStyle = bgColor;
    context.font = `bold ${radius}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(initials, centerX, centerY);
    
    // 名前を描画
    context.fillStyle = textColor;
    context.font = `bold ${height / 16}px Arial, sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    
    // テキストをラップして複数行に表示
    const maxLineWidth = width * 0.8;
    const lines = wrapText(context, name, maxLineWidth);
    
    // 各行を描画
    const lineHeight = height / 14;
    let y = height / 2;
    
    lines.forEach(line => {
      context.fillText(line, centerX, y);
      y += lineHeight;
    });
    
    // タイプ情報を描画
    const typeText = type === 'greatPeople' ? '偉人' : '有名人';
    context.font = `${height / 20}px Arial, sans-serif`;
    context.fillText(typeText, centerX, height - 50);
    
    // キャンバスから画像バッファを取得
    const buffer = canvas.toBuffer('image/jpeg');
    
    // ファイルに保存
    await writeFileAsync(outputPath, buffer);
    console.log(`画像を生成しました: ${outputPath} (名前: ${name})`);
  } catch (error) {
    console.error(`画像生成エラー: ${outputPath}`, error.message);
  }
}

/**
 * Unsplash APIを使用して画像を検索・ダウンロードする
 * @param {string} name - 検索する人物名
 * @param {string} outputPath - 保存先パス
 * @returns {Promise<boolean>} - 成功したかどうか
 */
async function downloadImageFromUnsplash(name, outputPath) {
  // Unsplash APIのアクセスキー（実際の利用時には自分のキーに置き換える必要があります）
  const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY';
  
  try {
    if (fs.existsSync(outputPath)) {
      console.log(`ファイルは既に存在します: ${outputPath}`);
      return true;
    }
    
    // Unsplash APIから画像を検索
    const searchResponse = await axios.get('https://api.unsplash.com/search/photos', {
      params: {
        query: name,
        per_page: 1
      },
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
    
    // 検索結果がない場合
    if (searchResponse.data.results.length === 0) {
      console.log(`"${name}"の画像が見つかりませんでした`);
      return false;
    }
    
    // 最初の結果の画像URLを取得
    const imageUrl = searchResponse.data.results[0].urls.regular;
    
    // 画像をダウンロード
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    // ファイルに保存
    await writeFileAsync(outputPath, Buffer.from(imageResponse.data));
    console.log(`画像をダウンロードしました: ${outputPath} (名前: ${name})`);
    
    return true;
  } catch (error) {
    console.error(`Unsplashからの画像ダウンロードエラー: ${name}`, error.message);
    return false;
  }
}

/**
 * Google Custom Search APIを使用して画像を検索・ダウンロードする
 * @param {string} name - 検索する人物名
 * @param {string} outputPath - 保存先パス
 * @returns {Promise<boolean>} - 成功したかどうか
 */
async function downloadImageFromGoogle(name, outputPath) {
  // Google Custom Search APIのキー（実際の利用時には自分のキーに置き換える必要があります）
  const GOOGLE_API_KEY = 'YOUR_GOOGLE_API_KEY';
  const GOOGLE_CSE_ID = 'YOUR_GOOGLE_CSE_ID';
  
  try {
    if (fs.existsSync(outputPath)) {
      console.log(`ファイルは既に存在します: ${outputPath}`);
      return true;
    }
    
    // Google Custom Search APIから画像を検索
    const searchResponse = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: GOOGLE_CSE_ID,
        q: name,
        searchType: 'image',
        num: 1
      }
    });
    
    // 検索結果がない場合
    if (!searchResponse.data.items || searchResponse.data.items.length === 0) {
      console.log(`"${name}"の画像が見つかりませんでした`);
      return false;
    }
    
    // 最初の結果の画像URLを取得
    const imageUrl = searchResponse.data.items[0].link;
    
    // 画像をダウンロード
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    
    // ファイルに保存
    await writeFileAsync(outputPath, Buffer.from(imageResponse.data));
    console.log(`画像をダウンロードしました: ${outputPath} (名前: ${name})`);
    
    return true;
  } catch (error) {
    console.error(`Googleからの画像ダウンロードエラー: ${name}`, error.message);
    return false;
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
 * 複数の画像ソースから画像を取得する
 * @param {string} name - 人物名
 * @param {string} outputPath - 保存先パス
 * @param {string} type - 画像の種類（偉人/有名人）
 * @param {boolean} webDownload - Web上から画像をダウンロードするかどうか
 * @returns {Promise<void>} - 処理結果のPromise
 */
async function getImage(name, outputPath, type, webDownload = true) {
  try {
    // すでに画像が存在する場合は何もしない
    if (fs.existsSync(outputPath)) {
      console.log(`画像はすでに存在します: ${outputPath}`);
      return;
    }

    // Webダウンロードが有効な場合、各ソースから画像を取得を試みる
    if (webDownload) {
      // まずはWikipediaから試みる
      let success = await downloadImageFromWikipedia(name, outputPath);
      
      // 失敗した場合はUnsplashを試す
      if (!success) {
        success = await downloadImageFromUnsplash(name, outputPath);
      }
      
      // それも失敗した場合はGoogleを試す
      if (!success) {
        success = await downloadImageFromGoogle(name, outputPath);
      }
      
      // すべて失敗した場合はプレースホルダー画像を生成
      if (!success) {
        console.log(`Web上の画像取得に失敗したため、プレースホルダー画像を生成します: ${name}`);
        await generatePlaceholderImage(name, outputPath, type);
      }
    } else {
      // Webダウンロードが無効の場合はプレースホルダー画像を生成
      await generatePlaceholderImage(name, outputPath, type);
    }
  } catch (error) {
    console.error(`画像取得エラー: ${name}`, error.message);
    
    // エラーが発生した場合はプレースホルダー画像を生成
    try {
      await generatePlaceholderImage(name, outputPath, type);
    } catch (placeholderError) {
      console.error(`プレースホルダー画像生成エラー: ${name}`, placeholderError.message);
    }
  }
}

/**
 * data.jsからデータを抽出して画像を取得する
 * @param {boolean} useWebImages - Web上から画像をダウンロードするかどうか
 */
async function main(useWebImages = false) {
  // スクリプトの実行パスを取得
  const scriptDir = __dirname;
  
  // data.jsの内容を読み込む（文字列として扱う）
  const dataJsPath = path.join(scriptDir, '..', '..', 'src', 'js', 'data.js');
  const dataJsContent = fs.readFileSync(dataJsPath, 'utf8');

  // データ配列を抽出する正規表現
  const dataArrayRegex = /const (\w+) = \[([\s\S]*?)\];/g;
  let dataMatch;
  const dataEntries = [];

  while ((dataMatch = dataArrayRegex.exec(dataJsContent)) !== null) {
    const arrayName = dataMatch[1];
    const arrayContent = dataMatch[2];
    
    // 各エントリを抽出する正規表現
    const entryRegex = /{\s*name: "([^"]+)",[\s\S]*?image: "([^"]+)"/g;
    let entryMatch;
    
    while ((entryMatch = entryRegex.exec(arrayContent)) !== null) {
      const name = entryMatch[1];
      const imagePath = entryMatch[2];
      
      dataEntries.push({
        name,
        imagePath,
        arrayName
      });
    }
  }

  console.log(`抽出されたデータエントリ: ${dataEntries.length}件`);
  console.log(`Web画像ダウンロードモード: ${useWebImages ? 'オン' : 'オフ'}`);

  // 各画像パスに対して処理
  for (const entry of dataEntries) {
    const { name, imagePath, arrayName } = entry;
    
    // パスからディレクトリとファイル名を取得
    const dirPath = path.join(scriptDir, '..', '..', path.dirname(imagePath));
    const fullPath = path.join(scriptDir, '..', '..', imagePath);
    
    // 画像の種類を判定
    const imageType = arrayName === 'greatPeopleData' ? 'greatPeople' : 'famousPeople';
    
    // ディレクトリが存在することを確認
    await ensureDirectoryExists(dirPath);
    
    // 画像を取得（Webダウンロードまたはローカル生成）
    await getImage(name, fullPath, imageType, useWebImages);
  }

  console.log('全ての画像の取得が完了しました！');
}

// コマンドライン引数を処理
const args = process.argv.slice(2);
const useWebImages = args.includes('--web') || args.includes('-w');

// スクリプト実行
main(useWebImages).catch(error => {
  console.error('エラーが発生しました:', error);
}); 