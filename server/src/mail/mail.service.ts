import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as sgMail from '@sendgrid/mail';
import { welcomeEmailTemplate } from './templates/welcome';
import { passwordResetTemplate } from './templates/password-reset';
import { verifyEmailTemplate } from './templates/verify-email';
import { orderConfirmationTemplate } from './templates/order-confirmation';
import { orderShippedTemplate } from './templates/order-shipped';
import { orderDeliveredTemplate } from './templates/order-delivered';
import { htmlToText } from 'html-to-text';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly useSendGrid: boolean;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@wisestyle.com';

    if (sendGridApiKey) {
      // Prefer SendGrid if API key is provided
      sgMail.setApiKey(sendGridApiKey);
      this.useSendGrid = true;
      this.logger.log('SendGrid integration enabled for MailService');
    } else {
      this.useSendGrid = false;
      // Fallback to Mailtrap SMTP (development)
      this.transporter = nodemailer.createTransport({
        host: this.configService.get<string>('MAIL_HOST') || 'sandbox.smtp.mailtrap.io',
        port: Number(this.configService.get<string>('MAIL_PORT')) || 2525,
        auth: {
          user: this.configService.get<string>('MAIL_USER') || this.configService.get<string>('MAILTRAP_USER'),
          pass: this.configService.get<string>('MAIL_PASS') || this.configService.get<string>('MAILTRAP_PASS'),
        },
      });
      this.logger.warn('SendGrid API key not found – falling back to SMTP transport');
    }
  }

  async sendVerificationEmail(email: string, verificationLink: string) {
    return this.sendMail(
      email,
      'Verify Your WiseStyle Email',
      verifyEmailTemplate(verificationLink)
    );
  }

  async sendWelcomeEmail(email: string, firstName: string) {
    return this.sendMail(
      email,
      'Welcome to WiseStyle!',
      welcomeEmailTemplate(firstName)
    );
  }

  async sendPasswordResetEmail(email: string, resetLink: string) {
    return this.sendMail(
      email,
      'Reset Your WiseStyle Password',
      passwordResetTemplate(resetLink)
    );
  }

  async sendOrderConfirmationEmail(email: string, order: any) {
    return this.sendMail(
      email,
      `Order Confirmation #${order.id}`,
      orderConfirmationTemplate(order)
    );
  }

  async sendOrderShippedEmail(email: string, order: any) {
    return this.sendMail(
      email,
      `Your Order #${order.id} Has Shipped`,
      orderShippedTemplate(order)
    );
  }

  async sendOrderDeliveredEmail(email: string, order: any) {
    return this.sendMail(
      email,
      `Your Order #${order.id} Has Been Delivered`,
      orderDeliveredTemplate(order)
    );
  }

  private async sendMail(to: string, subject: string, html: string) {
    if (this.useSendGrid) {
      try {
        const msg = {
          to,
          from: this.fromEmail,
          subject,
          html,
          text: htmlToText(html),
          headers: {
            'List-Unsubscribe': '<mailto:unsubscribe@wisestyleshop.com>'
          },
        } as any;
        const [response] = await sgMail.send(msg);
        console.log('SendGrid email sent', response.statusCode);
        return response;
      } catch (error) {
        console.error('Error sending email via SendGrid:', error);
        throw error;
      }
    } else {
      if (!this.transporter) {
        throw new Error('SMTP transporter not configured');
      }
      const mailOptions = {
        from: `"WiseStyle" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: htmlToText(html),
        headers: {
          'List-Unsubscribe': '<mailto:unsubscribe@wisestyleshop.com>'
        },
      };
      try {
        const info = await this.transporter.sendMail(mailOptions);
        console.log('SMTP email sent:', info.messageId);
        return info;
      } catch (error) {
        console.error('Error sending email via SMTP:', error);
        throw error;
      }
    }
  }
}