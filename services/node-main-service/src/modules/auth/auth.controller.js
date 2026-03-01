const asyncHandler = require('../../core/asyncHandler')
const authService = require('./auth.service')

// ==============================
// Controller for authentication
// ==============================

/**
 * Register a new user account
 * Accepts data from multi-step registration flow:
 * - Page 1: fullName, dob, gender
 * - Page 2: accountType, instituteName (if student)
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
        instituteName,
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

    const result = await authService.login({ 
        identifier, 
        password 
    })

    // Set httpOnly cookie for web apps
    res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({
        success: true,
        message: 'Login successful',
        data: result
    })
})


const logout = asyncHandler(async (req, res) => {
    // Clear the httpOnly cookie
    res.clearCookie('token', {
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


module.exports = {
    register,
    login,
    logout,
    searchInstitutes
}