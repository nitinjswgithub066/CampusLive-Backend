const { hashPassword, comparePassword } = require('../../utils/hashPassword');
const ApiError = require('../../core/ApiError');
const repo = require('./auth.repository');
const config = require('../../config/config');
const { generateAccessToken, generateRefreshToken, hashToken } = require('../../utils/token');

/**
 * Create a new user account
 * Registration flow data:
 * - Page 1: fullName, dob, gender
 * - Page 2: accountType (student/professional/businessman), instituteName (if student)
 * - Page 3: mobileNumber, email, invitationCode (optional)
 * - Page 4: username, password
 * @param {Object} userData - All registration data
 * @returns {Promise<Object>} Created user data with profile
 */
const createAccount = async ({ 
    // Profile information (Page 1)
    fullName,
    dob,
    gender,
    // Account type and institute (Page 2)
    accountType,
    instituteName,
    // Contact information (Page 3)
    email, 
    mobileNumber,
    invitationCode,
    // Credentials (Page 4)
    username, 
    password 
}) => {
    // === Validation ===
    
    // Profile data validation (Page 1)
    if (!fullName) {
        throw new ApiError(400, 'Full name is required');
    }
    
    if (!dob) {
        throw new ApiError(400, 'Date of birth is required');
    }
    
    if (!gender || !['male', 'female', 'other'].includes(gender)) {
        throw new ApiError(400, 'Valid gender is required (male, female, or other)');
    }
    
    // Account type validation (Page 2)
    if (!accountType) {
        throw new ApiError(400, 'Account type is required (student, professional, business, or other)');
    }
    
    if (!['student', 'professional', 'business', 'other'].includes(accountType)) {
        throw new ApiError(400, 'Invalid account type');
    }
    
    // Contact information validation (Page 3)
    if (!email && !mobileNumber) {
        throw new ApiError(400, 'Email or mobile number is required');
    }
    
    // Credentials validation (Page 4)
    if (!username) {
        throw new ApiError(400, 'Username is required');
    }

    if (!password) {
        throw new ApiError(400, 'Password is required');
    }
    
    if (password.length < 8) {
        throw new ApiError(400, 'Password must be at least 8 characters long');
    }

    // === Check for existing identifiers ===
    
    if (email) {
        const emailExists = await repo.findByEmail(email);
        if (emailExists) {
            throw new ApiError(400, 'Email already in use');
        }
    }

    if (mobileNumber) {
        const phoneExists = await repo.findByPhone(mobileNumber);
        if (phoneExists) {
            throw new ApiError(400, 'Mobile number already in use');
        }
    }

    const usernameExists = await repo.findByUsername(username);
    if (usernameExists) {
        throw new ApiError(400, 'Username already taken');
    }

    // === Handle institute (for students) ===
    
    let instituteId = null;
    
    if (accountType === 'student' && instituteName) {
        // Try to find existing institute
        let institute = await repo.findInstituteByName(instituteName);
        
        // If not found, you might want to create it or throw error
        // For now, we'll just use the ID if found
        if (institute) {
            instituteId = institute.id;
        }
        // Optionally: Create new institute if not found
        // else {
        //     institute = await repo.createInstitute({ name: instituteName });
        //     instituteId = institute.id;
        // }
    }

    // === Hash password ===
    
    const hashedPassword = await hashPassword(password);

    // === Create user with profile ===
    
    const user = await repo.createUser({
        // Credentials
        username,
        password: hashedPassword,
        // Contact info
        email,
        mobileNumber,
        // Account info
        accountType,
        // Profile info
        fullName,
        dob,
        gender,
        instituteId,
        // Optional
        invitationCode
    });

    // === Format response ===
    
    const identifierMap = {};
    if (user.identifiers && user.identifiers.length > 0) {
        user.identifiers.forEach(identifier => {
            if (identifier.type === 'email') identifierMap.email = identifier.value;
            if (identifier.type === 'phone') identifierMap.mobileNumber = identifier.value;
            if (identifier.type === 'username') identifierMap.username = identifier.value;
        });
    }

    const response = {
        id: user.id,
        username: identifierMap.username || null,
        email: identifierMap.email || null,
        mobileNumber: identifierMap.mobileNumber || null,
        accountType: user.accountType,
        authRole: user.authRole,
        isActive: user.isActive
    };

    // Add profile data if exists
    if (user.profile) {
        response.profile = {
            profileId: user.profile.profileId,
            streamingId: user.profile.streamingId,
            fullName: user.profile.fullName,
            dob: user.profile.dob,
            gender: user.profile.gender,
            instituteId: user.profile.instituteId
        };
    }

    return response;
};

