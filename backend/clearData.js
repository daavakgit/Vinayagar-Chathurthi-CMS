import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const clearDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://daavakjaganathan10_db_user:Nuo5bsXo9yYx5PgV@cluster0.gepunmh.mongodb.net/vcms?retryWrites=true&w=majority&appName=Cluster0';
    console.log('Connecting to MongoDB Atlas to clear all data...');
    await mongoose.connect(mongoUri);

    const db = mongoose.connection.db;
    const resColls = await db.collection('collections').deleteMany({});
    const resExp = await db.collection('expenses').deleteMany({});
    const resSpl = await db.collection('splits').deleteMany({});
    const resRec = await db.collection('recoveries').deleteMany({});

    console.log(`✅ CLEARED: ${resColls.deletedCount} collections, ${resExp.deletedCount} expenses, ${resSpl.deletedCount} splits, ${resRec.deletedCount} recoveries.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to clear database:', err.message);
    process.exit(1);
  }
};

clearDB();
