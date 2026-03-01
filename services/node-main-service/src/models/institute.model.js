const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Institute = sequelize.define(
    'Institute',
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: true,
        }
    },
    {
        tableName: 'institutes',
        timestamps: true,
        underscored: true,
        createdAt: 'created_at',
        updatedAt: false,
        indexes: [
            {
                fields: ['name']
            }
        ]
    }
);

module.exports = Institute;
