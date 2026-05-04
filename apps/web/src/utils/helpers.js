/**
 * Generates a URL-friendly slug from a string.
 * @param {string} str
 * @returns {string}
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Picks a random element from an array.
 * @param {Array} arr
 * @returns {*}
 */
export function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a range of numbers.
 * @param {number} start
 * @param {number} end
 * @returns {number[]}
 */
export function range(start, end) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

/**
 * Deep clones an object.
 * @param {*} obj
 * @returns {*}
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Groups an array of objects by a key.
 * @param {Array} arr
 * @param {string} key
 * @returns {object}
 */
export function groupBy(arr, key) {
  return arr.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) groups[group] = [];
    groups[group].push(item);
    return groups;
  }, {});
}

/**
 * Removes duplicate values from an array.
 * @param {Array} arr
 * @param {string} [key] - Key to deduplicate by (for objects)
 * @returns {Array}
 */
export function unique(arr, key) {
  if (!key) return [...new Set(arr)];
  const seen = new Set();
  return arr.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

/**
 * Checks if a value is empty (null, undefined, empty string, empty array, empty object).
 * @param {*} value
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Builds a query string from an object, omitting null/undefined values.
 * @param {object} params
 * @returns {string}
 */
export function buildQueryString(params) {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  );
  if (filtered.length === 0) return '';
  return '?' + filtered.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

/**
 * Clamps a number between min and max.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generates a random ID string.
 * @param {number} [length=8]
 * @returns {string}
 */
export function generateId(length = 8) {
  return Math.random().toString(36).substring(2, 2 + length);
}
