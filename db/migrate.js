/**
 * データベースマイグレーションを実行するスクリプト
 * マイグレーションとシードファイルを順番に実行します
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('./config');

/**
 * SQLファイルを読み込んで実行する関数
 * @param {string} filePath - 実行するSQLファイルのパス
 * @return {Promise<void>}
 */
const executeSqlFile = async (filePath) => {
  try {
    const sql = fs.readFileSync(filePath, 'utf8');
    await pool.query(sql);
    console.log(`✅ ${path.basename(filePath)} が正常に実行されました`);
  } catch (error) {
    console.error(`❌ ${path.basename(filePath)} の実行中にエラーが発生しました:`, error.message);
    throw error;
  }
};

/**
 * マイグレーションを実行する関数
 * @return {Promise<void>}
 */
const runMigrations = async () => {
  try {
    console.log('🚀 マイグレーションを開始します...');
    
    // マイグレーションファイルの実行
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();
    
    for (const file of migrationFiles) {
      if (file.endsWith('.sql')) {
        await executeSqlFile(path.join(migrationsDir, file));
      }
    }
    
    // 環境変数SKIP_SEEDSが設定されていない場合はシードファイルを実行
    if (!process.env.SKIP_SEEDS) {
      console.log('🌱 シードデータを投入します...');
      const seedsDir = path.join(__dirname, 'seeds');
      const seedFiles = fs.readdirSync(seedsDir).sort();
      
      for (const file of seedFiles) {
        if (file.endsWith('.sql')) {
          await executeSqlFile(path.join(seedsDir, file));
        }
      }
    }
    
    console.log('✨ データベースのセットアップが完了しました');
  } catch (error) {
    console.error('❌ マイグレーション中にエラーが発生しました:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

runMigrations(); 