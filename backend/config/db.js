import mongoose from 'mongoose';

export const connectDB = async () => {
  const connStr = process.env.MONGO_URI;

  // MongoDB URI is required
  if (!connStr) {
    throw new Error('MONGO_URI is not configured.');
  }

  try {
    console.log('Connecting to MongoDB Atlas...');

    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `❌ MongoDB Atlas connection failed: ${error.message}`
    );

    // Do NOT fall back to MongoMemoryServer in production.
    // The application must use MongoDB Atlas as the real database.
    throw error;
  }
};