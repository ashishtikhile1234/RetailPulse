const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Rating = sequelize.define(
  'Rating',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    store_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'stores', key: 'id' },
      onDelete: 'CASCADE',
    },
    value: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: {
        min: { args: [1], msg: 'Rating must be at least 1.' },
        max: { args: [5], msg: 'Rating must be at most 5.' },
        isInt: { msg: 'Rating must be a whole number.' },
      },
    },
  },
  {
    tableName: 'ratings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        // Enforce one rating per user per store
        unique: true,
        fields: ['user_id', 'store_id'],
        name: 'ratings_user_store_unique',
      },
    ],
  }
);

module.exports = Rating;
