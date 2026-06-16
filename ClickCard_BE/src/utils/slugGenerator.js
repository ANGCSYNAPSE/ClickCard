const slugify = require('slugify');

/**
 * Generate a URL-safe slug from text
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-safe slug
 */
const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true, // Remove special characters
    trim: true,
  });
};

/**
 * Create a unique slug with optional number suffix
 * @param {string} baseSlug - Base slug text
 * @param {number} suffix - Optional number to append (e.g., "john-doe-2")
 * @returns {string} - Unique slug
 */
const createUniqueSlug = (baseSlug, suffix = null) => {
  const slug = generateSlug(baseSlug);
  
  if (suffix !== null && suffix > 0) {
    return `${slug}-${suffix}`;
  }
  
  return slug;
};

module.exports = {
  generateSlug,
  createUniqueSlug,
};
