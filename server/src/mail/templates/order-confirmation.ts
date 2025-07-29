import { baseEmailTemplate } from './base';

export const orderConfirmationTemplate = (order: any) => {
  // Build the items HTML separately to avoid nested template literals
  const itemsHtml = order.items.map((item: any) => {
    const colorText = item.color ? ` • Color: ${item.color}` : '';
    const sizeText = item.size ? ` • Size: ${item.size}` : '';
    const phoneText = order.shippingAddress.phone ? `📞 ${order.shippingAddress.phone}` : '';
    
    return `
      <div style="border: 1px solid #e9ecef; border-radius: 6px; padding: 16px; margin: 12px 0;">
        <div style="font-weight: 600; color: #3B2305; margin-bottom: 4px;">${item.product.name}</div>
        <div style="color: #666; font-size: 14px; margin-bottom: 4px;">
          Quantity: ${item.quantity}${colorText}${sizeText}
        </div>
        <div style="font-weight: 600; color: #C97203;">₦${Number(item.price).toLocaleString('en-NG')}</div>
      </div>
    `;
  }).join('');

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const phoneText = order.shippingAddress.phone ? `📞 ${order.shippingAddress.phone}` : '';

  const content = `
    <h1>🎉 Order Confirmed!</h1>
    <p>Thank you for choosing WiseStyle! Your order has been successfully placed and payment confirmed.</p>
    
    <div class="alert alert-success">
      <strong>Order #${order.id}</strong><br/>
      Placed on ${orderDate} • Status: <strong>${order.status}</strong>
    </div>
    
    <h2>📍 Shipping Address</h2>
    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 16px; margin: 16px 0;">
      <strong>${order.shippingAddress.name || 'Customer'}</strong><br>
      ${order.shippingAddress.address || 'Address not provided'}<br>
      ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} ${order.shippingAddress.postal || ''}<br>
      ${order.shippingAddress.country || 'Nigeria'}<br>
      ${phoneText}
    </div>
    
    <h2>🛍️ Order Items</h2>
    ${itemsHtml}
    
    <div style="background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin: 24px 0;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Subtotal:</span>
        <span>₦${Number(order.total).toLocaleString('en-NG')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
        <span>Shipping:</span>
        <span>₦${Number(order.shippingCost).toLocaleString('en-NG')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding-top: 12px; border-top: 2px solid #dee2e6; font-weight: 600; font-size: 18px; color: #3B2305;">
        <span>Total:</span>
        <span>₦${Number(order.total + order.shippingCost).toLocaleString('en-NG')}</span>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <h2>What's Next?</h2>
    <p>We're now preparing your order for shipment. You'll receive another email with tracking information once your order ships.</p>
    
    <div class="alert alert-info">
      <strong>Estimated Delivery:</strong> 3-5 business days within Nigeria<br/>
      <strong>Shipping Method:</strong> ${order.shippingMethod || 'Standard Delivery'}
    </div>
    
    <p>Need help with your order? Contact us at <a href="mailto:hello@wisestyleshop.com">hello@wisestyleshop.com</a> or call <a href="tel:+2348148331000">+234 814 833 1000</a>.</p>
    
    <p>Thank you for shopping with WiseStyle!</p>
  `;
  
  return baseEmailTemplate(content, `Order Confirmation #${order.id}`);
};