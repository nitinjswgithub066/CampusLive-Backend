const Users = require('./users.model');
const UserIdentifier = require('./userIdentifier.model');
const UserProfile = require('./userProfile.model');
const Institute = require('./institute.model');
const UserSession = require('./userSession.model');

// Define associations
Users.hasMany(UserIdentifier, {
    foreignKey: 'userId',
    as: 'identifiers',
    onDelete: 'CASCADE'
});

UserIdentifier.belongsTo(Users, {
    foreignKey: 'userId',
    as: 'user'
});

Users.hasOne(UserProfile, {
    foreignKey: 'userId',
    as: 'profile',
    onDelete: 'CASCADE'
});

UserProfile.belongsTo(Users, {
    foreignKey: 'userId',
    as: 'user'
});

Institute.hasMany(UserProfile, {
    foreignKey: 'instituteId',
    as: 'profiles'
});

UserProfile.belongsTo(Institute, {
    foreignKey: 'instituteId',
    as: 'institute'
});

Users.hasMany(UserSession, {
    foreignKey: 'userId',
    as: 'sessions',
    onDelete: 'CASCADE'
});

UserSession.belongsTo(Users, {
    foreignKey: 'userId',
    as: 'user'
});

module.exports = {
    Users,
    UserIdentifier,
    UserProfile,
    Institute,
    UserSession
};