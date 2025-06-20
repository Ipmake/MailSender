#!/bin/sh

# Entrypoint script for NevuEmailSender Docker container

echo "🚀 Starting NevuEmailSender..."

# Set DATA_DIR environment variable
export DATA_DIR=/data

# Ensure data directory exists
mkdir -p /data
echo "📁 Data directory ready: /data"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set, using default: file:/data/database.db"
    export DATABASE_URL=file:/data/database.db
fi

echo "🗄️  Using database: $DATABASE_URL"

# Initialize database if it doesn't exist
if [ ! -f "/data/database.db" ]; then
    echo "📊 Database not found, initializing..."
    
    # Run migrations
    echo "🔄 Running database migrations..."
    npx prisma migrate deploy
    if [ $? -ne 0 ]; then
        echo "❌ Failed to run migrations"
        exit 1
    fi
    
    # Run seeding
    echo "🌱 Seeding database with admin user..."
    npx prisma db seed
    if [ $? -ne 0 ]; then
        echo "❌ Failed to seed database"
        exit 1
    fi
else
    echo "📊 Database exists, running migrations..."
    npx prisma migrate deploy
    if [ $? -ne 0 ]; then
        echo "❌ Failed to run migrations"
        exit 1
    fi
fi

echo "✅ Database ready!"

# Start the application
echo "🌐 Starting web server on port ${PORT:-3000}..."
exec node dist/index.js
