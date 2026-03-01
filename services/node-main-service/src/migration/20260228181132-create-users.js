'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        primaryKey: true,
        allowNull: false,
      },

      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      auth_role: {
        type: Sequelize.ENUM('user', 'admin'),
        defaultValue: 'user',
      },

      account_type: {
        type: Sequelize.ENUM('student', 'business', 'professional', 'other'),
        allowNull: false,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },

      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users');
  }
};