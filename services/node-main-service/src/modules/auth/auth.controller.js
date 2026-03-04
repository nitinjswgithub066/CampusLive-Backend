const asyncHandler = require('../../core/asyncHandler')
const authService = require('./auth.service')

// ==============================
// Controller for authentication
// ==============================

/**
 * Register a new user account
 * Accepts data from multi-step registration flow:
 * - Page 1: fullName, dob, gender
 * - Page 2: accountType, instituteId (if student)
 * - Page 3: email, mobileNumber, invitationCode (optional)
 * - Page 4: username, password
 */
const register = asyncHandler(async (req, res) => {
    const { 
        // Profile info (Page 1)
        fullName,
        dob,
        gender,
        // Account type (Page 2)
        accountType,
        instituteId,
        instituteName, // Kept for backward compatibility
        // Contact info (Page 3)
        email, 
        mobileNumber,
        invitationCode,
        // Credentials (Page 4)
        username, 
        password 
    } = req.body

    const result = await authService.createAccount({ 
        fullName,
        dob,
        gender,
        accountType,
        instituteId,
        instituteName,
        email, 
        mobileNumber,
        invitationCode,
        username, 
        password
    })

    res.status(201).json({
        success: true,
        message: 'Account created successfully',
        data: result
    })
})


const login = asyncHandler(async (req, res) => {
    const { username, email, mobileNumber, password } = req.body

    // Use whichever identifier is provided
    const identifier = username || email || mobileNumber

    // Extract device metadata
    const deviceId = req.headers['x-device-id'] || null
    const ipAddress = req.ip || req.connection.remoteAddress
    const userAgent = req.headers['user-agent'] || null

    const result = await authService.login({ 
        identifier, 
        password,
        deviceId,
        ipAddress,
        userAgent
    })

    // Set httpOnly cookies for tokens
    // Refresh token - long lived (7 days)
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    // Access token - short lived (15 minutes) - optional cookie
    res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    })

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user
        }
    })
})

/**
 * Refresh access token using refresh token
 */
const refreshToken = asyncHandler(async (req, res) => {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken

    const result = await authService.refreshAccessToken(refreshToken)

    // Set new httpOnly cookies
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.cookie('accessToken', result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000 // 15 minutes
    })

    res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user
        }
    })
})


const logout = asyncHandler(async (req, res) => {
    // Get refresh token from cookie or body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken

    // Revoke the session
    await authService.logout(refreshToken)

    // Clear httpOnly cookies
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })

    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })

    res.json({
        success: true,
        message: 'Logged out successfully'
    })
})

/**
 * Logout from all devices
 */
const logoutAllDevices = asyncHandler(async (req, res) => {
    const userId = req.user.id // Assumes auth middleware has set req.user

    await authService.logoutAllDevices(userId)

    // Clear httpOnly cookies
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })

    res.clearCookie('accessToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })

    res.json({
        success: true,
        message: 'Logged out from all devices successfully'
    })
})

/**
 * Search institutes by name
 * Query params: ?search=<search_term>&limit=<optional_limit>
 */
const searchInstitutes = asyncHandler(async (req, res) => {
    const { search, limit } = req.query

    const results = await authService.searchInstitutes(
        search, 
        limit ? parseInt(limit) : 10
    )

    res.json({
        success: true,
        data: results,
        count: results.length
    })
})

/**
 * Get all institutes
 * Query params: ?limit=<optional_limit>
 */
const getAllInstitutes = asyncHandler(async (req, res) => {
    const { limit } = req.query

    const results = await authService.getAllInstitutes(
        limit ? parseInt(limit) : 100
    )

    res.json({
        success: true,
        data: results,
        count: results.length
    })
})


module.exports = {
    register,
    login,
    refreshToken,
    logout,
    logoutAllDevices,
    searchInstitutes,
    getAllInstitutes
}