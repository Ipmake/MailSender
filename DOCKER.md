# 🐳 Docker Quick Start Guide

This guide will get you up and running with FyraEmailSender using Docker in under 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Port 3000 available on your machine

## Option 1: Using Docker Compose (Recommended)

1. **Download the configuration**:
   ```bash
   curl -O https://raw.githubusercontent.com/yourusername/FyraEmaiLSender/main/docker-compose.yml
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Access the app**:
   - Open: **https://localhost:3000** (HTTPS with self-signed certificate)
   - Your browser will show a security warning - click "Advanced" and "Proceed to localhost"
   - Login: `admin` / `admin123`

## Option 2: Using Docker Run

```bash
docker run -d \
  --name fyraemailsender \
  -p 3000:3000 \
  -e JWT_SECRET=your-secret-key-here \
  -e DATA_DIR=/data \
  -v fyraemailsender_data:/data \
  ghcr.io/yourusername/fyraemailsender:latest
```

## Option 3: Build from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/FyraEmaiLSender.git
   cd FyraEmaiLSender
   ```

2. **Build and run**:
   ```bash
   docker-compose up -d --build
   ```

## 🔒 SSL/HTTPS Information

The application automatically runs on HTTPS with self-signed certificates:

- **Certificates Location**: `/data/ssl/` in container
- **Auto-Generated**: Created on first startup if not present
- **Persistent**: Certificates survive container restarts
- **Browser Warning**: Expected for self-signed certificates

### Disable HTTPS (Not Recommended)
```bash
docker run -d \
  --name fyraemailsender \
  -p 3000:3000 \
  -e DISABLE_SSL=true \
  -e JWT_SECRET=your-secret-key-here \
  -v fyraemailsender_data:/data \
  ghcr.io/yourusername/fyraemailsender:latest
```

## First Setup

1. **Login** with default credentials: `admin` / `admin123`
2. **Change password** in User Settings
3. **Configure SMTP** in Configuration tab:
   - Host: `smtp.gmail.com` (for Gmail)
   - Port: `587`
   - Username: your email
   - Password: your app password
4. **Set email identity** (sender name, reply-to, etc.)

## Management Commands

```bash
# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Update to latest version
docker-compose pull && docker-compose up -d

# Backup data
docker run --rm -v fyraemailsender_fyraemailsender_data:/data -v $(pwd):/backup busybox tar czf /backup/backup.tar.gz /data

# Restore data
docker run --rm -v fyraemailsender_fyraemailsender_data:/data -v $(pwd):/backup busybox tar xzf /backup/backup.tar.gz -C /
```

## Environment Variables

Create a `.env` file for custom configuration:

```env
# Security
JWT_SECRET=your-super-secret-key-minimum-32-characters

# Database (optional)
DATABASE_URL=file:/data/database.db

# Server (optional)
PORT=3000
NODE_ENV=production
```

Then use: `docker-compose --env-file .env up -d`

## Troubleshooting

### Common Issues

1. **Port 3000 in use**: Change port in docker-compose.yml: `"3001:3000"`
2. **Permission errors**: Ensure Docker has access to the data directory
3. **SMTP errors**: Use app passwords for Gmail/Outlook

### Get Help

```bash
# Check container status
docker-compose ps

# View detailed logs
docker-compose logs --tail=100

# Access container shell
docker-compose exec app sh

# Test database
docker-compose exec app npx prisma studio
```

## Security Notes

- Change default admin password immediately
- Use a strong JWT_SECRET (32+ characters)
- Keep the container updated: `docker-compose pull`
- Don't expose sensitive environment variables

## Data Persistence

All data is stored in Docker volumes:
- Database: `/data/database.db`
- Volume name: `fyraemailsender_fyraemailsender_data`

Your emails, templates, and settings are automatically persisted between container restarts.

---

**That's it! 🚀 Your email sender is now running in Docker.**

Need help? Check the main README.md or open an issue on GitHub.
