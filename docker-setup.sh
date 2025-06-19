#!/bin/bash

# Docker Setup Validation Script for NevuEmailSender

echo "🐳 NevuEmailSender Docker Setup Validator"
echo "=========================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed."
    echo "   Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

echo "✅ Docker is installed: $(docker --version)"

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running."
    echo "   Please start Docker daemon:"
    echo "   - On Linux: sudo systemctl start docker"
    echo "   - On macOS/Windows: Start Docker Desktop"
    exit 1
fi

echo "✅ Docker daemon is running"

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "⚠️  Docker Compose is not available."
    echo "   Docker Compose v2 is recommended for this project."
else
    if docker compose version &> /dev/null; then
        echo "✅ Docker Compose v2 is available: $(docker compose version)"
    else
        echo "✅ Docker Compose v1 is available: $(docker-compose --version)"
    fi
fi

echo ""
echo "🔧 Build and Run Instructions:"
echo "==============================="
echo ""

echo "1. Build the Docker image:"
echo "   docker build -t nevuemailsender ."
echo ""

echo "2. Run with Docker Compose (recommended):"
echo "   docker-compose up -d"
echo ""

echo "3. Or run with Docker directly:"
echo "   docker run -d \\"
echo "     --name nevuemailsender \\"
echo "     -p 3000:3000 \\"
echo "     -e JWT_SECRET=your-secret-key \\"
echo "     -v nevuemailsender_data:/app/data \\"
echo "     nevuemailsender"
echo ""

echo "4. Access the application:"
echo "   http://localhost:3000"
echo "   Default credentials: admin / admin123"
echo ""

echo "5. View logs:"
echo "   docker-compose logs -f    # For docker-compose"
echo "   docker logs -f nevuemailsender  # For docker run"
echo ""

echo "🚀 GitHub Container Registry:"
echo "=============================="
echo ""
echo "Once the GitHub workflow runs, you can use the pre-built image:"
echo "docker pull ghcr.io/yourusername/nevuemailsender:latest"
echo ""

echo "📁 Persistent Data:"
echo "==================="
echo ""
echo "Database and configuration are stored in Docker volumes:"
echo "- Volume name: nevuemailsender_data (docker-compose) or nevuemailsender_data (docker run)"
echo "- Container path: /app/data"
echo "- Contains: database.db and other persistent files"
echo ""

echo "🔒 Security Notes:"
echo "=================="
echo ""
echo "- Set a strong JWT_SECRET in production"
echo "- Change default admin password after first login"
echo "- Use environment variables for sensitive configuration"
echo "- Keep the Docker image updated"
echo ""

echo "✅ Setup validation complete!"
echo ""
echo "Next steps:"
echo "1. Start Docker daemon if not running"
echo "2. Run: docker-compose up -d"
echo "3. Visit: http://localhost:3000"
