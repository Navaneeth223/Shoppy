'use strict';

const { sendEmail } = require('../config/email');
const env = require('../config/env');
const logger = require('../utils/logger');

// ─── Email template helpers ───────────────────────────────────────────────────

function baseTemplate(content, preheader = '') {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Nexus Commerce</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #0A0A0B; color: #F2F2F3; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #111113 0%, #1A1A1E 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .logo { font-size: 28px; font-weight: 700; color: #C9A84C; letter-spacing: -0.5px; }
    .logo span { color: #00E5FF; }
    .body { background: #111113; padding: 40px 32px; }
    .footer { background: #0A0A0B; border-radius: 0 0 16px 16px; padding: 24px 32px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); }
    h1 { font-size: 24px; font-weight: 700; color: #F2F2F3; margin-bottom: 16px; }
    h2 { font-size: 18px; font-weight: 600; color: #F2F2F3; margin-bottom: 12px; }
    p { font-size: 15px; line-height: 1.6; color: #8A8A95; margin-bottom: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #C9A84C, #E8C56A); color: #0A0A0B; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 9999px; text-decoration: none; margin: 16px 0; }
    .btn-secondary { background: transparent; color: #00E5FF; border: 1px solid #00E5FF; }
    .divider { height: 1px; background: rgba(255,255,255,0.08); margin: 24px 0; }
    .highlight { color: #C9A84C; font-weight: 600; }
    .code { background: #1A1A1E; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 16px 24px; font-family: 'JetBrains Mono', monospace; font-size: 24px; letter-spacing: 4px; text-align: center; color: #00E5FF; margin: 16px 0; }
    .order-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .order-item img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; margin-right: 16px; }
    .badge { display: inline-block; background: rgba(0,229,255,0.1); color: #00E5FF; border: 1px solid rgba(0,229,255,0.2); border-radius: 9999px; padding: 4px 12px; font-size: 12px; font-weight: 600; }
    .badge-success { background: rgba(0,200,150,0.1); color: #00C896; border-color: rgba(0,200,150,0.2); }
    .badge-warning { background: rgba(255,184,0,0.1); color: #FFB800; border-color: rgba(255,184,0,0.2); }
    .badge-error { background: rgba(255,77,109,0.1); color: #FF4D6D; border-color: rgba(255,77,109,0.2); }
    .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 16px 0; }
    .stat-card { background: #1A1A1E; border-radius: 12px; padding: 16px; text-align: center; }
    .stat-value { font-size: 22px; font-weight: 700; color: #C9A84C; }
    .stat-label { font-size: 12px; color: #4A4A52; margin-top: 4px; }
    .footer-text { font-size: 12px; color: #4A4A52; line-height: 1.6; }
    .footer-links a { color: #8A8A95; text-decoration: none; margin: 0 8px; }
    @media (prefers-color-scheme: light) {
      body { background-color: #f5f5f5; }
      .header, .body { background: #ffffff; }
      .footer { background: #f0f0f0; }
      p { color: #555; }
      h1, h2 { color: #111; }
    }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <div class="wrapper">
    <div class="header">
      <div class="logo">NEXUS<span>.</span></div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p class="footer-text">
        © ${new Date().getFullYear()} Nexus Commerce. All rights reserved.<br>
        <span class="footer-links">
          <a href="${env.FRONTEND_URL}/privacy-policy">Privacy</a>
          <a href="${env.FRONTEND_URL}/terms">Terms</a>
          <a href="${env.FRONTEND_URL}/contact">Contact</a>
        </span>
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email sending functions ──────────────────────────────────────────────────

/**
 * Sends a welcome email to a new user.
 */
async function sendWelcomeEmail(user) {
  const html = baseTemplate(`
    <h1>Welcome to Nexus, ${user.firstName}! 🎉</h1>
    <p>You've joined the most premium shopping experience on the web. Here's what you can do:</p>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">200+</div>
        <div class="stat-label">Premium Brands</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">10K+</div>
        <div class="stat-label">Products</div>
      </div>
    </div>
    <div class="divider"></div>
    <h2>Get started</h2>
    <p>Browse our curated collections, save items to your wishlist, and enjoy fast, secure checkout.</p>
    <a href="${env.FRONTEND_URL}/shop" class="btn">Start Shopping</a>
    <div class="divider"></div>
    <p style="font-size:13px;">Questions? Reply to this email or visit our <a href="${env.FRONTEND_URL}/faq" style="color:#00E5FF;">Help Center</a>.</p>
  `, `Welcome to Nexus Commerce, ${user.firstName}!`);

  await sendEmail({
    to: user.email,
    subject: `Welcome to Nexus, ${user.firstName}! 🎉`,
    html,
  });
}

/**
 * Sends an email verification email.
 */
async function sendEmailVerification(user, verificationUrl) {
  const html = baseTemplate(`
    <h1>Verify your email</h1>
    <p>Hi ${user.firstName}, please verify your email address to activate your account.</p>
    <a href="${verificationUrl}" class="btn">Verify Email Address</a>
    <div class="divider"></div>
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break:break-all;font-size:13px;color:#4A4A52;">${verificationUrl}</p>
    <div class="divider"></div>
    <p style="font-size:13px;">This link expires in <span class="highlight">24 hours</span>. If you didn't create an account, you can safely ignore this email.</p>
  `, 'Verify your Nexus Commerce email address');

  await sendEmail({
    to: user.email,
    subject: 'Verify your Nexus Commerce email address',
    html,
  });
}

/**
 * Sends a password reset email.
 */
async function sendPasswordResetEmail(user, resetUrl) {
  const html = baseTemplate(`
    <h1>Reset your password</h1>
    <p>Hi ${user.firstName}, we received a request to reset your password.</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <div class="divider"></div>
    <p>Or copy and paste this link:</p>
    <p style="word-break:break-all;font-size:13px;color:#4A4A52;">${resetUrl}</p>
    <div class="divider"></div>
    <p style="font-size:13px;">This link expires in <span class="highlight">1 hour</span>. If you didn't request a password reset, please secure your account immediately.</p>
  `, 'Reset your Nexus Commerce password');

  await sendEmail({
    to: user.email,
    subject: 'Reset your Nexus Commerce password',
    html,
  });
}

/**
 * Sends an order confirmation email.
 */
async function sendOrderConfirmation(user, order) {
  const itemsHtml = order.items.map((item) => `
    <div style="display:flex;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
      <img src="${item.image || 'https://via.placeholder.com/60'}" alt="${item.title}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;margin-right:16px;" />
      <div style="flex:1;">
        <p style="margin:0;font-size:14px;color:#F2F2F3;font-weight:600;">${item.title}</p>
        ${item.variantLabel ? `<p style="margin:4px 0 0;font-size:12px;color:#4A4A52;">${item.variantLabel}</p>` : ''}
        <p style="margin:4px 0 0;font-size:13px;color:#8A8A95;">Qty: ${item.quantity}</p>
      </div>
      <div style="text-align:right;">
        <p style="margin:0;font-size:14px;color:#C9A84C;font-weight:700;">$${(item.price * item.quantity).toFixed(2)}</p>
      </div>
    </div>
  `).join('');

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <span class="badge badge-success">Order Confirmed</span>
    </div>
    <h1>Thank you, ${user.firstName}!</h1>
    <p>Your order <span class="highlight">${order.orderNumber}</span> has been confirmed and is being processed.</p>
    <div class="divider"></div>
    <h2>Order Summary</h2>
    ${itemsHtml}
    <div class="divider"></div>
    <div style="text-align:right;">
      <p>Subtotal: <span style="color:#F2F2F3;">$${order.subtotal.toFixed(2)}</span></p>
      ${order.discountAmount > 0 ? `<p>Discount: <span style="color:#00C896;">-$${order.discountAmount.toFixed(2)}</span></p>` : ''}
      <p>Shipping: <span style="color:#F2F2F3;">$${order.shippingCost.toFixed(2)}</span></p>
      <p>Tax: <span style="color:#F2F2F3;">$${order.taxAmount.toFixed(2)}</span></p>
      <p style="font-size:18px;font-weight:700;">Total: <span class="highlight">$${order.totalAmount.toFixed(2)}</span></p>
    </div>
    <div class="divider"></div>
    <h2>Shipping to</h2>
    <p>${order.shippingAddress.firstName} ${order.shippingAddress.lastName}<br>
    ${order.shippingAddress.addressLine1}<br>
    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
    <a href="${env.FRONTEND_URL}/profile/orders/${order._id}" class="btn">Track Your Order</a>
  `, `Order ${order.orderNumber} confirmed!`);

  await sendEmail({
    to: user.email,
    subject: `Order ${order.orderNumber} confirmed! 🎉`,
    html,
  });
}

/**
 * Sends an order shipped notification.
 */
async function sendOrderShipped(user, order, trackingInfo) {
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <span class="badge">Shipped</span>
    </div>
    <h1>Your order is on its way!</h1>
    <p>Hi ${user.firstName}, your order <span class="highlight">${order.orderNumber}</span> has been shipped.</p>
    ${trackingInfo ? `
    <div style="background:#1A1A1E;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#4A4A52;">Tracking Number</p>
      <div class="code">${trackingInfo.trackingNumber}</div>
      <p style="margin:0;font-size:13px;color:#8A8A95;">Carrier: ${trackingInfo.carrier}</p>
    </div>
    ` : ''}
    <p>Estimated delivery: <span class="highlight">${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '3-5 business days'}</span></p>
    <a href="${env.FRONTEND_URL}/profile/orders/${order._id}" class="btn">Track Order</a>
  `, `Your order ${order.orderNumber} has shipped!`);

  await sendEmail({
    to: user.email,
    subject: `Your order ${order.orderNumber} has shipped! 📦`,
    html,
  });
}

/**
 * Sends an order delivered notification with review request.
 */
async function sendOrderDelivered(user, order) {
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <span class="badge badge-success">Delivered</span>
    </div>
    <h1>Your order has arrived!</h1>
    <p>Hi ${user.firstName}, your order <span class="highlight">${order.orderNumber}</span> has been delivered. We hope you love your purchase!</p>
    <div class="divider"></div>
    <h2>Share your experience</h2>
    <p>Your review helps other shoppers make better decisions. It only takes a minute!</p>
    <a href="${env.FRONTEND_URL}/profile/orders/${order._id}" class="btn">Write a Review</a>
  `, `Your order ${order.orderNumber} has been delivered!`);

  await sendEmail({
    to: user.email,
    subject: `Your order ${order.orderNumber} has been delivered! ✅`,
    html,
  });
}

/**
 * Sends an order cancellation email.
 */
async function sendOrderCancelled(user, order) {
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <span class="badge badge-error">Cancelled</span>
    </div>
    <h1>Order Cancelled</h1>
    <p>Hi ${user.firstName}, your order <span class="highlight">${order.orderNumber}</span> has been cancelled.</p>
    ${order.cancellationReason ? `<p>Reason: ${order.cancellationReason}</p>` : ''}
    ${order.refundAmount > 0 ? `<p>A refund of <span class="highlight">$${order.refundAmount.toFixed(2)}</span> will be processed within 5-7 business days.</p>` : ''}
    <a href="${env.FRONTEND_URL}/shop" class="btn">Continue Shopping</a>
  `, `Order ${order.orderNumber} has been cancelled`);

  await sendEmail({
    to: user.email,
    subject: `Order ${order.orderNumber} has been cancelled`,
    html,
  });
}

/**
 * Sends a refund processed notification.
 */
async function sendRefundProcessed(user, order, refundAmount) {
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <span class="badge badge-success">Refund Processed</span>
    </div>
    <h1>Your refund is on its way</h1>
    <p>Hi ${user.firstName}, we've processed a refund of <span class="highlight">$${refundAmount.toFixed(2)}</span> for order <span class="highlight">${order.orderNumber}</span>.</p>
    <p>Please allow 5-7 business days for the refund to appear on your statement.</p>
    <a href="${env.FRONTEND_URL}/profile/orders" class="btn">View Orders</a>
  `, `Refund of $${refundAmount.toFixed(2)} processed`);

  await sendEmail({
    to: user.email,
    subject: `Refund of $${refundAmount.toFixed(2)} processed for order ${order.orderNumber}`,
    html,
  });
}

/**
 * Sends a seller approval/rejection notification.
 */
async function sendSellerStatusUpdate(user, status, reason) {
  const isApproved = status === 'approved';
  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <span class="badge ${isApproved ? 'badge-success' : 'badge-error'}">${isApproved ? 'Approved' : 'Rejected'}</span>
    </div>
    <h1>Seller Application ${isApproved ? 'Approved' : 'Update'}</h1>
    <p>Hi ${user.firstName}, ${isApproved
      ? 'congratulations! Your seller application has been approved. You can now start listing products on Nexus Commerce.'
      : `we've reviewed your seller application and unfortunately cannot approve it at this time.`
    }</p>
    ${!isApproved && reason ? `<p>Reason: ${reason}</p>` : ''}
    ${isApproved ? `<a href="${env.SELLER_DASHBOARD_URL}" class="btn">Go to Seller Dashboard</a>` : `<a href="${env.FRONTEND_URL}/contact" class="btn btn-secondary">Contact Support</a>`}
  `, `Seller application ${isApproved ? 'approved' : 'update'}`);

  await sendEmail({
    to: user.email,
    subject: `Your Nexus seller application has been ${isApproved ? 'approved! 🎉' : 'reviewed'}`,
    html,
  });
}

/**
 * Sends a 2FA enabled confirmation.
 */
async function send2FAEnabled(user) {
  const html = baseTemplate(`
    <h1>Two-Factor Authentication Enabled</h1>
    <p>Hi ${user.firstName}, two-factor authentication has been successfully enabled on your account.</p>
    <p>Your account is now more secure. You'll need your authenticator app each time you log in.</p>
    <div class="divider"></div>
    <p style="font-size:13px;color:#FF4D6D;">If you didn't enable 2FA, please <a href="${env.FRONTEND_URL}/profile/security" style="color:#FF4D6D;">secure your account immediately</a>.</p>
  `, '2FA enabled on your Nexus account');

  await sendEmail({
    to: user.email,
    subject: 'Two-Factor Authentication enabled on your Nexus account',
    html,
  });
}

/**
 * Sends a new device login alert.
 */
async function sendNewDeviceAlert(user, deviceInfo) {
  const html = baseTemplate(`
    <h1>New login detected</h1>
    <p>Hi ${user.firstName}, we detected a login to your account from a new device.</p>
    <div style="background:#1A1A1E;border-radius:12px;padding:20px;margin:16px 0;">
      <p style="margin:0 0 8px;font-size:13px;color:#4A4A52;">Device Details</p>
      <p style="margin:0;font-size:14px;color:#F2F2F3;">Browser: ${deviceInfo.browser || 'Unknown'}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#F2F2F3;">OS: ${deviceInfo.os || 'Unknown'}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#F2F2F3;">IP: ${deviceInfo.ip || 'Unknown'}</p>
      <p style="margin:4px 0 0;font-size:14px;color:#F2F2F3;">Time: ${new Date().toLocaleString()}</p>
    </div>
    <p style="font-size:13px;color:#FF4D6D;">If this wasn't you, please <a href="${env.FRONTEND_URL}/profile/security" style="color:#FF4D6D;">change your password immediately</a>.</p>
  `, 'New login detected on your Nexus account');

  await sendEmail({
    to: user.email,
    subject: 'New login detected on your Nexus account',
    html,
  });
}

/**
 * Sends a price drop alert for a wishlisted product.
 */
async function sendPriceDropAlert(user, product, oldPrice, newPrice) {
  const savings = oldPrice - newPrice;
  const savingsPercent = Math.round((savings / oldPrice) * 100);

  const html = baseTemplate(`
    <div style="text-align:center;margin-bottom:24px;">
      <span class="badge badge-success">Price Drop Alert</span>
    </div>
    <h1>Price dropped on your wishlist item!</h1>
    <p>Hi ${user.firstName}, an item on your wishlist just got cheaper.</p>
    <div style="background:#1A1A1E;border-radius:12px;padding:20px;margin:16px 0;display:flex;align-items:center;">
      <img src="${product.primaryImage?.url || 'https://via.placeholder.com/80'}" alt="${product.title}" style="width:80px;height:80px;border-radius:8px;object-fit:cover;margin-right:16px;" />
      <div>
        <p style="margin:0;font-size:15px;color:#F2F2F3;font-weight:600;">${product.title}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#8A8A95;text-decoration:line-through;">Was: $${oldPrice.toFixed(2)}</p>
        <p style="margin:4px 0 0;font-size:20px;color:#C9A84C;font-weight:700;">Now: $${newPrice.toFixed(2)}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#00C896;">Save $${savings.toFixed(2)} (${savingsPercent}% off)</p>
      </div>
    </div>
    <a href="${env.FRONTEND_URL}/product/${product.slug}" class="btn">Shop Now</a>
  `, `Price dropped on ${product.title}!`);

  await sendEmail({
    to: user.email,
    subject: `Price dropped ${savingsPercent}% on "${product.title}"! 🔥`,
    html,
  });
}

module.exports = {
  sendWelcomeEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
  sendOrderConfirmation,
  sendOrderShipped,
  sendOrderDelivered,
  sendOrderCancelled,
  sendRefundProcessed,
  sendSellerStatusUpdate,
  send2FAEnabled,
  sendNewDeviceAlert,
  sendPriceDropAlert,
};
