const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
    return bcrypt.hash(password, SALT_ROUNDS);
}

const comparePassword = async (password, hashPassword) => {
    return bcrypt.compare(password, hashPassword);
}

module.exports = {
    hashPassword,
    comparePassword,
}