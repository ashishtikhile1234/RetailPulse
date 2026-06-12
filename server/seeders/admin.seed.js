require('dotenv').config();
const bcrypt = require('bcryptjs');
const { syncDB, User } = require('../models');

const seedAdmin = async () => {
  try {
    await syncDB();

    const existing = await User.unscoped().findOne({
      where: { email: 'admin@retailpulse.com' },
    });

    if (existing) {
      console.log('⚠️  Admin user already exists — skipping seed.');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 12);

    await User.create({
      name: 'RetailPulse System Administrator',
      email: 'admin@retailpulse.com',
      password: hashedPassword,
      address: '123 Admin Street, Platform City, PC 00001',
      role: 'admin',
    });

    console.log('✅ Default admin user created successfully.');
    console.log('   Email   : admin@retailpulse.com');
    console.log('   Password: Admin@123');
    console.log('   ⚠️  Change this password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
