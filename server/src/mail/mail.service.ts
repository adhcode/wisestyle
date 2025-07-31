import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
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
  private useSendGrid: boolean;
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    const sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
            this.fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'hello@wisestyleshop.com';

    if (sendGridApiKey) {
      try {
        // Prefer SendGrid if API key is provided
        sgMail.setApiKey(sendGridApiKey);
        this.useSendGrid = true;
        this.logger.log('SendGrid integration enabled for MailService');
      } catch (error) {
        this.logger.error('Failed to initialize SendGrid:', error);
        this.useSendGrid = false;
        this.initializeSMTPTransporter();
      }
    } else {
      this.useSendGrid = false;
      this.initializeSMTPTransporter();
    }
  }

  private initializeSMTPTransporter() {
    try {
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
    } catch (error) {
      this.logger.error('Failed to initialize SMTP transporter:', error);
      this.transporter = null;
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
    try {
      if (this.useSendGrid) {
        const msg = {
          to,
          from: {
            email: this.fromEmail,
            name: 'WiseStyle'
          },
          subject,
          html,
          text: htmlToText(html),
          headers: {
            'List-Unsubscribe': '<mailto:hello@wisestyleshop.com>',
            'X-Mailer': 'WiseStyle Email Service',
            'X-Priority': '3',
            'X-MSMail-Priority': 'Normal',
            'Importance': 'Normal',
            'X-Campaign': 'order-confirmation',
            'X-Report-Abuse': 'Please report abuse here: hello@wisestyleshop.com'
          },
          categories: ['order-confirmation'],
          customArgs: {
            email_type: 'order_confirmation',
            user_type: 'customer'
          }
        } as any;
        const [response] = await sgMail.send(msg);
        this.logger.log(`SendGrid email sent to ${to}, status: ${response.statusCode}`);
        return response;
      } else {
        if (!this.transporter) {
          this.logger.warn(`Email service not configured - skipping email to ${to}`);
          return { messageId: 'skipped', status: 'no-transport' };
        }
        const mailOptions = {
          from: `"WiseStyle" <${this.fromEmail}>`,
          to,
          subject,
          html,
          text: htmlToText(html),
          headers: {
            'List-Unsubscribe': '<mailto:unsubscribe@wisestyle.com>',
            'X-Mailer': 'WiseStyle Email Service',
            'X-Priority': '3',
            'X-MSMail-Priority': 'Normal',
            'Importance': 'Normal',
            'X-Campaign': 'order-confirmation',
            'X-Report-Abuse': 'Please report abuse here: abuse@wisestyle.com'
          },
          priority: 'normal' as const,
          encoding: 'utf-8'
        };
        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(`SMTP email sent to ${to}, messageId: ${info.messageId}`);
        return info;
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      // Don't throw the error to prevent application crashes
      return { error: error.message, status: 'failed' };
    }
  }
}