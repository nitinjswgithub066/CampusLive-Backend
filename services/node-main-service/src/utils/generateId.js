const crypto = require('crypto');

/**
 * Generate a unique profile ID
 * Format: PID_ + 8 random alphanumeric characters
 * Example: PID_A7X9K2M5
 * @returns {string} Unique profile ID
 */
const generateProfileId = () => {
    const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `PID_${randomString}`;
};

/**
 * Generate a unique streaming ID
 * Format: SID_ + 8 random alphanumeric characters
 * Example: SID_B3N7Q1P9
 * @returns {string} Unique streaming ID
 */
const generateStreamingId = () => {
    const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `PID_${randomString}`;
};

/**
 * Generate a custom length random alphanumeric string
 * @param {number} length - Length of the string
 * @returns {string} Random alphanumeric string
 */
const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const randomBytes = crypto.randomBytes(length);
    
    for (let i = 0; i < length; i++) {
        result += chars[randomBytes[i] % chars.length];
    }
    
    return result;
};

module.exports = {
    generateProfileId,
    generateStreamingId,
    generateRandomString
};
