const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const UserSession = sequelize.define(
    'UserSession',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            field: 'user_id',
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        refreshTokenHash: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'refresh_token_hash'
        },
        deviceId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'device_id'
        },
        ipAddress: {
            type: DataTypes.STRING(45),
            allowNull: true,
            field: 'ip_address'
        },
        userAgent: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'user_agent'
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'expires_at'
        },
        revokedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'revoked_at'
        }
    },
    {
        tableName: 'user_sessions',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['user_id']
            },
            {
                fields: ['expires_at']
            }
        ]
    }
);

module.exports = UserSession;
