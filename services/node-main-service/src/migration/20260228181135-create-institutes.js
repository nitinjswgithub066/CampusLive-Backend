'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('institutes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('(UUID())'),
        primaryKey: true,
        allowNull: false,
      },

      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });

    await queryInterface.addIndex('institutes', ['name']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('institutes');
  }
};