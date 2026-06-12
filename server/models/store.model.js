const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define(
  'Store',
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
          msg: 'Store name must be between 20 and 60 characters.',
        },
        notEmpty: { msg: 'Store name is required.' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: { msg: 'A store with this email already exists.' },
      validate: {
        isEmail: { msg: 'Please enter a valid email address.' },
        notEmpty: { msg: 'Store email is required.' },
      },
    },
    address: {
      type: DataTypes.STRING(400),
      allowNull: false,
      validate: {
        len: {
          args: [1, 400],
          msg: 'Address must not exceed 400 characters.',
        },
        notEmpty: { msg: 'Store address is required.' },
      },
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  },
  {
    tableName: 'stores',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Store;
