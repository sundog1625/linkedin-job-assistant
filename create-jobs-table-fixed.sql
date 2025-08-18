-- LinkedIn Job Tracker - 创建Jobs表（修复版本）

-- 首先创建更新时间戳函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建Jobs表
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
  applicant_count INTEGER,
  match_score JSONB,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn')),
  applied_date TIMESTAMP WITH TIME ZONE,
  interview_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);

-- 删除现有触发器（如果存在）
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;

-- 创建更新触发器
CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 设置RLS策略
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 删除现有策略
DROP POLICY IF EXISTS "Enable all access for jobs" ON jobs;

-- 创建新的RLS策略
CREATE POLICY "Enable all access for jobs" ON jobs
  FOR ALL USING (true) WITH CHECK (true);

-- 创建唯一约束，防止重复添加相同职位
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_user_linkedin_url 
ON jobs(user_id, linkedin_url) WHERE linkedin_url IS NOT NULL;

-- 完成提示
SELECT 'Jobs表创建完成！现在可以使用Job Tracker功能了 🎉' as message;