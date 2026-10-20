import dotenv from 'dotenv';
import mongoose from 'mongoose';
import dns from 'dns';

// Fix for Node.js querySrv ECONNREFUSED on some Windows / ISP DNS setups
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore if custom dns servers cannot be set
}

// Load environment variables from .env
dotenv.config();

const uri = process.env.DATABASE_URL;

console.log('====================================================');
console.log('           MongoDB Atlas Connection Test            ');
console.log('====================================================');

if (!uri) {
  console.error('❌ Error: DATABASE_URL is not set in backend/.env');
  process.exit(1);
}

// Mask password in logs for safety
const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
console.log(`📡 Target URI: ${maskedUri}`);
console.log('⏳ Attempting to connect to MongoDB Atlas...');

async function testConnection() {
  try {
    const startTime = Date.now();

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    const elapsed = Date.now() - startTime;
    console.log(`✅ Successfully connected to MongoDB Atlas in ${elapsed}ms!`);

    const db = mongoose.connection.db;
    console.log(`📦 Connected Database: ${db.databaseName}`);

    // Ping the admin database
    const pingResult = await db.admin().ping();
    console.log('🏓 Ping result:', pingResult);

    // Perform a quick write/read test in a health check collection
    console.log('📝 Testing Read/Write operations...');
    const testCollection = db.collection('_atlas_connection_test');
    const testDoc = { test: true, timestamp: new Date() };

    const insertResult = await testCollection.insertOne(testDoc);
    console.log(`   - Insert OK (ID: ${insertResult.insertedId})`);

    const foundDoc = await testCollection.findOne({ _id: insertResult.insertedId });
    console.log(`   - Read OK (Found document created at: ${foundDoc.timestamp})`);

    await testCollection.deleteOne({ _id: insertResult.insertedId });
    console.log('   - Cleanup OK (Temporary test document removed)');

    console.log('====================================================');
    console.log('🎉 MongoDB Atlas is fully working and operational!');
    console.log('====================================================');
  } catch (err) {
    console.error('\n❌ Connection Failed!');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);

    console.log('\n💡 Common MongoDB Atlas Troubleshooting Tips:');
    if (err.message.includes('bad auth') || err.message.includes('Authentication failed')) {
      console.log('   1. Invalid username or password in DATABASE_URL.');
      console.log('      Verify your database user in Atlas > Database Access.');
    } else if (err.message.includes('ETIMEDOUT') || err.message.includes('Server selection timed out') || err.name === 'MongooseServerSelectionError') {
      console.log('   1. IP Access List issue: Your current IP address might not be allowed in Atlas.');
      console.log('      Go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0) or add current IP.');
      console.log('   2. Network/Firewall/VPN blocking port 27017 or DNS query.');
    } else {
      console.log('   - Verify connection string syntax in backend/.env');
      console.log('   - Ensure network access is configured in MongoDB Atlas (Network Access tab)');
    }
    process.exitCode = 1;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('🔌 Disconnected cleanly.');
    }
  }
}

testConnection();
