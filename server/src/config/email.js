'use strict';

const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const env = require('./env');
const logger = require('../utils/logger');

let transporter = null;

/**
 * Configures the email transport (SendGrid in production, Ethereal in dev).
 */
async function configureEmail() {
  if (env.SENDGRID_API_KEY) {
    sgMail.setApiKey(env.SENDGRID_API_KEY);
    logger.info('[Email] SendGrid configured.');
    return;
  }

  if (env.isDevelopment) {
    // Use Ethereal for development testing
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info(`[Email] Ethereal test account: ${testAccount.user}`);
    } catch {
      logger.warn('[Email] Could not create Ethereal test account. Emails will be logged only.');
    }
    return;
  }

  logger.warn('[Email] No email provider configured. Emails will not be sent.');
}

/**
 * Sends an email using the configured transport.
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text fallback
 * @returns {Promise<void>}
 */
async function sendEmail({ to, subject, html, text }) {
  const from = `"${env.EMAIL_FROM_NAME}" <${env.EMAIL_FROM}>`;

  // Use SendGrid if configured
  if (env.SENDGRID_API_KEY) {
    await sgMail.send({
      to,
      from,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });
    logger.info(`[Email] Sent via SendGrid to ${to}: ${subject}`);
    return;
  }

  // Use Nodemailer transporter
  if (transporter) {
    const info = await transporter.sendMail({ from, to, subject, html, text });
    logger.info(`[Email] Sent via Nodemailer to ${to}: ${subject}`);
    if (env.isDevelopment) {
      logger.info(`[Email] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    return;
  }

  // Fallback: log the email
  logger.info(`[Email] MOCK — To: ${to} | Subject: ${subject}`);
}

module.exports = { configureEmail, sendEmail };
