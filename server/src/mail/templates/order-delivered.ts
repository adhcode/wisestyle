export const orderDeliveredTemplate = (order: any) => `
<!DOCTYPE html>
<html>
<head>
  <title>Order Delivered - WiseStyle</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .order-details { margin: 20px 0; }
    .item { margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; display:flex; align-items:center; }
    .item img { width:60px; margin-right:12px; border-radius:4px; object-fit:cover; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
    .review-cta { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your order has been delivered!</h1>
      <p>Order #${order.id} was successfully delivered.</p>
    </div>

    <div class="order-details">
      <h3>Delivered Items</h3>
      ${order.items.map(item => `
        <div class="item">
          <img src="${item.product.image || item.product.images?.[0]?.url || ''}" alt="${item.product.name}" />
          <div>
            <p style="margin:0 0 4px 0;"><strong>${item.product.name}</strong></p>
            <p style="margin:0;">Qty: ${item.quantity}</p>
          </div>
        </div>
      `).join('')}

      <div class="review-cta">
        <h3 style="margin-top:0;">How was your experience?</h3>
        <p>We'd love to hear your feedback about your purchase!</p>
        <p style="margin-bottom:0;">Thank you for shopping with WiseStyle. We hope you love your new items!</p>
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} WiseStyle. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`; 