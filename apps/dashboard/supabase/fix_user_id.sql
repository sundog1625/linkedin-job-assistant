-- 修改user_profiles表的user_id字段类型
-- 先删除旧表（如果没有重要数据的话）
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 重新创建表，user_id使用TEXT类型
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,  -- 使用TEXT而不是UUID
  email TEXT,
  full_name TEXT,
  headline TEXT,
  summary TEXT,
  location TEXT,
  skills TEXT[],
  experience INTEGER,
  education TEXT,
  linkedin_url TEXT,
  resume_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
  ON user_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 创建索引
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- 设置RLS策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for user_profiles" ON user_profiles
  FOR ALL USING (true) WITH CHECK (true);