-- 应急快速修复脚本
-- 如果你只想立即解决当前的外键约束错误

-- ========================================
-- 应急选项1：创建基础users表和测试用户
-- ========================================

-- 创建最基础的users表（如果不存在）
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入你指定的测试用户UUID
INSERT INTO users (id, email) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'test@linkedin-assistant.com'
) ON CONFLICT (id) DO NOTHING;

-- ========================================
-- 应急选项2：临时移除外键约束（不推荐）
-- ========================================

-- 如果上面的方法不行，可以临时移除外键约束
-- 注意：这只是临时解决方案，会降低数据完整性

-- 查看当前的外键约束名称
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'jobs' AND constraint_type = 'FOREIGN KEY';

-- 如果需要移除外键约束，取消下面的注释：
-- ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_user_id_fkey;

-- ========================================
-- 应急选项3：修改现有jobs表的user_id为TEXT类型
-- ========================================

-- 如果jobs表的user_id是TEXT类型而不是UUID，这样修复：

-- 先备份现有数据
-- CREATE TABLE jobs_backup AS SELECT * FROM jobs;

-- 删除外键约束
-- ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_user_id_fkey;

-- 如果user_id是TEXT类型，这样插入测试数据：
-- INSERT INTO jobs (user_id, title, company, applicant_count) VALUES (
--   'test-user-id',
--   'Test Job',
--   'Test Company', 
--   100
-- );

-- ========================================
-- 验证修复结果
-- ========================================

-- 测试插入一条记录
INSERT INTO jobs (
  user_id,
  title,
  company,
  applicant_count
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'Emergency Test Job',
  'Test Company',
  50
);

-- 如果上面成功，说明问题已解决
SELECT 'Emergency fix successful!' as status;

-- 清理测试数据
DELETE FROM jobs WHERE title = 'Emergency Test Job';

RAISE NOTICE '🚨 应急修复完成！建议执行完整解决方案以获得最佳效果。';