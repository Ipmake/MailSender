# 🐳 Docker Quick Start Guide

This guide will get you up and running with NevuEmailSender using Docker in under 5 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Port 3000 available on your machine

## Option 1: Using Docker Compose (Recommended)

1. **Download the configuration**:
   ```bash
   curl -O https://raw.githubusercontent.com/yourusername/NevuEmaiLSender/main/docker-compose.yml
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Access the app**:
   - Open: http://localhost:3000
   - Login: `admin` / `admin123`

## Option 2: Using Docker Run

```bash
docker run -d \
  --name nevuemailsender \
  -p 3000:3000 \
  -e JWT_SECRET=your-secret-key-here \
  -v nevuemailsender_data:/app/data \
  ghcr.io/yourusername/nevuemailsender:latest
```

## Option 3: Build from Source

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/NevuEmaiLSender.git
   cd NevuEmaiLSender
   ```

2. **Build and run**:
   ```bash
   docker-compose up -d --build
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
docker run --rm -v nevuemailsender_nevuemailsender_data:/data -v $(pwd):/backup busybox tar czf /backup/backup.tar.gz /data

# Restore data
docker run --rm -v nevuemailsender_nevuemailsender_data:/data -v $(pwd):/backup busybox tar xzf /backup/backup.tar.gz -C /
```

## Environment Variables

Create a `.env` file for custom configuration:

```env
# Security
JWT_SECRET=your-super-secret-key-minimum-32-characters

# Database (optional)
DATABASE_URL=file:./data/database.db

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
- Database: `/app/data/database.db`
- Volume name: `nevuemailsender_nevuemailsender_data`

Your emails, templates, and settings are automatically persisted between container restarts.

---

**That's it! 🚀 Your email sender is now running in Docker.**

Need help? Check the main README.md or open an issue on GitHub.
