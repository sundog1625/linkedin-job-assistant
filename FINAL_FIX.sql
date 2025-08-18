-- 最终修复脚本 - 解决所有问题
-- 在Supabase SQL编辑器中执行这个脚本

-- 1. 确保UUID扩展启用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建users表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 确保测试用户存在
-- 删除可能存在的错误记录
DELETE FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- 插入正确的测试用户
INSERT INTO users (id, email) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'test@linkedin-assistant.com'
);

-- 4. 验证用户已创建
SELECT * FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- 5. 确保jobs表有applicant_count列
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' AND column_name = 'applicant_count'
    ) THEN
        ALTER TABLE jobs ADD COLUMN applicant_count INTEGER;
    END IF;
END $$;

-- 6. 测试插入一条职位记录
INSERT INTO jobs (
  user_id,
  title,
  company,
  location,
  linkedin_url,
  applicant_count,
  status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Test Job - ' || NOW()::TEXT,
  'Test Company',
  'Test Location',
  'https://linkedin.com/test/' || NOW()::TEXT,
  100,
  'saved'
);

-- 7. 确认插入成功
SELECT COUNT(*) as test_count FROM jobs 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID 
AND title LIKE 'Test Job%';

-- 8. 显示成功消息
SELECT '✅ 数据库修复完成！现在可以添加职位了！' as status;