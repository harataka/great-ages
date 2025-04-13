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

-- インデックスの作成
CREATE INDEX idx_great_persons_name ON great_persons(name);
CREATE INDEX idx_achievements_great_person_id ON achievements(great_person_id); 