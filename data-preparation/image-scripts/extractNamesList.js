/**
 * 名前リスト抽出スクリプト
 * data.jsファイルから人物名リストを抽出して保存します
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// 非同期関数に変換
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * data.jsファイルから名前リストを抽出する
 * @param {string} dataJsPath - data.jsファイルのパス
 * @returns {Promise<string[]>} - 名前リスト
 */
async function extractNamesFromDataJs(dataJsPath) {
  try {
    if (!fs.existsSync(dataJsPath)) {
      console.log(`data.jsファイルが存在しません: ${dataJsPath}`);
      return [];
    }
    
    // data.jsの内容を読み込む
    const dataJsContent = await readFileAsync(dataJsPath, 'utf8');
    
    // データ配列を抽出する正規表現
    const dataArrayRegex = /const (\w+) = \[([\s\S]*?)\];/g;
    let dataMatch;
    const names = [];

    while ((dataMatch = dataArrayRegex.exec(dataJsContent)) !== null) {
      const arrayContent = dataMatch[2];
      
      // 各エントリを抽出する正規表現
      const entryRegex = /{\s*name: "([^"]+)"/g;
      let entryMatch;
      
      while ((entryMatch = entryRegex.exec(arrayContent)) !== null) {
        const name = entryMatch[1];
        names.push(name);
      }
    }
    
    console.log(`data.jsから名前リストを抽出しました: ${names.length}件`);
    return names;
  } catch (error) {
    console.error(`data.js解析エラー: ${dataJsPath}`, error.message);
    return [];
  }
}

/**
 * 名前リストをファイルに書き出す
 * @param {string} filePath - 出力ファイルパス
 * @param {string[]} names - 名前リスト
 * @returns {Promise<void>} - 処理結果のPromise
 */
async function writeNameList(filePath, names) {
  try {
    await writeFileAsync(filePath, names.join('\n'), 'utf8');
    console.log(`名前リストをファイルに書き出しました: ${filePath}`);
  } catch (error) {
    console.error(`名前リスト書き出しエラー: ${filePath}`, error.message);
  }
}

/**
 * 指定された名前の画像ファイルが存在するかチェックする
 * @param {string} name - 人物名
 * @param {string} imagesDir - 画像ディレクトリパス
 * @returns {boolean} - 画像が存在するかどうか
 */
function isImageExist(name, imagesDir) {
  try {
    const sanitizedName = name.replace(/[\/\\?%*:|"<>]/g, '_');
    const imagePath = path.join(imagesDir, `${sanitizedName}.jpg`);
    return fs.existsSync(imagePath);
  } catch (error) {
    console.error(`画像存在チェックエラー: ${name}`, error.message);
    return false;
  }
}

/**
 * メイン実行関数
 */
async function main() {
  // スクリプトの実行パスを取得
  const scriptDir = __dirname;
  
  // data.jsのパス
  const dataJsPath = path.join(scriptDir, '..', '..', 'src', 'js', 'data.js');
  
  // 名前リストファイル
  const nameListPath = path.join(scriptDir, 'extracted_names.txt');
  
  // 画像ディレクトリパス
  const imagesDir = path.join(scriptDir, '..', '..', 'src', 'images', 'all_persons');
  
  // data.jsから名前を抽出
  const allNames = await extractNamesFromDataJs(dataJsPath);
  
  if (allNames.length === 0) {
    console.log('data.jsから名前を抽出できませんでした。ファイルの形式を確認してください。');
    return;
  }
  
  // 画像が存在しない名前だけをフィルタリング
  const namesToDownload = allNames.filter(name => !isImageExist(name, imagesDir));
  
  console.log(`合計${allNames.length}人のうち、${namesToDownload.length}人の画像が未ダウンロードです。`);
  
  // 抽出した名前をファイルに書き出し
  await writeNameList(nameListPath, namesToDownload);
  
  console.log(`処理が完了しました。${namesToDownload.length}人の名前をリストに抽出しました。`);
}

// スクリプト実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
}); 