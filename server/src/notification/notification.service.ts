import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import SendGrid from '@sendgrid/mail';

@Injectable()
export class NotificationService {
    private readonly logger = new Logger(NotificationService.name);
    private sendgridEnabled: boolean;

    constructor(private configService: ConfigService) {
        const sendgridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
        this.sendgridEnabled = !!sendgridApiKey;
        
        if (this.sendgridEnabled) {
            try {
                SendGrid.setApiKey(sendgridApiKey);
                this.logger.log('SendGrid initialized for notifications');
            } catch (error) {
                this.logger.error('Failed to initialize SendGrid for notifications:', error);
                this.sendgridEnabled = false;
            }
        } else {
            this.logger.warn('SendGrid API key is not configured. Email notifications will be disabled.');
        }
    }

    async sendPaymentNotification(
        email: string,
        type: 'payment_success' | 'payment_failed' | 'refund_processed',
        data: any
    ) {
        try {
            if (!this.sendgridEnabled) {
                this.logger.log(`Email notification skipped (SendGrid disabled): ${type} to ${email}`);
                return true;
            }

            const templates = {
                payment_success: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                payment_failed: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                refund_processed: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            };

            const templateId = templates[type];
            if (!templateId) {
                throw new Error(`Template not found for notification type: ${type}`);
            }

            const msg = {
                to: email,
                from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'hello@wisestyleshop.com',
                templateId,
                dynamicTemplateData: {
                    ...data,
                    type
                }
            };

            await SendGrid.send(msg);
            this.logger.log(`Payment notification sent to ${email}`);
            return true;
        } catch (error) {
            this.logger.error('Failed to send payment notification:', error);
            // Don't throw to prevent application crashes
            return false;
        }
    }

    async sendOrderNotification(
        email: string,
        type: 'order_confirmed' | 'order_shipped' | 'order_delivered',
        data: any
    ) {
        try {
            if (!this.sendgridEnabled) {
                this.logger.log(`Email notification skipped (SendGrid disabled): ${type} to ${email}`);
                return true;
            }

            const templates = {
                order_confirmed: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                order_shipped: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
                order_delivered: 'd-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
            };

            const templateId = templates[type];
            if (!templateId) {
                throw new Error(`Template not found for notification type: ${type}`);
            }

            const msg = {
                to: email,
                from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'hello@wisestyleshop.com',
                templateId,
                dynamicTemplateData: {
                    ...data,
                    type
                }
            };

            await SendGrid.send(msg);
            this.logger.log(`Order notification sent to ${email}`);
            return true;
        } catch (error) {
            this.logger.error('Failed to send order notification:', error);
            // Don't throw to prevent application crashes
            return false;
        }
    }
} 