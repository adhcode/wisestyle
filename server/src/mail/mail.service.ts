import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { welcomeEmailTemplate } from './templates/welcome';
import { passwordResetTemplate } from './templates/password-reset';
import { verifyEmailTemplate } from './templates/verify-email';
import { orderConfirmationTemplate } from './templates/order-confirmation';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'sandbox.smtp.mailtrap.io',
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
      }
    });
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

  private async sendMail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: '"WiseStyle" <noreply@wisestyle.com>',
      to,
      subject,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }
}