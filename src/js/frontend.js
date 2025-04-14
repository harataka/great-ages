/**
 * Great Ages アプリケーションのフロントエンドJavaScript ファイル
 * 年齢入力と偉人データの表示機能を提供
 */

// DOM要素の取得
const ageInput = document.getElementById('age-input');
const ageNumberInput = document.getElementById('age-number-input');
const ageCategoryButtons = document.querySelectorAll('.age-category-btn');
const searchButton = document.getElementById('search-button');
const resultsGrid = document.getElementById('results-grid');
const famousResultsGrid = document.getElementById('famous-results-grid');
const ageDisplay = document.getElementById('age-display');
const famousAgeDisplay = document.getElementById('famous-age-display');
const famousPeopleSection = document.getElementById('famous-people-section');
const greatPeopleSection = document.getElementById('great-people-section');

/**
 * 指定された年齢の偉人データを検索し表示する
 * @param {number} age - 検索する年齢
 */
function searchGreatPeople(age) {
    // 入力された年齢を表示部分に反映
    ageDisplay.textContent = age;
    
    // 該当する偉人をフィルタリング
    const filteredPeople = greatPeopleData.filter(person => person.age === parseInt(age));
    
    // 結果表示エリアをクリア
    resultsGrid.innerHTML = '';
    
    // 検索結果があるか確認
    if (filteredPeople.length > 0) {
        // 各偉人のカードを生成して表示
        filteredPeople.forEach(person => {
            const personCard = createPersonCard(person);
            resultsGrid.appendChild(personCard);
        });
    } else {
        // 結果がない場合のメッセージ
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = `${age}歳で偉業を達成した偉人は見つかりませんでした。あなたが歴史を作る番かもしれません！`;
        resultsGrid.appendChild(emptyMessage);
    }
    
    // 偉人セクションを表示し、有名人セクションを非表示にする
    greatPeopleSection.style.display = 'block';
    famousPeopleSection.style.display = 'none';
}

/**
 * 指定された年齢の有名人・芸能人データを表示する
 * @param {number} age - 検索する年齢
 * @param {boolean} isInitialLoad - 初期ロード時かどうか
 */
function displayFamousPeople(age, isInitialLoad = false) {
    // 入力された年齢を表示部分に反映
    famousAgeDisplay.textContent = age;
    
    // 該当する有名人をフィルタリング
    const filteredPeople = famousPeopleData.filter(person => person.age === parseInt(age));
    
    // 結果表示エリアをクリア
    famousResultsGrid.innerHTML = '';
    
    // 検索結果があるか確認
    if (filteredPeople.length > 0) {
        // 各有名人のカードを生成して表示
        filteredPeople.forEach(person => {
            const personCard = createPersonCard(person);
            famousResultsGrid.appendChild(personCard);
        });
    } else {
        // 結果がない場合のメッセージ
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = `${age}歳の有名人・芸能人は見つかりませんでした。`;
        famousResultsGrid.appendChild(emptyMessage);
    }
    
    // 初期ロード時は有名人セクションのみ表示
    if (isInitialLoad) {
        greatPeopleSection.style.display = 'none';
        famousPeopleSection.style.display = 'block';
    }
}

/**
 * 偉人・有名人データからカード要素を生成する
 * @param {Object} person - 偉人・有名人データオブジェクト
 * @returns {HTMLElement} - 生成されたカード要素
 */
function createPersonCard(person) {
    const card = document.createElement('div');
    card.className = 'great-person-card';
    
    // 画像HTMLを作成
    let imageHtml = '';
    if (person.image) {
        imageHtml = `<img src="${person.image}" alt="${person.name}" class="card-image" onerror="this.onerror=null; this.src='src/images/no-image.webp'; this.alt='画像がありません';">`;
    } else {
        imageHtml = `<img src="src/images/no-image.webp" alt="画像がありません" class="card-image">`;
    }
    
    card.innerHTML = `
        ${imageHtml}
        <div class="card-content">
            <h3 class="person-name">${person.name}</h3>
            <p class="achievement">${person.achievement}</p>
        </div>
    `;
    
    return card;
}

/**
 * スライダーと数値入力フィールドの値を同期させる
 * @param {string} sourceType - 更新が発生したソース（'slider'または'number'）
 * @param {number} value - 新しい値
 */
function syncAgeInputs(sourceType, value) {
    if (sourceType === 'slider') {
        ageNumberInput.value = value;
        
        // 検索前の状態では、スライダー移動に合わせて有名人表示も更新
        if (famousPeopleSection.style.display !== 'none') {
            displayFamousPeople(value);
        }
    } else if (sourceType === 'number') {
        // 数値入力が範囲外の場合、スライダーの最大値または最小値にクランプする
        const sliderValue = Math.min(Math.max(value, ageInput.min), ageInput.max);
        ageInput.value = sliderValue;
        
        // 検索前の状態では、入力値変更に合わせて有名人表示も更新
        if (famousPeopleSection.style.display !== 'none') {
            displayFamousPeople(value);
        }
    }
}

// 検索ボタンのクリックイベント
searchButton.addEventListener('click', () => {
    const age = ageNumberInput.value.trim();
    
    if (age && !isNaN(age) && parseInt(age) >= 40) {
        // 検索ボタンクリック時は偉人のみを検索して表示
        searchGreatPeople(age);
    } else {
        alert('40歳以上の有効な年齢を入力してください');
    }
});

// ページ読み込み時のイベント
document.addEventListener('DOMContentLoaded', () => {
    // 初期値で有名人を表示
    const initialAge = ageNumberInput.value;
    displayFamousPeople(initialAge, true);
    
    // スライダーの値が変更されたときに表示を更新
    ageInput.addEventListener('input', function() {
        syncAgeInputs('slider', this.value);
    });
    
    // 数値入力フィールドの値が変更されたときにスライダーを更新
    ageNumberInput.addEventListener('input', function() {
        syncAgeInputs('number', this.value);
    });
    
    // 年齢カテゴリボタンのクリックイベント
    ageCategoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const baseAge = parseInt(this.dataset.age);
            
            // 各年代の代表的な年齢を設定
            let age;
            switch (baseAge) {
                case 35:
                    age = 37; // 30代後半の中央値
                    break;
                case 40:
                    age = 45; // 40代の中央値
                    break;
                case 50:
                    age = 55; // 50代の中央値
                    break;
                case 60:
                    age = 65; // 60代の中央値
                    break;
                default:
                    age = baseAge;
            }
            
            // 入力フィールドを更新
            ageNumberInput.value = age;
            
            // スライダーの範囲内であればスライダーも更新
            if (age <= ageInput.max) {
                ageInput.value = age;
            }
            
            // 検索前状態では有名人表示を更新
            if (famousPeopleSection.style.display !== 'none') {
                displayFamousPeople(age);
            } else {
                // 検索後状態では偉人表示を更新
                searchGreatPeople(age);
            }
        });
    });
}); 