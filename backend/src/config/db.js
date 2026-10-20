/**
 * Database Connection Module
 * 
 * Centralized MongoDB connection using Mongoose.
 * Supports connection pooling, DNS fallback for SRV resolution,
 * event monitoring, and graceful process shutdown.
 */
import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env.js';

// Fallback public DNS servers to resolve MongoDB Atlas SRV records
// across restrictive ISPs and local Windows network setups
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Retain system DNS if overriding fails
}

/**
 * Connect to MongoDB via Mongoose
 * @returns {Promise<typeof mongoose | null>}
 */
export const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!env.DATABASE_URL) {
    console.warn('⚠️  No DATABASE_URL provided. Running in offline/prototype mode.');
    return null;
  }

  const maskedTarget = env.DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`🔌 Connecting to MongoDB Atlas: ${maskedTarget.split('?')[0]}`);

  try {
    const conn = await mongoose.connect(env.DATABASE_URL, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true, // Build indexes automatically in development
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} / DB: ${conn.connection.name}`);

    // Register runtime connection event handlers
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB runtime error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully.');
    });

    return conn;
  } catch (error) {
    console.error('❌ MongoDB initial connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Gracefully close database connection (useful for tests and shutdown)
 */
export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed gracefully.');
  }
};

export default connectDB;
