/**
 * Database Connection Module
 * 
 * Configures the centralized database connection (e.g. PostgreSQL pool via 'pg' / Sequelize / Prisma,
 * or MongoDB via Mongoose).
 */
import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

// Fix for Node.js querySrv ECONNREFUSED on Windows / ISP DNS setups
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore fallback if custom dns servers cannot be set
}

export const connectDB = async () => {
  try {
    if (!env.DATABASE_URL) {
      console.log('ℹ️  No DATABASE_URL provided. Running in prototype/in-memory mode.');
      return null;
    }

    const host = env.DATABASE_URL.split('@')[1] || 'configured DB';
    console.log(`🔌 Connecting to database: ${host.split('?')[0]}`);

    const conn = await mongoose.connect(env.DATABASE_URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};
