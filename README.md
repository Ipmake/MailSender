# Nevu Email Sender Pro

A modern, feature-rich TypeScript Node.js email sender application with a beautiful web interface. Send individual docker run -d \
  --name nevuemailsender \
  -p 3000:3000 \
  -e JWT_SECRET=your-secret-key \
  -v nevuemailsender_data:/data \
  nevuemailsender, bulk emails, manage templates, and configure SMTP settings all from a sleek web dashboard.

## ✨ Features

### 📧 Email Sending
- **Raw Content Parser**: Paste raw email content and automatically separate text/HTML
- **Individual Email Sending**: Send personalized emails with text and HTML content
- **Bulk Email Sending**: Send emails to multiple recipients with progress tracking
- **SMTP Connection Testing**: Verify your SMTP settings before sending

### 📝 Template Management
- **Create Templates**: Save frequently used email content as reusable templates
- **Template Library**: Browse and manage all your email templates
- **Quick Load**: Load templates into compose forms with one click
- **Template Deletion**: Remove outdated templates easily

### ⚙️ Configuration Management
- **SMTP Configuration**: Configure any SMTP server (Gmail, Outlook, custom servers)
- **Email Identity**: Set sender name, email, reply-to, and signature
- **Persistent Settings**: All configurations are saved in database
- **Easy Editing**: Update settings through the web interface

### 👥 User Management
- **Username/Password Authentication**: Secure login system
- **Admin Interface**: Create and manage users (admin only)
- **Role-based Access**: Admin and user roles with appropriate permissions
- **Password Management**: Users can change their own passwords

### 📊 Analytics & Tracking
- **Email Statistics**: Track total emails sent and success rates
- **Template Analytics**: Monitor template usage and creation
- **Activity Logging**: View recent activity and performance metrics
- **Database Storage**: All data persists in SQLite database

### 🎨 Modern Interface
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Dark Theme Header**: Beautiful gradient header with enhanced visibility
- **Intuitive Navigation**: React Router-based navigation
- **Real-time Feedback**: Live status updates and progress indicators
- **Monaco Editor**: Professional code editor for HTML templates
- **Loading Indicators**: Consistent loading states throughout the app

## 🐳 Quick Start with Docker (Recommended)

### Using Docker Compose (Easiest)

1. **Download the docker-compose.yml file**:
   ```bash
   curl -O https://raw.githubusercontent.com/yourusername/NevuEmaiLSender/main/docker-compose.yml
   ```

2. **Start the application**:
   ```bash
   docker-compose up -d
   ```

3. **Access the application**:
   - Open your browser and go to `http://localhost:3000`
   - Default admin credentials: `admin` / `admin123`

### Using Docker Run

```bash
docker run -d \
  --name nevuemailsender \
  -p 3000:3000 \
  -e JWT_SECRET=your-super-secret-jwt-key-change-this-in-production \
  -v nevuemailsender_data:/data \
  ghcr.io/yourusername/nevuemailsender:latest
```

### Using Pre-built Image from GitHub Packages

The latest Docker image is automatically built and published to GitHub Container Registry on every push to main:

```bash
docker pull ghcr.io/yourusername/nevuemailsender:latest
```

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ installed
- SMTP server credentials (Gmail, Outlook, etc.)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/NevuEmaiLSender.git
   cd NevuEmaiLSender
   ```

2. **Install dependencies**:
   ```bash
   npm install
   npm run install:frontend
   ```

3. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize the database**:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

5. **Start development**:
   ```bash
   # Development mode (backend + frontend hot reload)
   npm run dev:backend  # Terminal 1
   npm run dev:frontend # Terminal 2
   
   # Or build and run production mode
   npm run prod
   ```

6. **Access the application**:
   - Open your browser and go to `http://localhost:3000`
   - Default admin credentials: `admin` / `admin123`

## 🐳 Building Docker Image Locally

If you want to build the Docker image yourself:

