import { baseEmailTemplate } from './base';

export const passwordResetTemplate = (resetLink: string) => {
  const content = `
    <h1>Reset Your Password</h1>
    <p>We received a request to reset the password for your WiseStyle account. If this was you, click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${resetLink}" class="button">Reset My Password</a>
    </div>
    
    <div class="alert alert-warning">
      <strong>Security Notice:</strong>
      <ul style="margin: 8px 0 0 0; padding-left: 20px;">
        <li>This link will expire in 1 hour for your security</li>
        <li>You can only use this link once</li>
        <li>If you didn't request this reset, you can safely ignore this email</li>
      </ul>
    </div>
    
    <h2>Didn't Request This?</h2>
    <p>If you didn't request a password reset, your account is still secure. You can safely ignore this email, or contact our support team if you have any concerns.</p>
    
    <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
    <p style="word-break: break-all; color: #6c757d; font-size: 14px; background-color: #f8f9fa; padding: 12px; border-radius: 4px;">${resetLink}</p>
    
    <div class="divider"></div>
    
    <p>For your security, we recommend:</p>
    <ul>
      <li>Using a strong, unique password</li>
      <li>Not sharing your password with anyone</li>
      <li>Logging out of shared devices</li>
    </ul>
    
    <p>Need help? Contact us at <a href="mailto:hello@wisestyleshop.com">hello@wisestyleshop.com</a></p>
  `;
  
  return baseEmailTemplate(content, 'Reset Your WiseStyle Password');
}; 