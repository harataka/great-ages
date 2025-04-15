@echo off
chcp 65001 > nul
echo ========================================
echo 画像ダウンロードスクリプト実行 - Windows版
echo ========================================
echo.

REM .envファイルが存在するか確認
if exist .env (
  echo .envファイルが見つかりました。環境変数を読み込みます。
  
  REM dotenvがインストールされているか確認
  call npm list dotenv > nul 2>&1
  if %ERRORLEVEL% neq 0 (
    echo dotenvパッケージをインストールします...
    call npm install dotenv > nul 2>&1
  ) else (
    echo dotenvパッケージはすでにインストールされています。
  )
  
  echo .envファイルから設定を読み込みます。
  goto skip_api_input
)

REM APIキーの設定を確認
echo APIキーの設定方法を選択してください:
echo 1) 直接入力
echo 2) .envファイルを作成
set /p SETUP_CHOICE="選択肢を入力してください (1-2): "

if "%SETUP_CHOICE%"=="2" (
  REM .envファイルの作成
  echo .envファイルを作成します...
  
  REM dotenvがインストールされているか確認
  call npm list dotenv > nul 2>&1
  if %ERRORLEVEL% neq 0 (
    echo dotenvパッケージをインストールします...
    call npm install dotenv > nul 2>&1
  )
  
  set /p GOOGLE_API_KEY="Google API Key を入力してください: "
  set /p GOOGLE_SEARCH_ENGINE_ID="Google Search Engine ID を入力してください: "
  
  echo # APIキー設定 > .env
  echo # %date% %time% 作成 >> .env
  echo. >> .env
  echo # Google Custom Search API設定 >> .env
  echo GOOGLE_API_KEY=%GOOGLE_API_KEY% >> .env
  echo GOOGLE_SEARCH_ENGINE_ID=%GOOGLE_SEARCH_ENGINE_ID% >> .env
  echo. >> .env
  echo # その他設定 >> .env
  echo REQUEST_DELAY=2000 >> .env
  
  echo .envファイルを作成しました。
  goto skip_api_input
)

REM 直接入力の場合
set /p GOOGLE_API_KEY="Google API Key を入力してください: "
set /p GOOGLE_SEARCH_ENGINE_ID="Google Search Engine ID を入力してください: "

:skip_api_input
echo.
echo スクリプトの実行準備ができました。

REM 名前リストの抽出
echo.
echo 1/3: データから名前リストを抽出しています...
node extractNamesList.js
if %ERRORLEVEL% neq 0 (
  echo 名前リスト抽出に失敗しました。
  goto :error
)

REM Wikipediaからの画像ダウンロード
echo.
echo 2/3: Wikipediaから画像をダウンロードしています...
node downloadWikipediaImages.js
if %ERRORLEVEL% neq 0 (
  echo Wikipediaからの画像ダウンロードに失敗しました。続行します。
)

REM 追加ダウンロードの選択
echo.
echo 3/3: Wikipediaから取得できなかった画像をダウンロードします。
echo Google Custom Search APIを使用しますか？

choice /c 12 /m "1) はい 2) いいえ（スキップ）"
if %ERRORLEVEL% equ 1 (
  echo Google Custom Search APIを使用します...
  node downloadGoogleImages.js
) else (
  echo APIによるダウンロードをスキップします。
)

REM no-image.pngの生成
echo.
echo 4/3: デフォルト画像を生成しています...
node generateNoImage.js

echo.
echo 処理が完了しました！
echo.
echo ======================================
echo 1. frontend.jsがno-image.pngを参照していることを確認してください
echo 2. サーバーを再起動する必要があるかもしれません
echo ======================================

goto :end

:error
echo エラーが発生しました。処理を中断します。
exit /b 1

:end
echo.
pause 