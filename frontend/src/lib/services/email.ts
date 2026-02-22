/**
 * Email Service - Email marketing and transactional email management
 */

// Email template types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  text: string;
  variables: string[];
  category: 'transactional' | 'marketing' | 'notification';
}

export interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, string>;
}

export interface EmailRequest {
  templateId: string;
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  from?: {
    email: string;
    name: string;
  };
  subject?: string;
  variables?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: string; // base64 encoded
    type: string;
  }>;
  tags?: string[];
}

export interface EmailResponse {
  id: string;
  status: 'sent' | 'delivered' | 'bounced' | 'failed';
  message?: string;
}

export interface EmailProvider {
  sendEmail(request: EmailRequest): Promise<EmailResponse>;
  getTemplates(): Promise<EmailTemplate[]>;
  getTemplate(templateId: string): Promise<EmailTemplate>;
  createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate>;
  updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate>;
  deleteTemplate(templateId: string): Promise<void>;
}

// SendGrid Email Provider
class SendGridProvider implements EmailProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY!;
    if (!this.apiKey) {
      throw new Error('SendGrid API key not configured');
    }
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: request.to.map(recipient => ({
              email: recipient.email,
              name: recipient.name,
            })),
            cc: request.cc?.map(recipient => ({
              email: recipient.email,
              name: recipient.name,
            })),
            bcc: request.bcc?.map(recipient => ({
              email: recipient.email,
              name: recipient.name,
            })),
            dynamic_template_data: {
              ...request.variables,
              ...request.to[0]?.variables, // Merge recipient-specific variables
            },
          },
        ],
        from: request.from || {
          email: 'noreply@shophub.com',
          name: 'ShopHub',
        },
        subject: request.subject,
        template_id: request.templateId,
        attachments: request.attachments?.map(attachment => ({
          content: attachment.content,
          filename: attachment.filename,
          type: attachment.type,
        })),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SendGrid error: ${error}`);
    }

    // Extract SendGrid message ID from headers
    const messageId = response.headers.get('x-message-id') || '';

    return {
      id: messageId,
      status: 'sent',
    };
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    const response = await fetch('https://api.sendgrid.com/v3/templates?generations=dynamic', {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    const data = await response.json();
    return data.templates.map((template: any) => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      html: template.html_content,
      text: template.plain_content,
      variables: [], // Would need to parse from template
      category: 'transactional', // Default
    }));
  }

  async getTemplate(templateId: string): Promise<EmailTemplate> {
    const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    const data = await response.json();
    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      html: data.html_content,
      text: data.plain_content,
      variables: this.extractVariables(data.html_content),
      category: 'transactional',
    };
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const response = await fetch('https://api.sendgrid.com/v3/templates', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: template.name,
        generation: 'dynamic',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create template');
    }

    const data = await response.json();
    return {
      ...template,
      id: data.id,
    };
  }

  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: updates.name,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update template');
    }

    const existing = await this.getTemplate(templateId);
    return {
      ...existing,
      ...updates,
    };
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const response = await fetch(`https://api.sendgrid.com/v3/templates/${templateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete template');
    }
  }

  private extractVariables(html: string): string[] {
    // Extract variables like {{variable_name}} from template
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = html.match(regex) || [];
    return matches.map(match => match.replace(/\{\{|\}\}/g, ''));
  }
}

// SMTP Email Provider (for custom SMTP servers)
class SMTPProvider implements EmailProvider {
  private config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    };
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    // In a real implementation, you'd use nodemailer or similar
    // This is a simplified version that sends via API endpoint

    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        provider: 'smtp',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    const data = await response.json();
    return {
      id: data.id,
      status: data.status,
    };
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    // SMTP provider typically doesn't have template management
    return [];
  }

  async getTemplate(templateId: string): Promise<EmailTemplate> {
    throw new Error('Template management not supported for SMTP provider');
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    throw new Error('Template creation not supported for SMTP provider');
  }

  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    throw new Error('Template updates not supported for SMTP provider');
  }

  async deleteTemplate(templateId: string): Promise<void> {
    throw new Error('Template deletion not supported for SMTP provider');
  }
}

// Resend.com Email Provider
class ResendProvider implements EmailProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY!;
    if (!this.apiKey) {
      throw new Error('Resend API key not configured');
    }
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: request.from?.email || 'noreply@shophub.com',
        to: request.to.map(r => r.email),
        subject: request.subject,
        html: request.variables ? this.replaceVariables(request.templateId, request.variables) : '',
        tags: request.tags,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send email');
    }

    const data = await response.json();
    return {
      id: data.id,
      status: 'sent',
    };
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    // Resend doesn't have template management in the same way
    return [];
  }

  async getTemplate(templateId: string): Promise<EmailTemplate> {
    throw new Error('Template management not supported for Resend provider');
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    throw new Error('Template creation not supported for Resend provider');
  }

  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    throw new Error('Template updates not supported for Resend provider');
  }

  async deleteTemplate(templateId: string): Promise<void> {
    throw new Error('Template deletion not supported for Resend provider');
  }

  private replaceVariables(templateId: string, variables: Record<string, string>): string {
    // Simple variable replacement
    // In a real implementation, you'd fetch the template and replace variables
    let html = `<h1>Default Template for ${templateId}</h1>`;

    Object.entries(variables).forEach(([key, value]) => {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });

    return html;
  }
}

