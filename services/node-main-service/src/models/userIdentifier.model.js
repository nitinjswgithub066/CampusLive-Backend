const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const UserIdentifier = sequelize.define(
    'UserIdentifier',
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
        type: {
            type: DataTypes.ENUM('email', 'phone', 'username'),
            allowNull: false,
        },
        value: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            field: 'is_verified'
        }
    },
    {
        tableName: 'user_identifiers',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        indexes: [
            {
                unique: true,
                fields: ['type', 'value'],
                name: 'unique_identifier_per_type'
            },
            {
                fields: ['user_id']
            }
        ]
    }
);

module.exports = UserIdentifier;
