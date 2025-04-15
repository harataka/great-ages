-- 偉人テーブルの作成
CREATE TABLE IF NOT EXISTS great_persons (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  death_date DATE,
  profession VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 偉業テーブルの作成
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  great_person_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  achievement_date DATE,
  age_at_achievement INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (great_person_id) REFERENCES great_persons(id) ON DELETE CASCADE
);

-- 有名人テーブルの作成
CREATE TABLE IF NOT EXISTS famous_people (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックスの作成
CREATE INDEX idx_great_persons_name ON great_persons(name);
CREATE INDEX idx_achievements_great_person_id ON achievements(great_person_id);
CREATE INDEX idx_famous_people_name ON famous_people(name);
CREATE INDEX idx_famous_people_birth_date ON famous_people(birth_date);

-- 偉人の名前を含む偉業ビューの作成
CREATE OR REPLACE VIEW achievements_with_person AS
SELECT 
  a.id,
  a.great_person_id,
  g.name AS person_name,
  a.title,
  a.description,
  a.achievement_date,
  a.age_at_achievement,
  a.created_at,
  a.updated_at
FROM 
  achievements a
JOIN
  great_persons g ON a.great_person_id = g.id;

-- 有名人の年齢計算ビューの作成
CREATE OR REPLACE VIEW famous_people_with_age AS
SELECT
  id,
  name,
  birth_date,
  description,
  image_url,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::INTEGER AS current_age,
  created_at,
  updated_at
FROM
  famous_people; 