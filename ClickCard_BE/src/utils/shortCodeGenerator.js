const crypto = require('crypto');

/**
 * Generate a random short code (8 characters)
 * Uses A-Z and 0-9 (avoiding 0/O and 1/l/I confusion)
 * @returns {string} - 8-character short code
 */
const generateShortCode = () => {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // No 0, 1, I, L, O to avoid confusion
  let code = '';
  
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(crypto.randomInt(0, chars.length));
  }
  
  return code;
};

/**
 * Generate multiple unique short codes
 * @param {number} count - Number of codes to generate
 * @returns {string[]} - Array of short codes
 */
const generateShortCodes = (count = 1) => {
  const codes = [];
  const seenCodes = new Set();
  
  while (codes.length < count) {
    const code = generateShortCode();
    if (!seenCodes.has(code)) {
      codes.push(code);
      seenCodes.add(code);
    }
  }
  
  return codes;
};

module.exports = {
  generateShortCode,
  generateShortCodes,
};
