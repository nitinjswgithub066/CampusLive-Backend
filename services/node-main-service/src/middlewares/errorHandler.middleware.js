const logger = require('../core/logger')


const errorHandler = (err, req, res, next) => {

    // Handle Sequelize unique constraint errors
    if (err.name === 'SequelizeUniqueConstraintError') {
        const field = err.errors[0]?.path || 'field';
        return res.status(400).json({
            success: false,
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} already in use`,
            details: null
        });
    }

    // Handle Sequelize validation errors
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            success: false,
            message: err.errors[0]?.message || 'Validation error',
            details: null
        });
    }

    const statusCode = err.statusCode || 500;

    if(!err.isOperational) {
        logger.error(err)
    }

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        details: err.details || null
    })

}

module.exports = errorHandler;