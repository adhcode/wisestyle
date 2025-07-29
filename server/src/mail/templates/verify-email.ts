import { baseEmailTemplate } from './base';

export const verifyEmailTemplate = (verificationLink: string) => {
  const content = `
    <h1>Welcome to WiseStyle!</h1>
    <p>Thank you for joining our community of fashion enthusiasts. We're excited to have you on board!</p>
    
    <p>To complete your registration and start exploring our latest collections, please verify your email address by clicking the button below:</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${verificationLink}" class="button">Verify My Email Address</a>
    </div>
    
    <div class="alert alert-info">
      <strong>Security Notice:</strong> This verification link will expire in 24 hours for your security. If you didn't create an account with WiseStyle, you can safely ignore this email.
    </div>
    
    <p>Once verified, you'll be able to:</p>
    <ul>
      <li>Browse our curated fashion collections</li>
      <li>Save your favorite items to your wishlist</li>
      <li>Enjoy personalized recommendations</li>
      <li>Get exclusive access to sales and new arrivals</li>
    </ul>
    
    <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6c757d; font-size: 14px; background-color: #f8f9fa; padding: 12px; border-radius: 4px;">${verificationLink}</p>
  `;
  
  return baseEmailTemplate(content, 'Verify Your WiseStyle Email');
}; 