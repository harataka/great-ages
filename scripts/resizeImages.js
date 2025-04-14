/**
 * 画像リサイズスクリプト
 * 生成された画像を指定サイズにリサイズします
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { promisify } = require('util');

// 非同期関数に変換
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);

/**
 * 画像をリサイズする
 * @param {string} inputPath - 入力画像パス
 * @param {string} outputPath - 出力画像パス
 * @param {number} targetWidth - 目標幅
 * @param {number} targetHeight - 目標高さ
 * @returns {Promise<void>} - 処理結果のPromise
 */
async function resizeImage(inputPath, outputPath, targetWidth, targetHeight) {
  try {
    // 画像を読み込む
    const image = await loadImage(inputPath);
    
    // キャンバスを作成
    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    
    // 画像をリサイズして描画
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    
    // 出力形式を決定（ファイル拡張子から）
    let format = 'image/jpeg';
    if (outputPath.endsWith('.webp')) {
      format = 'image/webp';
    } else if (outputPath.endsWith('.png')) {
      format = 'image/png';
    }
    
    // バッファを取得して保存
    const buffer = canvas.toBuffer(format);
    await writeFileAsync(outputPath, buffer);
    
    console.log(`リサイズ完了: ${outputPath} (${targetWidth}x${targetHeight})`);
  } catch (error) {
    console.error(`リサイズエラー: ${inputPath}`, error);
  }
}

/**
 * 指定ディレクトリ内の画像を再帰的に処理する
 * @param {string} dirPath - 処理するディレクトリパス
 * @param {number} targetWidth - 目標幅
 * @param {number} targetHeight - 目標高さ
 */
async function processDirectory(dirPath, targetWidth, targetHeight) {
  try {
    // ディレクトリ内のファイルを取得
    const files = await readdirAsync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        // サブディレクトリの場合は再帰的に処理
        await processDirectory(filePath, targetWidth, targetHeight);
      } else {
        // 画像ファイルの場合、拡張子をチェック
        const ext = path.extname(file).toLowerCase();
        if (['.jpg', '.jpeg', '.webp', '.png'].includes(ext)) {
          // 同じパスにリサイズした画像を保存
          await resizeImage(filePath, filePath, targetWidth, targetHeight);
        }
      }
    }
  } catch (error) {
    console.error(`ディレクトリ処理エラー: ${dirPath}`, error);
  }
}

/**
 * メイン処理
 */
async function main() {
  // リサイズするディレクトリと目標サイズを指定
  const imageDir = path.join(__dirname, '..', 'src', 'images');
  const targetWidth = 400;  // リサイズ後の幅
  const targetHeight = 300; // リサイズ後の高さ
  
  console.log(`画像リサイズを開始します (${targetWidth}x${targetHeight})`);
  
  // 処理開始
  await processDirectory(imageDir, targetWidth, targetHeight);
  
  console.log('画像リサイズが完了しました！');
}

// スクリプト実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
}); 