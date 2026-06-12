const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      validate: {
        len: {
          args: [20, 60],
          msg: 'Name must be between 20 and 60 characters.',
        },
        notEmpty: { msg: 'Name is required.' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'This email address is already registered.' },
      validate: {
        isEmail: { msg: 'Please enter a valid email address.' },
        notEmpty: { msg: 'Email is required.' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password is required.' },
      },
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: true,
      validate: {
        len: {
          args: [0, 400],
          msg: 'Address must not exceed 400 characters.',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'user', 'store_owner'),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [['admin', 'user', 'store_owner']],
          msg: 'Role must be admin, user, or store_owner.',
        },
      },
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    // Never return password in default queries
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
  }
);

module.exports = User;
