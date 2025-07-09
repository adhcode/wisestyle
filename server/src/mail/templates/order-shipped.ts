export const orderShippedTemplate = (order: any) => `
<!DOCTYPE html>
<html>
<head>
  <title>Your Order Has Shipped - WiseStyle</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .order-details { margin: 20px 0; }
    .item { margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; display:flex; align-items:center; }
    .item img { width:60px; margin-right:12px; border-radius:4px; object-fit:cover; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Good news! Your order is on the way</h1>
      <p>Order #${order.id} has been shipped.</p>
    </div>

    <div class="order-details">
      <h3>Shipping Details</h3>
      <p>
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
        ${order.shippingAddress.country}
      </p>

      <h3>Items in Your Box</h3>
      ${order.items.map(item => `
        <div class="item">
          <img src="${item.product.image || item.product.images?.[0]?.url || ''}" alt="${item.product.name}" />
          <div>
            <p style="margin:0 0 4px 0;"><strong>${item.product.name}</strong></p>
            <p style="margin:0;">Qty: ${item.quantity}</p>
          </div>
        </div>
      `).join('')}

      <p style="margin-top:20px;">You can expect delivery soon. Thank you for shopping with WiseStyle!</p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} WiseStyle. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`; 