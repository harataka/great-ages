/**
 * 偉人データベース
 * 各偉人の名前、年齢、偉業、画像URLを格納
 */
const greatPeopleData = [
    {
        name: "アルベルト・アインシュタイン",
        age: 26,
        achievement: "特殊相対性理論を発表し、物理学に革命をもたらした。",
        image: "src/images/all_persons/アルベルト・アインシュタイン.jpg"
    },
    {
        name: "スティーブ・ジョブズ",
        age: 42,
        achievement: "iPhoneを発表し、スマートフォン市場を創造した。",
        image: "src/images/all_persons/スティーブ・ジョブズ.jpg"
    },
    {
        name: "葛飾北斎",
        age: 70,
        achievement: "代表作「富嶽三十六景」の制作を開始し、世界的に評価される日本画の代表作を生み出した。",
        image: "src/images/all_persons/葛飾北斎.jpg"
    },
    {
        name: "ハリエット・タブマン",
        age: 29,
        achievement: "自身が奴隷から逃れた後、「地下鉄道」を通じて300人以上の奴隷を自由に導いた。",
        image: "src/images/all_persons/ハリエット・タブマン.jpg"
    },
    {
        name: "黒澤明",
        age: 50,
        achievement: "映画「羅生門」でヴェネツィア国際映画祭金獅子賞を受賞し、日本映画を世界に知らしめた。",
        image: "src/images/all_persons/黒澤明.jpg"
    },
    {
        name: "J.K.ローリング",
        age: 32,
        achievement: "最初のハリー・ポッター小説「ハリー・ポッターと賢者の石」を出版した。",
        image: "src/images/all_persons/J.K.ローリング.jpg"
    },
    {
        name: "孔子",
        age: 51,
        achievement: "中国の春秋時代に政治家・教育者として活躍し、儒学の基礎を築いた。",
        image: "src/images/all_persons/孔子.jpg"
    },
    {
        name: "マザー・テレサ",
        age: 40,
        achievement: "「神の愛の宣教者会」を設立し、貧しい人々への奉仕活動を本格的に開始した。",
        image: "src/images/all_persons/マザー・テレサ.jpg"
    }
    // 必要に応じてデータを追加してください
]; 

/**
 * データベースから有名人データを取得する関数
 * @param {number} age - 検索する年齢（指定した場合はその年齢の有名人のみ返す）
 * @returns {Promise<Array>} - 有名人データの配列
 */
async function fetchFamousPeopleData(age = null) {
    try {
        // APIエンドポイントのURL
        let url = '/api/famous-people';
        
        // 年齢が指定されている場合はクエリパラメータを追加
        if (age !== null) {
            url += `?age=${age}`;
        }
        
        // データを取得
        const response = await fetch(url);
        
        // レスポンスが正常でない場合はエラーをスロー
        if (!response.ok) {
            throw new Error(`API呼び出しエラー: ${response.status}`);
        }
        
        // JSONデータを解析して返す
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('有名人データの取得に失敗しました:', error);
        
        // エラー時にはフォールバックデータを返す
        return fallbackFamousPeopleData;
    }
}

/**
 * フォールバック用の有名人データ
 * APIリクエストが失敗した場合に使用する
 */
const fallbackFamousPeopleData = [
    {
        name: "木村拓哉",
        age: 35,
        achievement: "俳優としてドラマ「HERO」で主演し、高視聴率を記録。SMAPのメンバーとして音楽活動も行う。",
        image: "src/images/all_persons/木村拓哉.jpg"
    },
    {
        name: "浜崎あゆみ",
        age: 40,
        achievement: "アーティストとして「A BEST」などのベストアルバムが大ヒット。日本の音楽シーンをリードする存在に。",
        image: "src/images/all_persons/浜崎あゆみ.jpg"
    },
    {
        name: "松本人志",
        age: 45,
        achievement: "お笑いコンビ「ダウンタウン」として活躍する傍ら、映画監督としても「大日本人」を製作・公開。",
        image: "src/images/all_persons/松本人志.jpg"
    },
    {
        name: "天海祐希",
        age: 50,
        achievement: "女優としてドラマ「BOSS」シリーズで主演。舞台女優としても高い評価を得る。",
        image: "src/images/all_persons/天海祐希.jpg"
    },
    {
        name: "タモリ",
        age: 55,
        achievement: "「笑っていいとも!」の司会を長年務め、国民的司会者として幅広い世代に親しまれる。",
        image: "src/images/all_persons/タモリ.jpg"
    },
    {
        name: "美輪明宏",
        age: 60,
        achievement: "歌手、女優、作家として多方面で活躍。独自の世界観で幅広いファン層を持つ。",
        image: "src/images/all_persons/美輪明宏.jpg"
    },
    {
        name: "吉永小百合",
        age: 65,
        achievement: "女優として「母と暮せば」など数々の映画に出演。平和活動にも熱心に取り組む。",
        image: "src/images/all_persons/吉永小百合.jpg"
    },
    {
        name: "山田洋次",
        age: 70,
        achievement: "映画監督として「男はつらいよ」シリーズや「東京家族」などを手掛け、日本映画界の重鎮として活躍。",
        image: "src/images/all_persons/山田洋次.jpg"
    },
    {
        name: "白川静",
        age: 68,
        achievement: "漢字学者として『字統』『字通』などの著作を刊行。漢字の起源と本来の意味を解明する研究で知られる。",
        image: "src/images/all_persons/白川静.jpg"
    },
    {
        name: "村上春樹",
        age: 52,
        achievement: "作家として「ノルウェイの森」が国際的ベストセラーに。世界的に高い評価を受ける日本人作家となる。",
        image: "src/images/all_persons/村上春樹.jpg"
    }
];

// グローバルで利用できるようにエクスポート
export { greatPeopleData, fetchFamousPeopleData };