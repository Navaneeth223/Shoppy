'use strict';

const slugifyLib = require('slugify');

/**
 * Generates a URL-friendly slug from a string.
 * @param {string} str - Input string
 * @param {object} [options] - Slugify options
 * @returns {string} URL-safe slug
 */
function createSlug(str, options = {}) {
  return slugifyLib(str, {
    lower: true,
    strict: true,
    trim: true,
    ...options,
  });
}

/**
 * Generates a unique slug by appending a random suffix if needed.
 * @param {string} str - Base string
 * @param {Function} checkExists - Async function that returns true if slug exists
 * @returns {Promise<string>} Unique slug
 */
async function createUniqueSlug(str, checkExists) {
  let slug = createSlug(str);
  let exists = await checkExists(slug);

  if (!exists) return slug;

  // Append random suffix to make unique
  let counter = 1;
  while (exists) {
    const candidate = `${slug}-${counter}`;
    exists = await checkExists(candidate);
    if (!exists) {
      slug = candidate;
      break;
    }
    counter++;
  }

  return slug;
}

module.exports = { createSlug, createUniqueSlug };
