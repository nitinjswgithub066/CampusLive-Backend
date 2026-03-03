const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const config = require('../config/config')

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id },
    config.jwt.secret,
    { expiresIn: '15m' }
  )
}

const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex')
}

const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
}