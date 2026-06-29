import { QueryInterface, DataTypes } from 'sequelize';

/**
 * Migration schema for users table
 * Creates the users table with all required fields and constraints
 */
export const createUsersTable = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  // Add index for faster email lookups
  await queryInterface.addIndex('users', ['email'], {
    name: 'idx_users_email',
  });
};

/**
 * Rollback migration for users table
 */
export const dropUsersTable = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('users');
};