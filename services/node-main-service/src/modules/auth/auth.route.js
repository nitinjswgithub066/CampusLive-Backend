const express = require('express');
const router = express.Router();
const authController = require('./auth.controller')
const rateLimiter = require('../../middlewares/rateLimiter.middleware')

// ==============================
// Routers for authentication
// ==============================

router.post('/auth/login', rateLimiter(1, 5), authController.login)

router.post('/auth/register', rateLimiter(1, 5), authController.register)

router.post('/auth/logout', authController.logout)

// Search institutes (for student registration)
router.get('/auth/institutes/search', authController.searchInstitutes)

module.exports = router