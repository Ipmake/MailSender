import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import middleware
import { requestLogger, errorHandler } from './middleware/logger';
import { apiRateLimit } from './middleware/rateLimiter';

// Import routes
import authRoutes from './routes/api/auth';
import emailListsRoutes from './routes/api/email-lists';
import templatesRoutes from './routes/api/templates';
import emailsRoutes from './routes/api/emails';
import configRoutes from './routes/api/config';
import usersRoutes from './routes/api/users';

class EmailSenderServer {
  private app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: false, // Disable for React app
      crossOriginEmbedderPolicy: false
    }));
    
    // CORS
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL || 'http://localhost:3000'
        : ['http://localhost:3000', 'http://localhost:5173'],
      credentials: true
    }));

    // Request parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    this.app.use(requestLogger);

    // Serve static files (React build)
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  private setupRoutes(): void {
    // API routes with rate limiting
    this.app.use('/api', apiRateLimit);
    
    // File system based routing
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/email-lists', emailListsRoutes);
    this.app.use('/api/templates', templatesRoutes);
    this.app.use('/api/emails', emailsRoutes);
    this.app.use('/api/config', configRoutes);
    this.app.use('/api/users', usersRoutes);

    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // Catch-all handler for React routing
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../public/index.html'));
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log(`🚀 Email Sender Server running on http://localhost:${this.port}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📧 API endpoints available at http://localhost:${this.port}/api`);
      
      if (process.env.NODE_ENV !== 'production') {
        console.log(`🔧 API Health Check: http://localhost:${this.port}/api/health`);
      }
    });
  }
}

// Start the server
const server = new EmailSenderServer();
server.start();

export default EmailSenderServer;
