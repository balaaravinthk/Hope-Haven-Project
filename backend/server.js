import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { seedAdminUsers } from './src/config/seedAdmins.js';

const PORT = env.PORT || 5000;

// Initialize Database Connection & Seed Admins
await connectDB();
await seedAdminUsers();

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  HOPE HAVEN Backend API Server Running`);
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  API Health:   http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
