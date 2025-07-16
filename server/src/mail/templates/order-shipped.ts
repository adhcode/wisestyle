export const orderShippedTemplate = (order: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Order Has Shipped - WiseStyle</title>
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
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
      border-left: 4px solid #28a745;
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
    
    .address-box {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    
    .address-content {
      line-height: 1.8;
      color: #555;
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
    
    .delivery-info {
      background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%);
      border-radius: 8px;
      padding: 25px;
      margin-top: 30px;
      text-align: center;
    }
    
    .delivery-info h3 {
      color: #28a745;
      margin: 0 0 15px 0;
      font-size: 20px;
    }
    
    .delivery-info p {
      color: #155724;
      margin: 0;
      font-size: 16px;
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
      <h1>🚚 Your Order is on the Way!</h1>
      <p>Good news! Order #${order.id} has been shipped and is heading your way.</p>
    </div>
    
    <!-- Content -->
    <div class="content">
      <!-- Order Information -->
      <div class="order-info">
        <div class="order-number">Order #${order.id}</div>
        <p style="margin: 0; color: #28a745; font-weight: 600;">✅ Shipped on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
      
      <!-- Shipping Address -->
      <h2 class="section-title">📍 Delivery Address</h2>
      <div class="address-box">
        <div class="address-content">
          <strong>${order.shippingAddress.name || 'Customer'}</strong><br>
          ${order.shippingAddress.address || 'Address not provided'}<br>
          ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.postal || ''}<br>
          ${order.shippingAddress.country || 'Nigeria'}<br>
          ${order.shippingAddress.phone ? `📞 ${order.shippingAddress.phone}` : ''}
        </div>
      </div>
      
      <!-- Order Items -->
      <h2 class="section-title">📦 Items in Your Package</h2>
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
      
      <!-- Delivery Information -->
      <div class="delivery-info">
        <h3>🎯 Expected Delivery</h3>
        <p>Your package should arrive within 3-5 business days. We'll send you a notification when it's delivered!</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <div class="footer-content">
        <h3>Need Help?</h3>
        <p>If you have any questions about your delivery, our customer support team is here to help.</p>
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