// Authentication types
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

// SMTP Configuration
export interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface EmailIdentity {
  from: {
    name: string;
    email: string;
  };
  replyTo: string;
  signature: string;
}

export interface EmailRequest {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface BulkEmailRequest {
  recipients: string[];
  subject: string;
  text: string;
  html: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  text: string;
  html: string;
  createdAt: string;
}

export interface EmailStats {
  totalSent: number;
  totalTemplates: number;
  successRate: number;
}

export interface BulkEmailResult {
  email: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  details?: string;
  data?: T;
}

export interface Configuration {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
  } | null;
  identity: EmailIdentity | null;
}

export interface EmailList {
  id: string;
  name: string;
  description: string;
  emails: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailListRequest {
  name: string;
  description: string;
  emails: string[];
}
