import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';

const PORT = env.PORT || 5000;

// Initialize Database Connection
await connectDB();

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  HOPE HAVEN Backend API Server Running`);
  console.log(`  Environment: ${env.NODE_ENV}`);
  console.log(`  Listening on: http://localhost:${PORT}`);
  console.log(`  API Health:   http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