// Main Email Service
class EmailService {
  private providers: Map<string, EmailProvider> = new Map();
  private currentProvider: string = 'sendgrid';

  constructor() {
    // Initialize providers based on environment
    if (process.env.SENDGRID_API_KEY) {
      this.providers.set('sendgrid', new SendGridProvider());
    }

    if (process.env.SMTP_HOST) {
      this.providers.set('smtp', new SMTPProvider());
    }

    if (process.env.RESEND_API_KEY) {
      this.providers.set('resend', new ResendProvider());
    }
  }

  setProvider(provider: string): void {
    if (!this.providers.has(provider)) {
      throw new Error(`Email provider ${provider} not configured`);
    }
    this.currentProvider = provider;
  }

  getProvider(): EmailProvider {
    const provider = this.providers.get(this.currentProvider);
    if (!provider) {
      throw new Error('No email provider configured');
    }
    return provider;
  }

  async sendEmail(request: EmailRequest): Promise<EmailResponse> {
    const provider = this.getProvider();
    return provider.sendEmail(request);
  }

  async getTemplates(): Promise<EmailTemplate[]> {
    const provider = this.getProvider();
    return provider.getTemplates();
  }

  async getTemplate(templateId: string): Promise<EmailTemplate> {
    const provider = this.getProvider();
    return provider.getTemplate(templateId);
  }

  async createTemplate(template: Omit<EmailTemplate, 'id'>): Promise<EmailTemplate> {
    const provider = this.getProvider();
    return provider.createTemplate(template);
  }

  async updateTemplate(templateId: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const provider = this.getProvider();
    return provider.updateTemplate(templateId, updates);
  }

  async deleteTemplate(templateId: string): Promise<void> {
    const provider = this.getProvider();
    return provider.deleteTemplate(templateId);
  }

  // Predefined email templates and helper methods
  async sendWelcomeEmail(to: EmailRecipient, name: string): Promise<EmailResponse> {
    return this.sendEmail({
      templateId: 'welcome-email',
      to: [to],
      variables: {
        name,
        welcome_message: 'Welcome to ShopHub! We\'re excited to have you onboard.',
      },
    });
  }

  async sendOrderConfirmation(to: EmailRecipient, order: any): Promise<EmailResponse> {
    return this.sendEmail({
      templateId: 'order-confirmation',
      to: [to],
      variables: {
        order_number: order.id,
        order_date: new Date(order.createdAt).toLocaleDateString(),
        total_amount: `$${order.total.toFixed(2)}`,
        shipping_address: `${order.shippingAddress.street}, ${order.shippingAddress.city}`,
        items: order.items.map((item: any) =>
          `${item.quantity}x ${item.productName} - $${item.price.toFixed(2)}`
        ).join('\n'),
      },
    });
  }

  async sendPasswordReset(to: EmailRecipient, resetLink: string): Promise<EmailResponse> {
    return this.sendEmail({
      templateId: 'password-reset',
      to: [to],
      variables: {
        reset_link: resetLink,
        expiry_time: '1 hour',
      },
    });
  }

  async sendNewsletter(recipients: EmailRecipient[], subject: string, content: string): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];

    // Batch send to avoid rate limits
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail({
          templateId: 'newsletter',
          to: [recipient],
          subject,
          variables: {
            content,
            unsubscribe_link: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${recipient.email}`,
          },
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to send newsletter to ${recipient.email}:`, error);
        results.push({
          id: '',
          status: 'failed',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }
}

// Export singleton instance
export const emailService = new EmailService();

// React hook for email operations
export const useEmail = () => {
  return {
    sendEmail: emailService.sendEmail.bind(emailService),
    getTemplates: emailService.getTemplates.bind(emailService),
    getTemplate: emailService.getTemplate.bind(emailService),
    createTemplate: emailService.createTemplate.bind(emailService),
    updateTemplate: emailService.updateTemplate.bind(emailService),
    deleteTemplate: emailService.deleteTemplate.bind(emailService),
    setProvider: emailService.setProvider.bind(emailService),
    sendWelcomeEmail: emailService.sendWelcomeEmail.bind(emailService),
    sendOrderConfirmation: emailService.sendOrderConfirmation.bind(emailService),
    sendPasswordReset: emailService.sendPasswordReset.bind(emailService),
    sendNewsletter: emailService.sendNewsletter.bind(emailService),
  };
};

export default emailService;
