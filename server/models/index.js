const sequelize = require('../config/database');
const User = require('./user.model');
const Store = require('./store.model');
const Rating = require('./rating.model');

// ── Associations ────────────────────────────────────────────────────────────

// A store belongs to a user (owner)
Store.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });
User.hasOne(Store, { foreignKey: 'owner_id', as: 'ownedStore' });

// A user can submit many ratings
User.hasMany(Rating, { foreignKey: 'user_id', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// A store can have many ratings
Store.hasMany(Rating, { foreignKey: 'store_id', as: 'ratings', onDelete: 'CASCADE' });
Rating.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// ── Sync DB ─────────────────────────────────────────────────────────────────
const syncDB = async () => {
  try {
    // alter:true updates existing tables without dropping data
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced successfully.');
  } catch (err) {
    console.error('❌ Failed to sync database:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, syncDB, User, Store, Rating };
