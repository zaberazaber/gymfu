import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function initMongoDB() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/gymfu';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Create a test collection to initialize the database
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // Create collections if they don't exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    if (!collectionNames.includes('users')) {
      await db.createCollection('users');
      console.log('✅ Created "users" collection');
    }

    if (!collectionNames.includes('sessions')) {
      await db.createCollection('sessions');
      console.log('✅ Created "sessions" collection');
    }

    if (!collectionNames.includes('otps')) {
      await db.createCollection('otps');
      console.log('✅ Created "otps" collection');
    }

    if (!collectionNames.includes('notifications')) {
      await db.createCollection('notifications');
      console.log('✅ Created "notifications" collection');
    }

    console.log('\n🎉 MongoDB database "gymfu" initialized successfully!');
    console.log('You can now see it in MongoDB Compass');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing MongoDB:', error);
    process.exit(1);
  }
}

initMongoDB();
