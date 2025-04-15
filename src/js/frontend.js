/**
 * Great Ages アプリケーションのフロントエンドJavaScript ファイル
 * 年齢入力と偉人データの表示機能を提供
 */

// データモジュールをインポート（type="module"を使用している場合）
import { greatPeopleData, fetchFamousPeopleData } from './data.js';
import { FAMOUS_PEOPLE_API_URL, DEFAULT_AGE, MIN_AGE, MAX_AGE, ERROR_MESSAGES } from './config.js';

// DOM要素の取得
const ageInput = document.getElementById('age-input');
const ageSlider = document.getElementById('age-slider');
const searchButton = document.getElementById('search-button');
const famousResultsGrid = document.getElementById('famous-results-grid');
const birthdayResultsGrid = document.getElementById('birthday-results-grid');
const famousPeopleSection = document.getElementById('famous-people-section');
const greatPeopleSection = document.getElementById('great-people-section');
const birthdayTodaySection = document.getElementById('birthday-today-section');
const greatResultsGrid = document.getElementById('great-results-grid');

// ローディング状態のフラグ
let isLoading = false;

/**
 * 指定された年齢の偉人データを検索し表示する
 * @param {number} age - 検索する年齢
 */
function searchGreatPeople(age) {
    // 以前の結果をクリア
    greatResultsGrid.innerHTML = '';

    // 指定された年齢での偉人の実績をフィルタリング
    const achievements = greatPeopleData.filter(person => {
        return person.age === age;
    });

    // 結果が見つかったら表示
    if (achievements.length > 0) {
        // 偉人セクションを表示
        greatPeopleSection.style.display = 'block';
        
        // カードを作成して表示
        achievements.forEach(person => {
            const card = createPersonCard(person);
            greatResultsGrid.appendChild(card);
        });
    } else {
        // 偉人セクションを表示
        greatPeopleSection.style.display = 'block';
        
        // 結果がない場合のメッセージ
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = `${age}歳で有名な実績を残した偉人は見つかりませんでした。`;
        greatResultsGrid.appendChild(emptyMessage);
    }

    // 結果セクションに滑らかにスクロール
    greatPeopleSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 指定された年齢の有名人・芸能人データを表示する
 * @param {number} age - 検索する年齢
 * @param {boolean} isInitialLoad - 初期ロード時かどうか
 */
async function displayFamousPeople(age, isInitialLoad = false) {
    if (isLoading) return;
    isLoading = true;

    // 結果をクリア
    famousResultsGrid.innerHTML = '';
    
    if (!isInitialLoad) {
        // ローディングメッセージ表示
        const loadingMessage = document.createElement('p');
        loadingMessage.className = 'loading';
        loadingMessage.textContent = 'データを取得中...';
        famousResultsGrid.appendChild(loadingMessage);
    }

    try {
        // APIからデータを取得
        const response = await fetch(`${FAMOUS_PEOPLE_API_URL}?age=${age}`);
        
        if (!response.ok) {
            throw new Error(ERROR_MESSAGES.API_FETCH_FAILED);
        }
        
        const data = await response.json();
        
        // 以前の結果をクリア
        famousResultsGrid.innerHTML = '';
        
        // 著名人セクションを表示
        famousPeopleSection.style.display = 'block';
        
        // セクションタイトルに年齢を表示
        const sectionTitle = famousPeopleSection.querySelector('.section-title');
        if (sectionTitle) {
            sectionTitle.textContent = `${age}歳の著名人・芸能人`;
        }
        
        if (data.length > 0) {
            // データを表示
            data.forEach(person => {
                const card = createPersonCard(person);
                famousResultsGrid.appendChild(card);
            });
        } else {
            // 結果がない場合のメッセージ
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = `${age}歳の著名人は見つかりませんでした。`;
            famousResultsGrid.appendChild(emptyMessage);
        }
    } catch (error) {
        console.error('エラー:', error);
        
        // エラーメッセージ表示
        famousResultsGrid.innerHTML = '';
        const errorMessage = document.createElement('p');
        errorMessage.className = 'error';
        errorMessage.textContent = `データの取得中にエラーが発生しました: ${error.message}`;
        famousResultsGrid.appendChild(errorMessage);
    } finally {
        isLoading = false;
    }
}

/**
 * 今日が誕生日の著名人を表示する
 */
async function displayTodayBirthday() {
    // 結果をクリア
    birthdayResultsGrid.innerHTML = '';
    
    // ローディングメッセージ表示
    const loadingMessage = document.createElement('p');
    loadingMessage.className = 'loading';
    loadingMessage.textContent = '今日が誕生日の著名人を検索中...';
    birthdayResultsGrid.appendChild(loadingMessage);

    try {
        // APIからデータを取得
        const response = await fetch(`${FAMOUS_PEOPLE_API_URL}/birthdays/today`);
        
        if (!response.ok) {
            throw new Error(ERROR_MESSAGES.API_FETCH_FAILED);
        }
        
        const data = await response.json();
        
        // 以前の結果をクリア
        birthdayResultsGrid.innerHTML = '';
        
        if (data.length > 0) {
            // 誕生日セクションを表示
            birthdayTodaySection.style.display = 'block';
            
            // データを表示
            data.forEach(person => {
                const card = createPersonCard(person);
                birthdayResultsGrid.appendChild(card);
            });
        } else {
            // 結果がない場合はセクションを非表示
            birthdayTodaySection.style.display = 'none';
        }
    } catch (error) {
        console.error('誕生日データのエラー:', error);
        
        // エラーの場合はセクションを非表示
        birthdayTodaySection.style.display = 'none';
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
    
    // 画像コンテナ
    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image-container';
    
    // 画像
    const image = document.createElement('img');
    image.className = 'card-image';
    image.src = person.image || 'src/images/placeholder.jpg';
    image.alt = person.name;
    image.onerror = function() {
        this.src = 'src/images/placeholder.jpg';
    };
    
    imageContainer.appendChild(image);
    card.appendChild(imageContainer);
    
    // カードコンテンツ
    const content = document.createElement('div');
    content.className = 'card-content';
    
    // 名前
    const name = document.createElement('h3');
    name.className = 'person-name';
    name.textContent = person.name;
    
    // 実績または説明
    const achievement = document.createElement('p');
    achievement.className = 'achievement';
    
    if (person.achievement) {
        // 実績情報がある場合
        achievement.textContent = person.achievement;
        // 年齢情報がある場合は表示
        if (person.age) {
            achievement.textContent = `${person.age}歳: ${person.achievement}`;
        }
    } else if (person.description) {
        // 説明情報がある場合
        achievement.textContent = person.description;
    } else {
        // 生没年のみの場合
        achievement.textContent = `${person.birthDate ? person.birthDate + ' - ' : ''}${person.deathDate || ''}`;
    }
    
    content.appendChild(name);
    content.appendChild(achievement);
    card.appendChild(content);
    
    return card;
}

// 検索ボタンのクリックイベント
searchButton.addEventListener('click', () => {
    const age = parseInt(ageInput.value);
    
    // 入力チェック
    if (isNaN(age) || age < MIN_AGE || age > MAX_AGE) {
        alert(ERROR_MESSAGES.INVALID_AGE);
        return;
    }
    
    // 検索を実行
    displayFamousPeople(age);
    searchGreatPeople(age);
});

// ページ読み込み時のイベント
document.addEventListener('DOMContentLoaded', () => {
    // 初期検索 - アプリケーション起動時にデフォルト値での検索を行う
    const defaultAge = parseInt(ageInput.value) || DEFAULT_AGE;
    
    // 今日が誕生日の著名人を表示
    displayTodayBirthday();
    
    // デフォルト年齢での検索
    displayFamousPeople(defaultAge, true);
    searchGreatPeople(defaultAge);
    
    // スライダー値変更時に数値入力を更新
    ageSlider.addEventListener('input', () => {
        ageInput.value = ageSlider.value;
    });
    
    // 数値入力変更時にスライダーを更新
    ageInput.addEventListener('input', () => {
        const age = parseInt(ageInput.value);
        if (!isNaN(age) && age >= MIN_AGE && age <= MAX_AGE) {
            ageSlider.value = age;
        }
    });
});

// 入力フィールドのバリデーション
ageInput.addEventListener('blur', () => {
    const age = parseInt(ageInput.value);
    
    if (isNaN(age) || age < MIN_AGE) {
        ageInput.value = MIN_AGE;
        ageSlider.value = MIN_AGE;
    } else if (age > MAX_AGE) {
        ageInput.value = MAX_AGE;
        ageSlider.value = MAX_AGE;
    }
}); 