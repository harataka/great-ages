/**
 * No Image生成スクリプト
 * 画像が見つからない場合に表示するデフォルト画像を生成します
 */

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
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
 * 「画像なし」のデフォルト画像を生成する
 * @param {string} outputPath - 出力ファイルパス
 * @param {number} width - 画像の幅
 * @param {number} height - 画像の高さ
 * @returns {Promise<boolean>} - 処理が成功したかどうか
 */
async function generateNoImagePlaceholder(outputPath, width = 300, height = 400) {
  try {
    // canvasを作成
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    // 背景色を設定
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);
    
    // 枠線を描画
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // テキスト設定
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 「画像なし」メッセージを中央に表示
    ctx.fillText('画像がありません', width / 2, height / 2 - 20);
    
    // アイコンの代わりに図形を描画
    drawImageIcon(ctx, width / 2, height / 2 + 30, 50);
    
    // ディレクトリを確認・作成
    await ensureDirectoryExists(path.dirname(outputPath));
    
    // PNGとして保存（WEBP形式はcanvasでは直接サポートされていないため）
    const buffer = canvas.toBuffer('image/png');
    await writeFileAsync(outputPath, buffer);
    
    console.log(`No Image画像を作成しました: ${outputPath}`);
    return true;
  } catch (error) {
    console.error('No Image画像生成エラー:', error);
    return false;
  }
}

/**
 * 画像アイコンを描画する
 * @param {CanvasRenderingContext2D} ctx - Canvas 2D コンテキスト
 * @param {number} x - 中心のX座標
 * @param {number} y - 中心のY座標
 * @param {number} size - アイコンのサイズ
 */
function drawImageIcon(ctx, x, y, size) {
  // フレーム
  ctx.strokeStyle = '#888888';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - size / 2, y - size / 2, size, size);
  
  // 山
  ctx.fillStyle = '#888888';
  ctx.beginPath();
  ctx.moveTo(x - size / 3, y + size / 4);
  ctx.lineTo(x, y - size / 4);
  ctx.lineTo(x + size / 3, y + size / 4);
  ctx.closePath();
  ctx.fill();
  
  // 太陽
  ctx.beginPath();
  ctx.arc(x - size / 5, y - size / 5, size / 8, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * メイン実行関数
 */
async function main() {
  // スクリプトの実行パスを取得
  const scriptDir = __dirname;
  
  // 出力パス
  const outputDir = path.join(scriptDir, '..', '..', 'src', 'images');
  const outputPath = path.join(outputDir, 'no-image.png');
  
  // No Image画像を生成
  await generateNoImagePlaceholder(outputPath);
  
  console.log('処理が完了しました。');
  console.log(`生成ファイル: ${outputPath}`);
  console.log('注意: WebP形式ではなくPNG形式で生成しました。必要に応じて変換ツールを使用してください。');
  
  // フロントエンドコードの修正手順を表示
  console.log('\n=========== 使用方法 ===========');
  console.log('frontend.jsの以下の部分を修正してください:');
  console.log('変更前: src/images/no-image.html');
  console.log('変更後: src/images/no-image.png');
}

// スクリプト実行
main().catch(error => {
  console.error('エラーが発生しました:', error);
}); 