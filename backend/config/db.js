import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod = null;

export const connectDB = async () => {
  const connStr = process.env.MONGO_URI;

  if (connStr) {
    try {
      console.log('Connecting to MongoDB Atlas...');
      const conn = await mongoose.connect(connStr, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log(`✅  MongoDB Atlas Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌  MongoDB Atlas connection failed (${error.message}).`);
      if (error.message.includes('SSL') || error.message.includes('alert number 80')) {
        console.warn('📌  REASON: MongoDB Atlas is rejecting the connection (SSL Alert 80).');
        console.warn('👉  FIX: Add your IP address to MongoDB Atlas:');
        console.warn('    1. Open https://cloud.mongodb.com and log in.');
        console.warn('    2. Go to "Network Access" under Security.');
        console.warn('    3. Click "+ Add IP Address" and select "ALLOW ACCESS FROM ANYWHERE" (0.0.0.0/0).');
        console.warn('    4. Click "Confirm". Connection will succeed automatically within ~1 minute.');
      }
      console.warn('Falling back to local MongoMemoryServer so the app remains fully functional...');
    }
  }

  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`✅  Connected to MongoMemoryServer fallback at ${uri}`);
  } catch (memErr) {
    console.error(`❌  MongoDB Memory Server failed: ${memErr.message}`);
    process.exit(1);
  }
};
