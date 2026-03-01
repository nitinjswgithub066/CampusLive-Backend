 const rateLimit = require('express-rate-limit');
 const ApiError = require('../core/ApiError')


 const rateLimiter = (minutes, requests) => {

    minutes = Number(minutes)
    requests = Number(requests)

    if (!minutes || minutes <= 0) {
        throw new ApiError(500, 'Invalid minutes value for rate limiter')
    }

    if (!requests || requests <= 0) {
        throw new ApiError(500, 'Invalid requests value for rate limiter')
    }

    return rateLimit({
        windowMs: minutes * 60 * 1000,
        max: requests,

        standardHeaders: true,
        legacyHeaders: false,

        handler: (req, res, next) => {
            next(new ApiError(
                429,
                `Too many requests. Please try again after ${minutes} minute(s).`
            ))
        },
    })
 }

 module.exports = rateLimiter