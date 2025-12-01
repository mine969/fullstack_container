#!/bin/bash
# Script to apply the database migration to add is_deleted column

echo "🔧 Applying database migration to fix menu_items table..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found in PATH. Trying /usr/local/bin/docker..."
    DOCKER_CMD="/usr/local/bin/docker"
else
    DOCKER_CMD="docker"
fi

# Execute the migration SQL
echo "📝 Adding is_deleted column to menu_items table..."
$DOCKER_CMD exec -i bitebite_quick mysql -uroot -prootpassword burgar_db < fix_menu_table.sql

if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
    echo ""
    echo "🧪 Testing the menu endpoint..."
    sleep 2
    curl -s http://localhost:3001/menu/ | python3 -m json.tool || echo "Response received (check if it's valid JSON)"
else
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi
