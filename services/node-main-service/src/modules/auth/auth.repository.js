const { Users, UserIdentifier, UserProfile, Institute, UserSession } = require('../../models');
const { Op } = require('sequelize');
const sequelize = require('../../config/sequelize');
const { generateProfileId, generateStreamingId } = require('../../utils/generateId');

/**
 * Find user by any identifier (email, phone, or username)
 * @param {string} identifier - The identifier value to search for
 * @returns {Promise<Object|null>} User object with identifiers or null
 */
const findByIdentifier = async (identifier) => {
  const userIdentifier = await UserIdentifier.findOne({
    where: { value: identifier },
    include: [{
      model: Users,
      as: 'user',
      required: true
    }]
  });

  if (!userIdentifier) {
    return null;
  }

  // Get all identifiers for this user
  const allIdentifiers = await UserIdentifier.findAll({
    where: { userId: userIdentifier.user.id }
  });

  // Format the response
  const user = userIdentifier.user.toJSON();
  user.identifiers = allIdentifiers;
  
  return user;
};

/**
 * Find identifier by type and value
 * @param {string} type - email, phone, or username
 * @param {string} value - The identifier value
 * @returns {Promise<Object|null>}
 */
const findIdentifierByTypeAndValue = async (type, value) => {
  return await UserIdentifier.findOne({
    where: { type, value }
  });
};

/**
 * Check if email exists
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const findByEmail = async (email) => {
  const identifier = await UserIdentifier.findOne({
    where: { type: 'email', value: email }
  });
  return !!identifier;
};

/**
 * Check if username exists
 * @param {string} username
 * @returns {Promise<boolean>}
 */
const findByUsername = async (username) => {
  const identifier = await UserIdentifier.findOne({
    where: { type: 'username', value: username }
  });
  return !!identifier;
};

/**
 * Check if phone exists
 * @param {string} phone
 * @returns {Promise<boolean>}
 */
const findByPhone = async (phone) => {
  const identifier = await UserIdentifier.findOne({
    where: { type: 'phone', value: phone }
  });
  return !!identifier;
};

/**
 * Generate a unique profile ID (with collision check)
 * @returns {Promise<string>} Unique profile ID
 */
const generateUniqueProfileId = async () => {
  let profileId;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    profileId = generateProfileId();
    const existingProfile = await UserProfile.findOne({ where: { profileId } });
    exists = !!existingProfile;
    attempts++;
  }

  if (exists) {
    throw new Error('Failed to generate unique profile ID');
  }

  return profileId;
};

/**
 * Generate a unique streaming ID (with collision check)
 * @returns {Promise<string>} Unique streaming ID
 */
const generateUniqueStreamingId = async () => {
  let streamingId;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    streamingId = generateStreamingId();
    const existingProfile = await UserProfile.findOne({ where: { streamingId } });
    exists = !!existingProfile;
    attempts++;
  }

  if (exists) {
    throw new Error('Failed to generate unique streaming ID');
  }

  return streamingId;
};

/**
 * Create a new user with identifiers and profile
 * @param {Object} userData - User data including identifiers and profile info
 * @returns {Promise<Object>} Created user with identifiers and profile
 */
const createUser = async (userData) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Create the user record
    const user = await Users.create({
      passwordHash: userData.password,
      accountType: userData.accountType || 'student',
      authRole: 'user',
      isActive: true
    }, { transaction });

    // Create user identifiers
    const identifiers = [];
    
    if (userData.username) {
      identifiers.push({
        userId: user.id,
        type: 'username',
        value: userData.username,
        isVerified: false
      });
    }
    
    if (userData.email) {
      identifiers.push({
        userId: user.id,
        type: 'email',
        value: userData.email,
        isVerified: false
      });
    }
    
    if (userData.mobileNumber) {
      identifiers.push({
        userId: user.id,
        type: 'phone',
        value: userData.mobileNumber,
        isVerified: false
      });
    }

    await UserIdentifier.bulkCreate(identifiers, { transaction });

    // Create user profile if profile data is provided
    if (userData.fullName && userData.dob && userData.gender) {
      const profileId = await generateUniqueProfileId();
      const streamingId = await generateUniqueStreamingId();

      await UserProfile.create({
        userId: user.id,
        profileId,
        streamingId,
        fullName: userData.fullName,
        dob: userData.dob,
        gender: userData.gender,
        instituteId: userData.instituteId || null
      }, { transaction });
    }

    await transaction.commit();

    // Fetch the created user with identifiers and profile
    const createdUser = await Users.findByPk(user.id, {
      include: [
        {
          model: UserIdentifier,
          as: 'identifiers'
        },
        {
          model: UserProfile,
          as: 'profile'
        }
      ]
    });

    return createdUser;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Find institute by ID
 * @param {string} id - Institute ID
 * @returns {Promise<Object|null>}
 */
const findInstituteById = async (id) => {
  return await Institute.findByPk(id);
};

/**
 * Find institute by name (exact match, case-insensitive)
 * @param {string} name - Institute name
 * @returns {Promise<Object|null>}
 */
const findInstituteByName = async (name) => {
  return await Institute.findOne({
    where: {
      name: {
        [Op.like]: name
      }
    }
  });
};

/**
 * Search institutes by name (partial match, case-insensitive)
 * @param {string} searchTerm - Search term
 * @param {number} limit - Maximum results to return
 * @returns {Promise<Array>}
 */
const searchInstitutes = async (searchTerm, limit = 10) => {
  return await Institute.findAll({
    where: {
      name: {
        [Op.like]: `%${searchTerm}%`
      }
    },
    limit,
    order: [['name', 'ASC']]
  });
};

/**
 * Get all institutes
 * @param {number} limit - Maximum results to return
 * @returns {Promise<Array>}
 */
const getAllInstitutes = async (limit = 100) => {
  return await Institute.findAll({
    limit,
    order: [['name', 'ASC']]
  });
};

/**
 * Create a new institute
 * @param {Object} instituteData - Institute data (name, city, state, country)
 * @returns {Promise<Object>}
 */
const createInstitute = async (instituteData) => {
  return await Institute.create(instituteData);
};

/**
 * Create a user session
 * @param {Object} sessionData - Session data (userId, refreshTokenHash, deviceId, ipAddress, userAgent, expiresAt)
 * @returns {Promise<Object>} Created session
 */
const createSession = async (sessionData) => {
  return await UserSession.create(sessionData);
};

/**
 * Find session by refresh token hash
 * @param {string} refreshTokenHash - Hashed refresh token
 * @returns {Promise<Object|null>} Session or null
 */
const findSessionByTokenHash = async (refreshTokenHash) => {
  return await UserSession.findOne({
    where: {
      refreshTokenHash,
      revokedAt: null,
      expiresAt: {
        [Op.gt]: new Date()
      }
    },
    include: [{
      model: Users,
      as: 'user',
      include: [{
        model: UserIdentifier,
        as: 'identifiers'
      }]
    }]
  });
};

/**
 * Revoke a session
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
const revokeSession = async (sessionId) => {
  await UserSession.update(
    { revokedAt: new Date() },
    { where: { id: sessionId } }
  );
};

/**
 * Revoke all user sessions
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const revokeAllUserSessions = async (userId) => {
  await UserSession.update(
    { revokedAt: new Date() },
    { where: { userId, revokedAt: null } }
  );
};

/**
 * Delete expired sessions
 * @returns {Promise<number>} Number of deleted sessions
 */
const deleteExpiredSessions = async () => {
  const result = await UserSession.destroy({
    where: {
      expiresAt: {
        [Op.lt]: new Date()
      }
    }
  });
  return result;
};

/**
 * Get active sessions for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Active sessions
 */
const getUserActiveSessions = async (userId) => {
  return await UserSession.findAll({
    where: {
      userId,
      revokedAt: null,
      expiresAt: {
        [Op.gt]: new Date()
      }
    },
    order: [['created_at', 'DESC']]
  });
};

module.exports = {
  findByIdentifier,
  findIdentifierByTypeAndValue,
  findByEmail,
  findByUsername,
  findByPhone,
  createUser,
  findInstituteById,
  findInstituteByName,
  searchInstitutes,
  getAllInstitutes,
  createInstitute,
  createSession,
  findSessionByTokenHash,
  revokeSession,
  revokeAllUserSessions,
  deleteExpiredSessions,
  getUserActiveSessions,
};
