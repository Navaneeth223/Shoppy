'use strict';

const ApiError = require('../utils/ApiError');

/**
 * Restricts access to specific roles.
 * Must be used after the protect middleware.
 *
 * @param {...string} roles - Allowed roles
 * @returns {Function} Express middleware
 *
 * @example
 * router.delete('/users/:id', protect, restrictTo('admin', 'superadmin'), deleteUser);
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. This action requires one of the following roles: ${roles.join(', ')}.`
        )
      );
    }

    next();
  };
};

/**
 * Checks if the user is a seller (role === 'seller' or 'admin' or 'superadmin').
 */
const isSeller = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required.'));
  }

  if (!['seller', 'admin', 'superadmin'].includes(req.user.role)) {
    return next(ApiError.forbidden('Seller account required to access this resource.'));
  }

  next();
};

/**
 * Checks if the user is an admin.
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required.'));
  }

  if (!['admin', 'superadmin'].includes(req.user.role)) {
    return next(ApiError.forbidden('Admin access required.'));
  }

  next();
};

/**
 * Checks if the user is a superadmin.
 */
const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required.'));
  }

  if (req.user.role !== 'superadmin') {
    return next(ApiError.forbidden('Super admin access required.'));
  }

  next();
};

module.exports = { restrictTo, isSeller, isAdmin, isSuperAdmin };
