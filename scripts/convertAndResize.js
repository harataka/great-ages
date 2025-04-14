/**
 * 画像変換・リサイズスクリプト
 * WebP形式の画像をJPEG形式に変換し、すべての画像を指定サイズにリサイズします
 */

const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { promisify } = require('util');

// 非同期関数に変換
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);

/**
 * 画像をリサイズして保存する
 * @param {string} inputPath - 入力画像パス
 * @param {string} outputPath - 出力画像パス
 * @param {number} targetWidth - 目標幅
 * @param {number} targetHeight - 目標高さ
 * @returns {Promise<void>} - 処理結果のPromise
 */
async function resizeAndSaveImage(inputPath, outputPath, targetWidth, targetHeight) {
  try {
    // 画像を読み込む
    const image = await loadImage(inputPath);
    
    // キャンバスを作成
    const canvas = createCanvas(targetWidth, targetHeight);
    const ctx = canvas.getContext('2d');
    
    // 画像をリサイズして描画
    ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
    
    // 出力形式はJPEGに統一
    const buffer = canvas.toBuffer('image/jpeg');
    await writeFileAsync(outputPath, buffer);
    
    console.log(`リサイズ完了: ${outputPath} (${targetWidth}x${targetHeight})`);
    return true;
  } catch (error) {
    console.error(`リサイズエラー: ${inputPath} -> ${outputPath}`, error.message);
    return false;
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
          // 出力パスを作成（WebPの場合はJPEGに変換）
          let outputPath = filePath;
          if (ext === '.webp') {
            outputPath = filePath.replace('.webp', '.jpg');
          }
          
          // リサイズして保存
          const success = await resizeAndSaveImage(filePath, outputPath, targetWidth, targetHeight);
          
          // 成功し、元のファイルと出力パスが異なる場合（変換した場合）
          if (success && outputPath !== filePath) {
            // 元のWebPファイルを削除
            fs.unlinkSync(filePath);
            console.log(`元のファイルを削除しました: ${filePath}`);
          }
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
  
  console.log(`画像変換・リサイズを開始します (${targetWidth}x${targetHeight})`);
  
  // 処理開始
  await processDirectory(imageDir, targetWidth, targetHeight);
  
  console.log('画像変換・リサイズが完了しました！');
}

// スクリプト実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
}); 