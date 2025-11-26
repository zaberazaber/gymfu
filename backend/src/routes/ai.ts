import express, { Request, Response } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { aiProviderManager } from '../services/AIProviderManager';
import { cacheManager } from '../services/CacheManager';
import { aiService } from '../services/AIService';
import {
  analyzeWorkout,
  logWorkout,
  getWorkoutHistory,
  updateFitnessProfile,
  getFitnessProfile,
} from '../controllers/aiWorkoutController';

const router = express.Router();

/**
 * Health check for AI service
 * GET /api/v1/ai/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const providerHealth = await aiProviderManager.checkHealth();
    const cacheAvailable = await cacheManager.isAvailable();
    const cacheStats = await cacheManager.getStats();

    res.status(200).json({
      success: true,
      data: {
        providers: providerHealth,
        cache: {
          available: cacheAvailable,
          stats: cacheStats,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to check AI service health',
      error: error.message,
    });
  }
});

/**
 * Get AI usage statistics
 * GET /api/v1/ai/stats
 */
router.get('/stats', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId.toString();
    const stats = await aiService.getUsageStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI usage statistics',
      error: error.message,
    });
  }
});

/**
 * Get AI interaction history
 * GET /api/v1/ai/history
 */
router.get('/history', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId.toString();
    const type = req.query.type as string | undefined;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await aiService.getUserHistory(userId, type, limit);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to get AI interaction history',
      error: error.message,
    });
  }
});

/**
 * Clear user's AI cache
 * DELETE /api/v1/ai/cache
 */
router.delete('/cache', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId.toString();
    await aiService.clearUserCache(userId);

    res.status(200).json({
      success: true,
      message: 'AI cache cleared successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear AI cache',
      error: error.message,
    });
  }
});

/**
 * Chat with AI fitness coach
 * POST /api/v1/ai/chat
 */
router.post('/chat', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId.toString();
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string',
      });
    }

    // Generate AI response
    const response = await aiService.generateCompletion(
      userId,
      'chat',
      message,
      {
        maxTokens: 500,
        temperature: 0.7,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get AI response',
      error: error.message,
    });
  }
});

// Fitness Profile Routes
router.post('/fitness-profile', authenticate, updateFitnessProfile);
router.get('/fitness-profile', authenticate, getFitnessProfile);

// Workout Routes
router.post('/workout', authenticate, logWorkout);
router.get('/workout/history', authenticate, getWorkoutHistory);
router.get('/analyze/workout', authenticate, analyzeWorkout);

export default router;
