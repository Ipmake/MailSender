#!/bin/sh

# Entrypoint script for NevuEmailSender Docker container

echo "🚀 Starting NevuEmailSender..."

# Ensure data directory exists
mkdir -p /data

# Initialize database if it doesn't exist
if [ ! -f "/data/database.db" ]; then
    echo "📊 Initializing database..."
    npx prisma migrate deploy
    
    echo "🌱 Seeding database with admin user..."
    npx prisma db seed
else
    echo "📊 Database exists, running migrations..."
    npx prisma migrate deploy
fi

echo "✅ Database ready!"

# Start the application
echo "🌐 Starting web server on port ${PORT:-3000}..."
exec node dist/index.js
