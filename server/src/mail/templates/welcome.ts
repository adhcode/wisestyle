import { baseEmailTemplate } from './base';

export const welcomeEmailTemplate = (firstName: string) => {
  const content = `
    <h1>Welcome to WiseStyle, ${firstName || 'there'}! 🎉</h1>
    <p>Congratulations! Your email has been successfully verified and your account is now active.</p>
    
    <p>We're thrilled to have you join our community of fashion enthusiasts. At WiseStyle, we're committed to bringing you the latest trends, timeless classics, and exceptional quality at unbeatable prices.</p>
    
    <div class="alert alert-success">
      <strong>Your account is ready!</strong> You can now log in and start exploring everything WiseStyle has to offer.
    </div>
    
    <h2>What's Next?</h2>
    <p>Here's what you can do now:</p>
    <ul>
      <li><strong>Browse Collections:</strong> Discover our curated fashion collections</li>
      <li><strong>Create Wishlist:</strong> Save your favorite items for later</li>
      <li><strong>Get Personalized:</strong> Receive recommendations based on your style</li>
      <li><strong>Exclusive Access:</strong> Be first to know about sales and new arrivals</li>
    </ul>
    
    <div style="text-align: center; margin: 32px 0;">
      <a href="${process.env.FRONTEND_URL || 'https://wisestyleshop.com'}" class="button">Start Shopping Now</a>
    </div>
    
    <div class="divider"></div>
    
    <h2>Need Help?</h2>
    <p>Our customer support team is here to help you with any questions. Feel free to reach out to us at <a href="mailto:hello@wisestyleshop.com">hello@wisestyleshop.com</a>.</p>
    
    <p>Happy shopping!</p>
    <p><strong>The WiseStyle Team</strong></p>
  `;
  
  return baseEmailTemplate(content, 'Welcome to WiseStyle!');
}; 