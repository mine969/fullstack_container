#!/bin/bash
# Script to reset the database and apply the new init.sql

echo "⚠️  WARNING: This will DELETE the current database volume and all data!"
echo "The database will be re-initialized with data from init.sql"
echo ""
echo "Stopping containers and removing volumes..."

# Check if Docker is available
if command -v docker &> /dev/null; then
    DOCKER_CMD="docker"
elif command -v /usr/local/bin/docker &> /dev/null; then
    DOCKER_CMD="/usr/local/bin/docker"
else
    echo "❌ Docker not found"
    exit 1
fi

# Stop and remove volumes
$DOCKER_CMD compose down -v

echo ""
echo "🚀 Starting containers..."
$DOCKER_CMD compose up -d

echo ""
echo "⏳ Waiting for database to initialize (this may take 10-20 seconds)..."
sleep 15

echo ""
echo "✅ Database reset complete!"
echo "Check phpMyAdmin at: http://localhost:8888"
