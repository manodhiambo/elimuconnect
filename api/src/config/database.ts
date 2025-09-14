import mongoose from 'mongoose';
import { logger } from '@elimuconnect/shared/utils';

export async function connectDatabase(): Promise<void> {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/elimuconnect';
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      writeConcern: { w: 'majority' }
    });

    logger.info('📊 MongoDB connected successfully');
    logger.info(`📍 Database: ${mongoUri.replace(/\/\/.*@/, '//***:***@')}`);

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('📊 MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('📊 MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('📊 MongoDB connection closed through app termination');
    });

  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
}
