export const orderConfirmationTemplate = (order: any) => `
<!DOCTYPE html>
<html>
<head>
  <title>Order Confirmation - WiseStyle</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; }
    .order-details { margin: 20px 0; }
    .item { margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee; }
    .total { font-weight: bold; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmation</h1>
      <p>Thank you for your order!</p>
    </div>

    <div class="order-details">
      <h2>Order #${order.id}</h2>
      <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      
      <h3>Shipping Address:</h3>
      <p>
        ${order.shippingAddress.street}<br>
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
        ${order.shippingAddress.country}
      </p>

      <h3>Order Items:</h3>
      ${order.items.map(item => `
        <div class="item">
          <p><strong>${item.product.name}</strong></p>
          <p>Quantity: ${item.quantity}</p>
          <p>Price: $${item.price}</p>
          ${item.color ? `<p>Color: ${item.color}</p>` : ''}
          ${item.size ? `<p>Size: ${item.size}</p>` : ''}
        </div>
      `).join('')}

      <div class="total">
        <p>Subtotal: $${order.total}</p>
        <p>Shipping: $${order.shippingCost}</p>
        <p>Total: $${order.total + order.shippingCost}</p>
      </div>
    </div>

    <div class="footer">
      <p>If you have any questions about your order, please contact our support team.</p>
      <p>© ${new Date().getFullYear()} WiseStyle. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`; 