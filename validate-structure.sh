#!/bin/bash

# File structure validation for Docker build

echo "🔍 Validating file structure for Docker build..."
echo ""

# Check required files
required_files=(
    "package.json"
    "tsconfig.json"
    "Dockerfile"
    "docker-compose.yml"
    ".dockerignore"
    "src/index.ts"
    "src/server.ts"
    "prisma/schema.prisma"
    "frontend/package.json"
    "frontend/src/main.tsx"
)

missing_files=()

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file"
    else
        echo "❌ $file (missing)"
        missing_files+=("$file")
    fi
done

echo ""

# Check directories
required_dirs=(
    "src"
    "frontend/src"
    "prisma"
    "src/routes"
    "src/middleware"
)

missing_dirs=()

for dir in "${required_dirs[@]}"; do
    if [[ -d "$dir" ]]; then
        echo "✅ $dir/"
    else
        echo "❌ $dir/ (missing)"
        missing_dirs+=("$dir")
    fi
done

echo ""

if [[ ${#missing_files[@]} -eq 0 && ${#missing_dirs[@]} -eq 0 ]]; then
    echo "✅ All required files and directories are present!"
    echo "🐳 Ready for Docker build!"
    echo ""
    echo "To build and run:"
    echo "  docker build -t nevuemailsender ."
    echo "  docker-compose up -d"
else
    echo "❌ Missing files or directories detected!"
    echo ""
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        echo "Missing files:"
        printf '  - %s\n' "${missing_files[@]}"
    fi
    if [[ ${#missing_dirs[@]} -gt 0 ]]; then
        echo "Missing directories:"
        printf '  - %s\n' "${missing_dirs[@]}"
    fi
    echo ""
    echo "Please ensure all required files are present before building."
    exit 1
fi
