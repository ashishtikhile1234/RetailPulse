require('dotenv').config();
const app = require('./app');
const { syncDB } = require('./models');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await syncDB();
  app.listen(PORT, () => {
    console.log(`\n🚀 RetailPulse API running on http://localhost:${PORT}`);
    console.log(`   Environment : ${process.env.NODE_ENV}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
};

startServer();
