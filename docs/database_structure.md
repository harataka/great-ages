# データベース構造仕様書

## 概要
このドキュメントでは、「Great Ages」アプリケーションで使用されているデータベースの構造を詳細に記述します。
テーブル定義、リレーション、インデックス、およびビューについての情報を提供します。

## テーブル一覧

| テーブル名 | 説明 |
|------------|------|
| great_persons | 歴史上の偉人の基本情報を格納するテーブル |
| achievements | 偉人の主な偉業や成果を格納するテーブル |
| famous_people | 現代の有名人・芸能人の基本情報を格納するテーブル |

## テーブル詳細

### great_persons テーブル

偉人の基本情報を管理するテーブルです。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | SERIAL | PRIMARY KEY | 自動採番の主キー |
| name | VARCHAR(255) | NOT NULL | 偉人の名前 |
| birth_date | DATE | NOT NULL | 誕生日 |
| death_date | DATE | | 死亡日（生存中の場合はNULL） |
| profession | VARCHAR(255) | NOT NULL | 職業または専門分野 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | レコード更新日時 |

#### インデックス
- `idx_great_persons_name`: 名前による検索を高速化するためのインデックス

### achievements テーブル

偉人の主な成果や偉業を管理するテーブルです。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | SERIAL | PRIMARY KEY | 自動採番の主キー |
| great_person_id | INTEGER | NOT NULL, FOREIGN KEY | 偉人テーブルへの外部キー |
| title | VARCHAR(255) | NOT NULL | 偉業のタイトル |
| description | TEXT | | 偉業の詳細説明 |
| achievement_date | DATE | | 偉業達成日 |
| age_at_achievement | INTEGER | | 達成時の年齢 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | レコード更新日時 |

#### 制約
- `great_person_id`: `great_persons`テーブルの`id`を参照する外部キー
  - `ON DELETE CASCADE`: 偉人が削除されると、関連する偉業も削除される

#### インデックス
- `idx_achievements_great_person_id`: 偉人IDによる検索を高速化するためのインデックス

### famous_people テーブル

現代の有名人・芸能人の情報を管理するテーブルです。誕生日や同一年齢の有名人を表示するために使用します。

| カラム名 | データ型 | 制約 | 説明 |
|----------|----------|------|------|
| id | SERIAL | PRIMARY KEY | 自動採番の主キー |
| name | VARCHAR(255) | NOT NULL | 有名人の名前 |
| birth_date | DATE | NOT NULL | 誕生日 |
| description | TEXT | | 活動内容や経歴の説明 |
| image_url | VARCHAR(255) | | 画像のURL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | レコード更新日時 |

#### インデックス
- `idx_famous_people_name`: 名前による検索を高速化するためのインデックス
- `idx_famous_people_birth_date`: 誕生日検索を高速化するためのインデックス

## ビュー

### achievements_with_person ビュー

偉業と偉人情報を結合したビューです。偉業の一覧表示や検索に便利です。

#### カラム
| カラム名 | データ型 | 説明 |
|----------|----------|------|
| id | INTEGER | 偉業ID |
| great_person_id | INTEGER | 偉人ID |
| person_name | VARCHAR(255) | 偉人名 |
| title | VARCHAR(255) | 偉業タイトル |
| description | TEXT | 偉業の説明 |
| achievement_date | DATE | 達成日 |
| age_at_achievement | INTEGER | 達成時の年齢 |
| created_at | TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP | レコード更新日時 |

### famous_people_with_age ビュー

有名人の現在の年齢を計算して表示するビューです。同年齢の有名人検索に便利です。

#### カラム
| カラム名 | データ型 | 説明 |
|----------|----------|------|
| id | INTEGER | 有名人ID |
| name | VARCHAR(255) | 有名人名 |
| birth_date | DATE | 誕生日 |
| description | TEXT | 説明・経歴 |
| image_url | VARCHAR(255) | 画像URL |
| current_age | INTEGER | 現在の年齢（計算値） |
| created_at | TIMESTAMP | レコード作成日時 |
| updated_at | TIMESTAMP | レコード更新日時 |

## リレーション図

```
great_persons 1 ----- * achievements
     |                      ^
     |                      |
     +----------------------+
       (great_person_id)

famous_people
```

## 備考
- データベースエンジンにはPostgreSQLを使用
- タイムスタンプは自動的に現在時刻が設定される
- 外部キー制約によりデータの整合性を保証
- 有名人の年齢は誕生日から自動計算されるため、データ更新の必要なし 