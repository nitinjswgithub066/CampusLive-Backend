const jwt = require('jsonwebtoken')
const ApiError = require('../core/ApiError')
const config = require('../config/config')


const authenticateToken = (req, res, next) => {

    try {
        let token = null

        // Check Authorization header (for mobile apps)
        const authHeader = req.headers.authorization
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1]
        }

        // If no token in header, check cookie (for web apps)
        if (!token && req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken
        }

        if (!token) {
            throw new ApiError(401, 'Authentication required')
        }

        const decoded = jwt.verify(token, config.jwt.secret)

        req.user = {
            id: decoded.id,
            role: decoded.role
        }

        next()
    } catch (err) {

        if(err.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'Token expired'))
        }

        if(err.name === 'JsonWebTokenError') {
            return next(new ApiError(401, 'Invalid token'))
        }

        next(err)
    }
}

module.exports = {
    authenticateToken
}