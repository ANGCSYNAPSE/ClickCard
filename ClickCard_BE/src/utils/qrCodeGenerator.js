const QRCode = require('qrcode');

/**
 * Generate QR code as data URL (base64)
 * @param {string} text - Text or URL to encode
 * @param {object} options - QR code options
 * @returns {Promise<string>} - Base64 data URL
 */
const generateQRCodeDataUrl = async (text, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };
    const qrCodeDataUrl = await QRCode.toDataURL(text, finalOptions);
    
    return qrCodeDataUrl;
  } catch (err) {
    throw new Error(`QR Code generation failed: ${err.message}`);
  }
};

/**
 * Generate QR code as buffer
 * @param {string} text - Text or URL to encode
 * @param {object} options - QR code options
 * @returns {Promise<Buffer>} - PNG buffer
 */
const generateQRCodeBuffer = async (text, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };
    const qrCodeBuffer = await QRCode.toBuffer(text, finalOptions);
    
    return qrCodeBuffer;
  } catch (err) {
    throw new Error(`QR Code generation failed: ${err.message}`);
  }
};

/**
 * Generate QR code and save to file
 * @param {string} text - Text or URL to encode
 * @param {string} filePath - File path to save to
 * @param {object} options - QR code options
 * @returns {Promise<string>} - File path
 */
const generateQRCodeFile = async (text, filePath, options = {}) => {
  try {
    const defaultOptions = {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    };

    const finalOptions = { ...defaultOptions, ...options };
    await QRCode.toFile(filePath, text, finalOptions);
    
    return filePath;
  } catch (err) {
    throw new Error(`QR Code file generation failed: ${err.message}`);
  }
};

module.exports = {
  generateQRCodeDataUrl,
  generateQRCodeBuffer,
  generateQRCodeFile,
};
