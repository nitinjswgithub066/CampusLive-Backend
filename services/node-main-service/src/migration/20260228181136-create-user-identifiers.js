'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_identifiers', {
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

      type: {
        type: Sequelize.ENUM('email', 'phone', 'username'),
        allowNull: false,
      },

      value: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      is_verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },

      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      }
    });

    await queryInterface.addConstraint('user_identifiers', {
      fields: ['type', 'value'],
      type: 'unique',
      name: 'unique_identifier_per_type'
    });

    await queryInterface.addIndex('user_identifiers', ['user_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_identifiers');
  }
};