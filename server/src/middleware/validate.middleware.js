'use strict';

const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Runs express-validator validation rules and returns errors if any.
 * Must be placed after validation rule arrays in route definitions.
 *
 * @example
 * router.post('/register', [
 *   body('email').isEmail(),
 *   body('password').isLength({ min: 8 }),
 *   validate,
 * ], registerController);
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return next(ApiError.badRequest('Validation failed', formattedErrors));
  }

  next();
}

module.exports = validate;
