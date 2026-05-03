'use strict';

const express = require('express');
const { body } = require('express-validator');
const passport = require('passport');
const router = express.Router();

const authController = require('../../controllers/auth.controller');
const { protect } = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const {
  authLimiter,
  passwordResetLimiter,
  emailResendLimiter,
} = require('../../middleware/rateLimit.middleware');

// ─── Validation rules ─────────────────────────────────────────────────────────

const registerRules = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
];

const loginRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetPasswordRules = [
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/register', authLimiter, registerRules, validate, authController.register);
router.post('/login', authLimiter, loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

router.post('/forgot-password', passwordResetLimiter, forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, resetPasswordRules, validate, authController.resetPassword);

router.post('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', emailResendLimiter, forgotPasswordRules, validate, authController.resendVerification);

// OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), authController.googleCallback);

router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/login' }), authController.facebookCallback);

// 2FA routes (require authentication)
router.post('/2fa/setup', protect, authController.setup2FA);
router.post('/2fa/verify', protect, authController.verify2FA);
router.post('/2fa/disable', protect, authController.disable2FA);
router.post('/2fa/validate', authController.validate2FA);

module.exports = router;
