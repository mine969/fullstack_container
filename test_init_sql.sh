#!/bin/bash
# Test script to verify the updated init.sql with production data

echo "🧪 Testing init.sql with production data..."
echo ""

# Check if Docker is available
if command -v /usr/local/bin/docker &> /dev/null; then
    DOCKER_CMD="/usr/local/bin/docker"
else
    echo "❌ Docker not found"
    exit 1
fi

echo "1️⃣ Creating test database..."
$DOCKER_CMD exec bitebite_quick mysql -uroot -prootpassword -e "DROP DATABASE IF EXISTS test_init_db; CREATE DATABASE test_init_db;" 2>&1 | grep -v "Using a password"

echo "2️⃣ Applying init.sql to test database..."
$DOCKER_CMD exec -i bitebite_quick mysql -uroot -prootpassword test_init_db < init.sql 2>&1 | grep -v "Using a password"

echo ""
echo "3️⃣ Verifying data counts..."
$DOCKER_CMD exec bitebite_quick mysql -uroot -prootpassword test_init_db -e "
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL SELECT 'menu_items', COUNT(*) FROM menu_items
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items;
" 2>&1 | grep -v "Using a password"

echo ""
echo "4️⃣ Checking production users..."
$DOCKER_CMD exec bitebite_quick mysql -uroot -prootpassword test_init_db -e "
SELECT name, email, role FROM users ORDER BY id;
" 2>&1 | grep -v "Using a password"

echo ""
echo "5️⃣ Checking menu categories..."
$DOCKER_CMD exec bitebite_quick mysql -uroot -prootpassword test_init_db -e "
SELECT category, COUNT(*) as count FROM menu_items WHERE is_deleted = 0 GROUP BY category ORDER BY category;
" 2>&1 | grep -v "Using a password"

echo ""
echo "6️⃣ Cleaning up test database..."
$DOCKER_CMD exec bitebite_quick mysql -uroot -prootpassword -e "DROP DATABASE test_init_db;" 2>&1 | grep -v "Using a password"

echo ""
echo "✅ Test complete!"
