'use strict';

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../models/User.model');
const env = require('./env');
const logger = require('../utils/logger');

/**
 * Configures Passport.js strategies.
 * @param {import('passport').PassportStatic} passport
 */
module.exports = function configurePassport(passport) {
  // ─── JWT Strategy ───────────────────────────────────────────────────────────
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.JWT_ACCESS_SECRET,
      },
      async (payload, done) => {
        try {
          const user = await User.findById(payload.id);
          if (!user || !user.isActive || user.isBanned) {
            return done(null, false);
          }
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );

  // ─── Google OAuth Strategy ──────────────────────────────────────────────────
  if (env.ENABLE_SOCIAL_AUTH && env.GOOGLE_CLIENT_ID) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID,
          clientSecret: env.GOOGLE_CLIENT_SECRET,
          callbackURL: env.GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error('No email from Google'), null);

            // Find or create user
            let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] });

            if (user) {
              // Link Google account if not already linked
              if (!user.googleId) {
                user.googleId = profile.id;
                await user.save({ validateBeforeSave: false });
              }
            } else {
              user = await User.create({
                firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
                lastName: profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' ') || 'User',
                email,
                googleId: profile.id,
                isEmailVerified: true,
                avatar: {
                  url: profile.photos?.[0]?.value || null,
                },
              });
            }

            return done(null, user);
          } catch (err) {
            logger.error('[Passport] Google OAuth error:', err.message);
            return done(err, null);
          }
        }
      )
    );
  }

  // ─── Facebook OAuth Strategy ────────────────────────────────────────────────
  if (env.ENABLE_SOCIAL_AUTH && env.FACEBOOK_APP_ID) {
    passport.use(
      new FacebookStrategy(
        {
          clientID: env.FACEBOOK_APP_ID,
          clientSecret: env.FACEBOOK_APP_SECRET,
          callbackURL: env.FACEBOOK_CALLBACK_URL,
          profileFields: ['id', 'emails', 'name', 'picture'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) return done(new Error('No email from Facebook'), null);

            let user = await User.findOne({ $or: [{ facebookId: profile.id }, { email }] });

            if (user) {
              if (!user.facebookId) {
                user.facebookId = profile.id;
                await user.save({ validateBeforeSave: false });
              }
            } else {
              user = await User.create({
                firstName: profile.name?.givenName || 'User',
                lastName: profile.name?.familyName || 'User',
                email,
                facebookId: profile.id,
                isEmailVerified: true,
                avatar: {
                  url: profile.photos?.[0]?.value || null,
                },
              });
            }

            return done(null, user);
          } catch (err) {
            logger.error('[Passport] Facebook OAuth error:', err.message);
            return done(err, null);
          }
        }
      )
    );
  }
};
