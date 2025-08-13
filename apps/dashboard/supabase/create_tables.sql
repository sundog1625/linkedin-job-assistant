-- 创建用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
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

-- 设置RLS（Row Level Security）策略
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 允许所有人读写（开发阶段，生产环境应该更严格）
CREATE POLICY "Enable all access for user_profiles" ON user_profiles
  FOR ALL USING (true) WITH CHECK (true);

-- 创建职位表（可选，为后续功能准备）
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  linkedin_url TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  requirements TEXT[],
  required_skills TEXT[],
  experience_required TEXT,
  education_required TEXT,
  salary_range TEXT,
  job_type TEXT,
  posted_date TIMESTAMP WITH TIME ZONE,
  application_deadline TIMESTAMP WITH TIME ZONE,
  match_score JSONB,
  status TEXT DEFAULT 'saved',
  applied_date TIMESTAMP WITH TIME ZONE,
  interview_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建职位表的触发器
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE
  ON jobs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 创建职位表的索引
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- 设置职位表的RLS策略
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for jobs" ON jobs
  FOR ALL USING (true) WITH CHECK (true);