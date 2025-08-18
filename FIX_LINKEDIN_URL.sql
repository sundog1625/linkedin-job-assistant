-- 修复linkedin_url NOT NULL约束问题

-- 1. 移除linkedin_url的NOT NULL约束
ALTER TABLE jobs ALTER COLUMN linkedin_url DROP NOT NULL;

-- 2. 验证约束已移除
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'jobs' AND column_name = 'linkedin_url';

-- 3. 现在测试插入
INSERT INTO jobs (
  user_id,
  title,
  company,
  location,
  linkedin_url,
  status
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Test Job Success',
  'Test Company',
  'Test Location',
  'https://linkedin.com/test',
  'saved'
) RETURNING id, title;

-- 4. 确认插入成功
SELECT COUNT(*) as success_count FROM jobs 
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

SELECT '✅ 修复完成！现在可以添加职位了！' as status;