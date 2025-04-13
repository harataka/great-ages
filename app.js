/**
 * Great Ages アプリケーションのメイン JavaScript ファイル
 * 年齢入力と偉人データの表示機能を提供
 */

// DOM要素の取得
const ageInput = document.getElementById('age-input');
const searchButton = document.getElementById('search-button');
const resultsGrid = document.getElementById('results-grid');
const ageDisplay = document.getElementById('age-display');

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
}

/**
 * 偉人データからカード要素を生成する
 * @param {Object} person - 偉人データオブジェクト
 * @returns {HTMLElement} - 生成されたカード要素
 */
function createPersonCard(person) {
    const card = document.createElement('div');
    card.className = 'great-person-card';
    
    // 画像が存在する場合のみ追加
    let imageHtml = '';
    if (person.image) {
        imageHtml = `<img src="${person.image}" alt="${person.name}" class="card-image">`;
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

// 検索ボタンのクリックイベント
searchButton.addEventListener('click', () => {
    const age = ageInput.value.trim();
    
    if (age && !isNaN(age) && parseInt(age) > 0) {
        searchGreatPeople(age);
    } else {
        alert('有効な年齢を入力してください');
    }
});

// Enterキーでも検索できるように
ageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});

// ページ読み込み時のイベント
document.addEventListener('DOMContentLoaded', () => {
    // 初期状態では何も表示しない
    ageDisplay.textContent = '〇〇';
}); 