```bash
# Clone the repository
git clone https://github.com/yourusername/NevuEmaiLSender.git
cd NevuEmaiLSender

# Build the Docker image
docker build -t nevuemailsender .

# Run the container
docker run -d \
  --name nevuemailsender \
  -p 3000:3000 \
  -e JWT_SECRET=your-super-secret-jwt-key \
  -v nevuemailsender_data:/app/data \
  nevuemailsender
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `3000` | No |
| `NODE_ENV` | Environment | `production` | No |
| `DATABASE_URL` | Database connection string | `file:./data/database.db` | No |
| `JWT_SECRET` | JWT signing secret | - | **Yes** |

### SMTP Configuration

Configure your SMTP settings through the web interface or environment variables:

- **Gmail**: Use App Passwords for authentication
- **Outlook**: Use your regular credentials or App Passwords
- **Custom SMTP**: Any SMTP server (port 587 with STARTTLS or port 465 with SSL)

### Database

The application uses SQLite by default, which is perfect for single-instance deployments. The database file is stored in `/data/database.db` inside the container and is persisted using Docker volumes.

For PostgreSQL support, update the `DATABASE_URL` environment variable:
```
DATABASE_URL=postgresql://username:password@host:5432/database
```

## 🔧 API Endpoints

The application provides a RESTful API:

- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/templates` - List email templates
- `POST /api/templates` - Create new template
- `GET /api/email-lists` - List contact lists
- `POST /api/emails/send` - Send individual email
- `POST /api/emails/bulk` - Send bulk emails
- `GET /api/config` - Get configuration
- `PUT /api/config/smtp` - Update SMTP settings
- `PUT /api/config/identity` - Update email identity

## 🚀 Deployment

### Docker Compose (Production)

1. **Create a docker-compose.yml file**:
   ```yaml
   version: '3.8'
   services:
     app:
       image: ghcr.io/yourusername/nevuemailsender:latest
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - JWT_SECRET=your-super-secret-jwt-key-change-this
         - DATABASE_URL=file:./data/database.db
       volumes:
         - app_data:/data
       restart: unless-stopped
   
   volumes:
     app_data:
   ```

2. **Deploy**:
   ```bash
   docker-compose up -d
   ```

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set environment variables**:
   ```bash
   export JWT_SECRET=your-super-secret-jwt-key
   export DATABASE_URL=file:./data/database.db
   ```

3. **Initialize database**:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

4. **Start the application**:
   ```bash
   npm start
   ```

## 🔒 Security

- **Authentication**: JWT-based authentication system
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: API rate limiting to prevent abuse
- **Helmet**: Security headers for production
- **CORS**: Configurable CORS settings
- **Environment Secrets**: Sensitive data via environment variables

## 🐛 Troubleshooting

### Common Issues

1. **Database permissions**: Ensure the container has write access to the data volume
2. **JWT Secret**: Make sure to set a secure JWT_SECRET environment variable
3. **SMTP Authentication**: Use App Passwords for Gmail/Outlook
4. **Port conflicts**: Change the host port if 3000 is already in use

### Logs

View application logs:
```bash
# Docker Compose
docker-compose logs -f

# Docker run
docker logs -f nevuemailsender
```

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Happy emailing! 📧✨**

3. **Configure SMTP settings** in `config/smtp.json`:
   ```json
   {
     "host": "smtp.gmail.com",
     "port": 587,
     "secure": false,
     "auth": {
       "user": "your-email@gmail.com",
       "pass": "your-app-password"
     }
   }
   ```

4. **Configure email identity** in `config/identity.json`:
   ```json
   {
     "from": {
       "name": "Your Name",
       "email": "your-email@gmail.com"
     },
     "replyTo": "your-email@gmail.com",
     "signature": "\\n\\nBest regards,\\nYour Name"
   }
   ```

5. **Start the application**:
   ```bash
   # Development mode (auto-restart on changes)
   npm run dev
   
   # Or build and run in production
   npm run build
   npm start
   ```

6. **Open your browser** and navigate to: http://localhost:3000

## 🛠️ Development

### Project Structure
```
├── src/
│   └── index.ts          # Main server file
├── public/
│   └── index.html        # Web interface
├── config/
│   ├── smtp.json         # SMTP configuration
│   ├── identity.json     # Email identity
│   └── templates.json    # Email templates (auto-created)
├── dist/                 # Compiled TypeScript (auto-generated)
└── package.json
```

### Available Scripts
- `npm run dev` - Start development server with auto-restart
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run the compiled application
- `npm run clean` - Remove compiled files

**Built with ❤️ using TypeScript, Node.js, Express, and Nodemailer**