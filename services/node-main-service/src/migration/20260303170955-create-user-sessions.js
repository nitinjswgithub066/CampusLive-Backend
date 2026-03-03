'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_sessions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        primaryKey: true,
        allowNull: false,
      },

      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      refresh_token_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      device_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },

      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
      },

      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },

      revoked_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });

    await queryInterface.addIndex('user_sessions', ['user_id']);
    await queryInterface.addIndex('user_sessions', ['expires_at']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_sessions');
  }
};