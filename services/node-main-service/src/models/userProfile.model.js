const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const UserProfile = sequelize.define(
    'UserProfile',
    {
        userId: {
            type: DataTypes.UUID,
            primaryKey: true,
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        profileId: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
            field: 'profile_id'
        },
        streamingId: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true,
            field: 'streaming_id'
        },
        fullName: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'full_name'
        },
        dob: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        gender: {
            type: DataTypes.ENUM('male', 'female', 'other'),
            allowNull: false,
        },
        instituteId: {
            type: DataTypes.UUID,
            allowNull: true,
            field: 'institute_id',
            references: {
                model: 'institutes',
                key: 'id',
            },
            onDelete: 'SET NULL',
        }
    },
    {
        tableName: 'user_profiles',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
);

module.exports = UserProfile;