/**
 * Login user
 * @param {Object} credentials - Contains identifier, password, and request metadata
 * @returns {Promise<Object>} Access token, refresh token, and user data
 */
const login = async ({ identifier, password, deviceId, ipAddress, userAgent }) => {
    if (!identifier || !password) {
        throw new ApiError(400, 'Identifier and password are required');
    }

    // Find user by any identifier
    const user = await repo.findByIdentifier(identifier);

    if (!user) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
        throw new ApiError(403, 'Account is inactive');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashToken(refreshToken);

    // Create session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await repo.createSession({
        userId: user.id,
        refreshTokenHash,
        deviceId: deviceId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        expiresAt
    });

    // Format identifier values
    const identifierMap = {};
    user.identifiers.forEach(identifier => {
        if (identifier.type === 'email') identifierMap.email = identifier.value;
        if (identifier.type === 'phone') identifierMap.mobileNumber = identifier.value;
        if (identifier.type === 'username') identifierMap.username = identifier.value;
    });

    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            username: identifierMap.username || null,
            email: identifierMap.email || null,
            mobileNumber: identifierMap.mobileNumber || null,
            accountType: user.accountType,
            authRole: user.authRole,
            isActive: user.isActive
        }
    };
};

/**
 * Refresh access token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New access token and refresh token
 */
const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(400, 'Refresh token is required');
    }

    const refreshTokenHash = hashToken(refreshToken);
    const session = await repo.findSessionByTokenHash(refreshTokenHash);

    if (!session) {
        throw new ApiError(401, 'Invalid or expired refresh token');
    }

    // Check if user is still active
    if (!session.user.isActive) {
        throw new ApiError(403, 'Account is inactive');
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(session.user);
    const newRefreshToken = generateRefreshToken();
    const newRefreshTokenHash = hashToken(newRefreshToken);

    // Revoke old session
    await repo.revokeSession(session.id);

    // Create new session
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await repo.createSession({
        userId: session.user.id,
        refreshTokenHash: newRefreshTokenHash,
        deviceId: session.deviceId,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        expiresAt
    });

    // Format identifier values
    const identifierMap = {};
    if (session.user.identifiers) {
        session.user.identifiers.forEach(identifier => {
            if (identifier.type === 'email') identifierMap.email = identifier.value;
            if (identifier.type === 'phone') identifierMap.mobileNumber = identifier.value;
            if (identifier.type === 'username') identifierMap.username = identifier.value;
        });
    }

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: {
            id: session.user.id,
            username: identifierMap.username || null,
            email: identifierMap.email || null,
            mobileNumber: identifierMap.mobileNumber || null,
            accountType: session.user.accountType,
            authRole: session.user.authRole,
            isActive: session.user.isActive
        }
    };
};

/**
 * Logout user - revoke refresh token
 * @param {string} refreshToken - Refresh token to revoke
 * @returns {Promise<void>}
 */
const logout = async (refreshToken) => {
    if (!refreshToken) {
        return; // Silent success if no token provided
    }

    const refreshTokenHash = hashToken(refreshToken);
    const session = await repo.findSessionByTokenHash(refreshTokenHash);

    if (session) {
        await repo.revokeSession(session.id);
    }
};

/**
 * Logout from all devices - revoke all user sessions
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const logoutAllDevices = async (userId) => {
    await repo.revokeAllUserSessions(userId);
};

/**
 * Search institutes by name
 * @param {string} searchTerm - Search term for institute name
 * @param {number} limit - Maximum results to return
 * @returns {Promise<Array>} List of matching institutes
 */
const searchInstitutes = async (searchTerm, limit = 10) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
        throw new ApiError(400, 'Search term is required');
    }

    const institutes = await repo.searchInstitutes(searchTerm.trim(), limit);
    
    return institutes.map(inst => ({
        id: inst.id,
        name: inst.name,
        city: inst.city,
        state: inst.state,
        country: inst.country
    }));
};

module.exports = {
    login,
    createAccount,
    searchInstitutes,
    refreshAccessToken,
    logout,
    logoutAllDevices
};