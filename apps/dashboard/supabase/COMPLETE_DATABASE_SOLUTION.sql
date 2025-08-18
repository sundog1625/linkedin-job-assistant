-- LinkedIn Job Assistant - 完整数据库解决方案
-- 一次性解决所有数据库问题：users表缺失、外键约束、UUID格式、applicant_count字段

-- ========================================
-- 第一步：创建必要的扩展和函数
-- ========================================

-- 确保UUID扩展已启用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- ========================================
-- 第二步：创建users表（缺失的核心表）
-- ========================================

-- 删除可能存在的users表并重新创建
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  -- 主键：使用标准UUID
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 用户认证信息
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  
  -- 用户基本信息
  full_name TEXT,
  username TEXT UNIQUE,
  
  -- LinkedIn集成
  linkedin_id TEXT,
  linkedin_url TEXT,
  
  -- 用户状态
  email_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'enterprise')),
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- 创建users表的索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_linkedin_id ON users(linkedin_id);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- 创建users表的更新触发器
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- 第三步：插入测试用户（解决外键约束问题）
-- ========================================

-- 插入指定的测试用户
INSERT INTO users (
  id, 
  email, 
  full_name, 
  username, 
  email_verified, 
  is_active
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'test@linkedin-assistant.com',
  'Test User',
  'testuser',
  true,
  true
) ON CONFLICT (id) DO NOTHING;

-- 插入额外的测试用户以便测试
INSERT INTO users (
  email, 
  full_name, 
  username, 
  email_verified, 
  is_active
) VALUES 
(
  'dev@linkedin-assistant.com',
  'Developer User',
  'developer',
  true,
  true
),
(
  'admin@linkedin-assistant.com',
  'Admin User',
  'admin',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- ========================================
-- 第四步：创建user_profiles表
-- ========================================

-- 删除可能存在的user_profiles表并重新创建
DROP TABLE IF EXISTS user_profiles CASCADE;

CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 外键关联到users表
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 用户详细信息
  headline TEXT,
  summary TEXT,
  location TEXT,
  skills TEXT[] DEFAULT '{}',
  experience_years INTEGER,
  education TEXT,
  resume_url TEXT,
  portfolio_url TEXT,
  
  -- 用户偏好设置
  preferences JSONB DEFAULT '{}',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建唯一约束，一个用户只能有一个profile
ALTER TABLE user_profiles ADD CONSTRAINT unique_user_profile UNIQUE (user_id);

-- 创建索引
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_location ON user_profiles(location);

-- 创建更新触发器
CREATE TRIGGER update_user_profiles_updated_at 
BEFORE UPDATE ON user_profiles 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- 第五步：重新创建jobs表（包含正确的外键约束）
-- ========================================

-- 删除现有jobs表
DROP TABLE IF EXISTS jobs CASCADE;

-- 创建完整的jobs表，包含所有必要字段
CREATE TABLE jobs (
  -- 主键
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 外键：正确关联到users表
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
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
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'internship', 'freelance')),
  
  -- 时间信息
  posted_date TIMESTAMP WITH TIME ZONE,
  application_deadline TIMESTAMP WITH TIME ZONE,
  
  -- 关键字段：申请人数量（解决API第49行错误）
  applicant_count INTEGER DEFAULT 0,
  
  -- 匹配分数（支持复杂JSON结构）
  match_score JSONB DEFAULT '{}',
  
  -- 申请状态管理
  status TEXT DEFAULT 'saved' 
    CHECK (status IN ('saved', 'applied', 'interviewing', 'offer', 'rejected', 'withdrawn')),
  
  -- 申请跟踪
  applied_date TIMESTAMP WITH TIME ZONE,
  interview_date TIMESTAMP WITH TIME ZONE,
  response_date TIMESTAMP WITH TIME ZONE,
  
  -- 用户备注和标签
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  
  -- AI分析结果
  ai_analysis JSONB DEFAULT '{}',
  
  -- 时间戳
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 第六步：创建jobs表的索引和约束
-- ========================================

-- 创建关键索引以提高查询性能
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_company ON jobs(company);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);
CREATE INDEX idx_jobs_applicant_count ON jobs(applicant_count);

-- 创建复合索引，优化常见查询
CREATE INDEX idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX idx_jobs_user_created ON jobs(user_id, created_at DESC);

-- 创建唯一约束，防止重复添加相同LinkedIn职位
CREATE UNIQUE INDEX idx_jobs_user_linkedin_url 
ON jobs(user_id, linkedin_url) WHERE linkedin_url IS NOT NULL;

-- 创建更新触发器
CREATE TRIGGER update_jobs_updated_at 
BEFORE UPDATE ON jobs 
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ========================================
-- 第七步：设置Row Level Security (RLS)
-- ========================================

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略（开发阶段宽松策略，生产环境需要更严格）
CREATE POLICY "Enable all access for users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for user_profiles" ON user_profiles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for jobs" ON jobs
  FOR ALL USING (true) WITH CHECK (true);

-- ========================================
-- 第八步：添加表和字段注释
-- ========================================

-- 表注释
COMMENT ON TABLE users IS '用户基础信息表';
COMMENT ON TABLE user_profiles IS '用户详细档案表';
COMMENT ON TABLE jobs IS 'LinkedIn职位跟踪表 - 存储用户保存和申请的职位信息';

-- 关键字段注释
COMMENT ON COLUMN jobs.applicant_count IS 'LinkedIn显示的申请人数量（解决API第49行错误）';
COMMENT ON COLUMN jobs.match_score IS 'AI生成的职位匹配分数，包含技能、经验、教育等维度';
COMMENT ON COLUMN jobs.user_id IS '外键：关联到users.id';
COMMENT ON COLUMN jobs.requirements IS '职位要求数组';
COMMENT ON COLUMN jobs.required_skills IS '必需技能数组';
COMMENT ON COLUMN jobs.tags IS '用户自定义标签数组';

-- ========================================
-- 第九步：验证数据库结构
-- ========================================

-- 验证所有表都已创建
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'user_profiles', 'jobs')
ORDER BY table_name;

-- 验证外键约束
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('jobs', 'user_profiles');

-- 验证jobs表的所有列
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
ORDER BY ordinal_position;

-- ========================================
-- 完成提示
-- ========================================

RAISE NOTICE '✅ LinkedIn Job Assistant数据库解决方案执行完成！';
RAISE NOTICE '✅ 已解决：1. users表缺失  2. 外键约束错误  3. applicant_count字段缺失  4. UUID格式问题';
RAISE NOTICE '✅ 测试用户已创建：550e8400-e29b-41d4-a716-446655440000';
RAISE NOTICE '🎯 现在可以正常插入jobs数据了！';