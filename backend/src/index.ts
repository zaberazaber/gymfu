import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabases, pgPool, redisClient } from './config/database';
import mongoose from 'mongoose';
import logger from './config/logger';
import requestLogger from './middleware/requestLogger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
      process.env.FRONTEND_URL || 'https://gymfu.vercel.app',
      'https://gymfu.vercel.app',
      /\.vercel\.app$/  // Allow all Vercel preview deployments
    ]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

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

// API Routes
const authRoutes = require('./routes/auth').default;
const usersRoutes = require('./routes/users').default;
const profileRoutes = require('./routes/profile').default;
const gymRoutes = require('./routes/gyms').default;
const bookingRoutes = require('./routes/bookings').default;
const paymentRoutes = require('./routes/payments').default;
const marketplaceRoutes = require('./routes/marketplace').default;
const migrateRoutes = require('./routes/migrate').default;
const aiRoutes = require('./routes/ai').default;
const classRoutes = require('./routes/classes').default;
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/users', profileRoutes);
app.use('/api/v1/gyms', gymRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/migrate', migrateRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/classes', classRoutes);
logger.info('🔐 Auth routes enabled at /api/v1/auth');
logger.info('👤 Users routes enabled at /api/v1/users');
logger.info('📝 Profile routes enabled at /api/v1/users/profile');
logger.info('🏋️ Gym routes enabled at /api/v1/gyms');
logger.info('📅 Booking routes enabled at /api/v1/bookings');
logger.info('💳 Payment routes enabled at /api/v1/payments');
logger.info('🛒 Marketplace routes enabled at /api/v1/marketplace');
logger.info('🔄 Migration routes enabled at /api/v1/migrate');
logger.info('🤖 AI routes enabled at /api/v1/ai');
logger.info('🧘 Classes routes enabled at /api/v1/classes');

// Test routes (only in development)
if (process.env.NODE_ENV === 'development') {
  const testRoutes = require('./routes/test').default;
  app.use('/test', testRoutes);
  logger.info('📝 Test routes enabled at /test');
}

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

// Initialize databases and start server
const startServer = async () => {
  try {
    // Initialize database connections
    await initializeDatabases();

    // Initialize AI Provider Manager
    try {
      const { aiProviderManager } = await import('./services/AIProviderManager');
      await aiProviderManager.initialize();
      logger.info('🤖 AI Provider Manager initialized');
    } catch (error) {
      logger.warn('⚠️  AI Provider Manager initialization failed:', error);
      logger.warn('   AI features will not be available');
    }

    // Start server - bind to 0.0.0.0 for cloud platforms like Render
    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📊 Health check available at /health`);
      logger.info(`💾 Database health check at /health/db`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', reason);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
