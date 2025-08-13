-- 测试脚本：验证jobs表能正确处理所有API字段
-- 包括applicant_count字段的插入测试

-- 清理测试数据（可选）
DELETE FROM jobs WHERE user_id = 'test-user-schema';

-- 测试完整字段插入（模拟API第49行的操作）
INSERT INTO jobs (
  user_id,
  linkedin_url,
  title,
  company,
  location,
  description,
  requirements,
  required_skills,
  experience_required,
  salary_range,
  job_type,
  posted_date,
  applicant_count,  -- 关键测试字段
  match_score,
  status,
  applied_date,
  interview_date,
  notes,
  tags
) VALUES (
  'test-user-schema',
  'https://linkedin.com/jobs/test-123',
  '高级前端开发工程师',
  'Tech Company Ltd',
  '北京市',
  '负责前端架构设计和开发',
  ARRAY['React', 'TypeScript', '3年以上经验'],
  ARRAY['React', 'TypeScript', 'Node.js'],
  '3-5年',
  '25k-35k',
  'full-time',
  NOW() - INTERVAL '2 days',
  127,  -- 测试applicant_count字段
  '{"skills": 85, "experience": 90, "education": 75, "location": 95, "overall": 86}'::jsonb,
  'saved',
  NULL,
  NULL,
  '这个职位很有吸引力',
  ARRAY['前端', '技术']
);

-- 验证插入成功
SELECT 
  id,
  title,
  company,
  applicant_count,  -- 验证关键字段
  match_score,
  status,
  created_at
FROM jobs 
WHERE user_id = 'test-user-schema';

-- 测试更新操作（模拟API PATCH请求）
UPDATE jobs 
SET 
  applicant_count = 150,
  status = 'applied',
  applied_date = NOW(),
  notes = '已提交申请',
  updated_at = NOW()
WHERE user_id = 'test-user-schema';

-- 验证更新成功
SELECT 
  title,
  company,
  applicant_count,
  status,
  applied_date,
  notes,
  updated_at
FROM jobs 
WHERE user_id = 'test-user-schema';

-- 清理测试数据
DELETE FROM jobs WHERE user_id = 'test-user-schema';

RAISE NOTICE '✅ Jobs表schema测试完成 - applicant_count字段正常工作！';