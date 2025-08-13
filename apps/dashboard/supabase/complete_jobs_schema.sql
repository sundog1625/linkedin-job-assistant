-- LinkedIn Job Assistant - 完整Jobs表Schema
-- 包含所有API需要的字段，解决applicant_count列缺失问题

-- 删除现有表（如果存在）并重新创建确保字段完整性
DROP TABLE IF EXISTS jobs CASCADE;

-- 创建更新时间触发器函数（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建完整的Jobs表
CREATE TABLE jobs (
  -- 主键和用户标识
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  
  -- LinkedIn职位信息
  linkedin_url TEXT,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT DEFAULT '',
  
  -- 职位要求和技能
  requirements TEXT[] DEFAULT '{}',
  required_skills TEXT[] DEFAULT '{}',
  experience_required TEXT,
  education_required TEXT,
  
  -- 薪资和职位类型
  salary_range TEXT,
  job_type TEXT,
  
  -- 时间信息
  posted_date TIMESTAMP WITH TIME ZONE,
  application_deadline TIMESTAMP WITH TIME ZONE,
  
  -- 关键字段：申请人数量（API第49行使用）
  applicant_count INTEGER,
  
  -- 匹配分数（支持复杂JSON结构）
  match_score JSONB,
  
  -- 申请状态管理
  status TEXT DEFAULT 'saved' 
    CHECK (status IN ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn')),
  
  -- 申请跟踪
  applied_date TIMESTAMP WITH TIME ZONE,
  interview_date TIMESTAMP WITH TIME ZONE,
  
  -- 用户备注和标签
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建关键索引以提高查询性能
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);

-- 创建唯一约束，防止重复添加相同LinkedIn职位
CREATE UNIQUE INDEX idx_jobs_user_linkedin_url 
ON jobs(user_id, linkedin_url) WHERE linkedin_url IS NOT NULL;

-- 创建更新触发器
CREATE TRIGGER update_jobs_updated_at 
BEFORE UPDATE ON jobs 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 启用行级安全策略
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略（开发阶段允许全部访问，生产环境需要更严格的策略）
CREATE POLICY "Enable all access for jobs" ON jobs
  FOR ALL USING (true) WITH CHECK (true);

-- 添加表注释
COMMENT ON TABLE jobs IS 'LinkedIn职位跟踪表 - 存储用户保存和申请的职位信息';
COMMENT ON COLUMN jobs.applicant_count IS 'LinkedIn显示的申请人数量';
COMMENT ON COLUMN jobs.match_score IS 'AI生成的职位匹配分数，包含技能、经验、教育等维度';
COMMENT ON COLUMN jobs.requirements IS '职位要求数组';
COMMENT ON COLUMN jobs.required_skills IS '必需技能数组';
COMMENT ON COLUMN jobs.tags IS '用户自定义标签数组';

-- 验证表结构
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;