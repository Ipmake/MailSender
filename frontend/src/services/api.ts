import {
  SMTPConfig,
  EmailIdentity,
  EmailRequest,
  BulkEmailRequest,
  EmailTemplate,
  Configuration,
  ApiResponse,
  BulkEmailResult,
  EmailList,
  EmailListRequest
} from '../types';
import { authService } from './auth';

const API_BASE = '/api';

class ApiService {
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authService.getAuthHeaders(),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, logout user
        authService.logout();
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Configuration
  async getConfiguration(): Promise<Configuration> {
    return this.fetchApi<Configuration>('/config');
  }

  async updateSMTPConfig(config: SMTPConfig): Promise<ApiResponse> {
    return this.fetchApi<ApiResponse>('/config/smtp', {
      method: 'POST',
      body: JSON.stringify({
        host: config.host,
        port: config.port,
        secure: config.secure,
        username: config.auth.user,
        password: config.auth.pass,
      }),
    });
  }

  async updateEmailIdentity(identity: EmailIdentity): Promise<ApiResponse> {
    return this.fetchApi<ApiResponse>('/config/identity', {
      method: 'POST',
      body: JSON.stringify({
        name: identity.from.name,
        email: identity.from.email,
        replyTo: identity.replyTo,
        signature: identity.signature,
      }),
    });
  }

  // Email sending
  async sendEmail(emailData: EmailRequest): Promise<ApiResponse<{ messageId: string }>> {
    return this.fetchApi<ApiResponse<{ messageId: string }>>('/emails/send', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  async sendBulkEmail(emailData: BulkEmailRequest): Promise<ApiResponse<{ results: BulkEmailResult[] }>> {
    return this.fetchApi<ApiResponse<{ results: BulkEmailResult[] }>>('/emails/send-bulk', {
      method: 'POST',
      body: JSON.stringify(emailData),
    });
  }

  // Templates
  async getTemplates(): Promise<EmailTemplate[]> {
    return this.fetchApi<EmailTemplate[]>('/templates');
  }

  async saveTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt'>): Promise<ApiResponse<{ template: EmailTemplate }>> {
    return this.fetchApi<ApiResponse<{ template: EmailTemplate }>>('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    });
  }

  async createTemplate(template: Omit<EmailTemplate, 'id' | 'createdAt'>): Promise<ApiResponse<{ template: EmailTemplate }>> {
    return this.saveTemplate(template);
  }

  async updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<ApiResponse<{ template: EmailTemplate }>> {
    return this.fetchApi<ApiResponse<{ template: EmailTemplate }>>(`/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(template),
    });
  }

  async deleteTemplate(templateId: string): Promise<ApiResponse> {
    return this.fetchApi<ApiResponse>(`/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  // Email Lists API
  async getEmailLists(): Promise<EmailList[]> {
    return this.fetchApi<EmailList[]>('/email-lists');
  }

  async createEmailList(data: EmailListRequest): Promise<any> {
    return this.fetchApi<any>('/email-lists', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmailList(id: string, data: EmailListRequest): Promise<any> {
    return this.fetchApi<any>(`/email-lists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmailList(id: string): Promise<any> {
    return this.fetchApi<any>(`/email-lists/${id}`, {
      method: 'DELETE',
    });
  }

  async testConnection(): Promise<any> {
    return this.fetchApi<any>('/emails/test-connection', {
      method: 'POST',
    });
  }

  // User Management (Admin only)
  async getUsers(): Promise<any[]> {
    return this.fetchApi<any[]>('/users');
  }

  async createUser(userData: {
    username: string;
    password: string;
    name: string;
    role: string;
  }): Promise<any> {
    return this.fetchApi<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: {
    username: string;
    name: string;
    role: string;
  }): Promise<any> {
    return this.fetchApi<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<any> {
    return this.fetchApi<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async resetUserPassword(id: string, password: string): Promise<any> {
    return this.fetchApi<any>(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // Password Change (for current user)
  async changePassword(currentPassword: string, newPassword: string): Promise<any> {
    return this.fetchApi<any>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getCurrentUser(): Promise<any> {
    return this.fetchApi<any>('/auth/me');
  }
}

export const apiService = new ApiService();
