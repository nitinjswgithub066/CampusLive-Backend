'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_profiles', {
      user_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      profile_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },

      streaming_id: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true,
      },

      full_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      dob: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: false,
      },

      institute_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'institutes',
          key: 'id',
        },
        onDelete: 'SET NULL',
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('user_profiles');
  }
};