-- 强制修复脚本 - 解决用户不存在问题

-- 1. 先检查users表是否存在
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE  table_schema = 'public'
   AND    table_name   = 'users'
) as users_table_exists;

-- 2. 如果users表不存在，创建它
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 检查是否有外键约束阻止插入
SELECT 
    tc.constraint_name, 
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
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='jobs';

-- 4. 强制插入用户（先删除可能存在的）
DELETE FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- 5. 插入测试用户
INSERT INTO users (id, email, created_at) 
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::UUID,
  'test@linkedin-assistant.com',
  NOW()
);

-- 6. 验证用户已插入
SELECT id, email, created_at FROM users 
WHERE id = '550e8400-e29b-41d4-a716-446655440000'::UUID;

-- 7. 再检查一次用户数量
SELECT COUNT(*) as user_count FROM users;

-- 8. 显示所有用户
SELECT * FROM users;

-- 如果还是不行，尝试禁用外键检查（仅开发环境）
-- ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_user_id_fkey;
-- 然后重新添加（可选）
-- ALTER TABLE jobs ADD CONSTRAINT jobs_user_id_fkey 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;