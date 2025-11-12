import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabases, pgPool, redisClient } from './config/database';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'GYMFU API is running',
    timestamp: new Date().toISOString(),
  });
});

// Database health check endpoint
app.get('/health/db', async (req: Request, res: Response) => {
  const health = {
    postgres: false,
    mongodb: false,
    redis: false,
  };

  try {
    // Check PostgreSQL
    const pgClient = await pgPool.connect();
    await pgClient.query('SELECT 1');
    pgClient.release();
    health.postgres = true;
  } catch (error) {
    console.error('PostgreSQL health check failed:', error);
  }

  try {
    // Check MongoDB
    health.mongodb = mongoose.connection.readyState === 1;
  } catch (error) {
    console.error('MongoDB health check failed:', error);
  }

  try {
    // Check Redis
    health.redis = redisClient.isOpen;
  } catch (error) {
    console.error('Redis health check failed:', error);
  }

  const allHealthy = health.postgres && health.mongodb && health.redis;

  res.status(allHealthy ? 200 : 503).json({
    success: allHealthy,
    databases: health,
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to GYMFU API',
    version: '1.0.0',
  });
});

// Initialize databases and start server
const startServer = async () => {
  try {
    // Initialize database connections
    await initializeDatabases();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📊 Health check available at http://localhost:${PORT}/health`);
      console.log(`💾 Database health check at http://localhost:${PORT}/health/db`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
