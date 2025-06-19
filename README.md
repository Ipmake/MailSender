# Nevu Email Sender Pro

A modern, feature-rich TypeScript Node.js email sender application with a beautiful web interface. Send individual emails, bulk emails, manage templates, and configure SMTP settings all from a sleek web dashboard.

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
- **Persistent Settings**: All configurations are saved in JSON files
- **Easy Editing**: Update settings through the web interface

### 📊 Analytics & Tracking
- **Email Statistics**: Track total emails sent and success rates
- **Template Analytics**: Monitor template usage and creation
- **Activity Logging**: View recent activity and performance metrics
- **Local Storage**: Statistics persist between sessions

### 🎨 Modern Interface
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Dark Theme Header**: Beautiful gradient header with enhanced visibility
- **Intuitive Navigation**: Tab-based interface for easy feature access
- **Real-time Feedback**: Live status updates and progress indicators
- **Smooth Animations**: Polished transitions and hover effects

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- SMTP server credentials (Gmail, Outlook, etc.)

### Installation

1. **Clone or download** this project
2. **Install dependencies**:
   ```bash
   npm install
   ```

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