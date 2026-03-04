const express = require('express');
const router = express.Router();
const authController = require('./auth.controller')
const rateLimiter = require('../../middlewares/rateLimiter.middleware')
const { authenticateToken } = require('../../middlewares/auth.middleware')

// ==============================
// Routers for authentication
// ==============================

router.post('/auth/login', rateLimiter(1, 5), authController.login)

router.post('/auth/register', rateLimiter(1, 5), authController.register)

router.post('/auth/refresh', authController.refreshToken)

router.post('/auth/logout', authController.logout)

router.post('/auth/logout-all', authenticateToken, authController.logoutAllDevices)

// Institute endpoints (for student registration)
router.get('/auth/institutes', authController.getAllInstitutes)
router.get('/auth/institutes/search', authController.searchInstitutes)

module.exports = router