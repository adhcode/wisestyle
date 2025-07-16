export const orderDeliveredTemplate = (order: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Order Delivered - WiseStyle</title>
  <style>
    /* Reset styles for email clients */
    body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    
    /* Base styles */
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f8f9fa;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #17a2b8 0%, #20c997 100%);
      color: white;
      text-align: center;
      padding: 40px 20px;
    }
    
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
    }
    
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    
    .content {
      padding: 40px 30px;
    }
    
    .order-info {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
      border-left: 4px solid #17a2b8;
    }
    
    .order-number {
      font-size: 24px;
      font-weight: 600;
      color: #3B2305;
      margin-bottom: 15px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 600;
      color: #3B2305;
      margin: 30px 0 20px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .items-container {
      margin-bottom: 30px;
    }
    
    .item {
      display: flex;
      align-items: center;
      padding: 20px;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      margin-bottom: 15px;
      background-color: #ffffff;
    }
    
    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      object-fit: cover;
      margin-right: 20px;
      border: 1px solid #e9ecef;
    }
    
    .item-details {
      flex: 1;
    }
    
    .item-name {
      font-weight: 600;
      color: #3B2305;
      font-size: 16px;
      margin: 0 0 8px 0;
    }
    
    .item-meta {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    
    .review-cta {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-radius: 8px;
      padding: 30px;
      margin-top: 30px;
      text-align: center;
      border: 2px solid #2196f3;
    }
    
    .review-cta h3 {
      color: #1976d2;
      margin: 0 0 15px 0;
      font-size: 22px;
    }
    
    .review-cta p {
      color: #1565c0;
      margin: 0 0 10px 0;
      font-size: 16px;
    }
    
    .review-cta .highlight {
      color: #3B2305;
      font-weight: 600;
    }
    
    .footer {
      background-color: #3B2305;
      color: white;
      text-align: center;
      padding: 30px 20px;
    }
    
    .footer-content {
      max-width: 400px;
      margin: 0 auto;
    }
    
    .footer h3 {
      margin: 0 0 15px 0;
      font-size: 18px;
    }
    
    .footer p {
      margin: 0 0 10px 0;
      font-size: 14px;
      opacity: 0.9;
    }
    
    .footer a {
      color: #C97203;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    .copyright {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      font-size: 12px;
      opacity: 0.7;
    }
    
    /* Responsive design */
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }
      
      .content {
        padding: 20px 15px !important;
      }
      
      .header {
        padding: 30px 15px !important;
      }
      
      .header h1 {
        font-size: 24px !important;
      }
      
      .item {
        flex-direction: column !important;
        text-align: center !important;
      }
      
      .item-image {
        margin-right: 0 !important;
        margin-bottom: 15px !important;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <!-- Header -->
    <div class="header">
      <h1>🎉 Your Order Has Been Delivered!</h1>
      <p>Great news! Order #${order.id} was successfully delivered to your address.</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Order Information -->
      <div class="order-info">
        <div class="order-number">Order #${order.id}</div>
        <p style="margin: 0; color: #17a2b8; font-weight: 600;">✅ Delivered on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
      
      <!-- Delivered Items -->
      <h2 class="section-title">📦 Delivered Items</h2>
      <div class="items-container">
        ${order.items.map(item => `
          <div class="item">
            <img 
              src="${item.product.image || (item.product.images && item.product.images.length > 0 ? item.product.images[0].url : '') || 'https://via.placeholder.com/80x80?text=Product'}" 
              alt="${item.product.name}" 
              class="item-image"
              onerror="this.src='https://via.placeholder.com/80x80?text=Product'"
            />
            <div class="item-details">
              <div class="item-name">${item.product.name}</div>
              <div class="item-meta">
                Quantity: ${item.quantity}
                ${item.color ? ` • Color: ${item.color}` : ''}
                ${item.size ? ` • Size: ${item.size}` : ''}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      
      <!-- Review CTA -->
      <div class="review-cta">
        <h3>⭐ How was your experience?</h3>
        <p>We'd love to hear your feedback about your purchase and delivery experience!</p>
        <p class="highlight">Thank you for shopping with WiseStyle. We hope you love your new items!</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
        <h3>Need Help?</h3>
        <p>If you have any questions about your order or need assistance, our customer support team is here to help.</p>
        <p>📧 <a href="mailto:hello@wisestyleshop.com">hello@wisestyleshop.com</a></p>
        <p>📞 <a href="tel:+2348148331000">+234 814 833 1000</a></p>
        <div class="copyright">
          © ${new Date().getFullYear()} WiseStyle. All rights reserved.<br>
          This email was sent to ${order.email} because you placed an order with WiseStyle.
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`; 