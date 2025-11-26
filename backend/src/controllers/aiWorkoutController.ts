import { Request, Response } from 'express';
import { aiService } from '../services/AIService';
import { promptBuilder } from '../services/PromptBuilder';
import FitnessProfile from '../models/FitnessProfile';
import Workout from '../models/Workout';

/**
 * Analyze user's workout patterns
 * GET /api/v1/ai/analyze/workout
 */
export const analyzeWorkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId.toString();

    // Fetch user's fitness profile
    const fitnessProfile = await FitnessProfile.findOne({ userId });

    // Fetch recent workouts (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentWorkouts = await Workout.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    })
      .sort({ date: -1 })
      .limit(20)
      .lean();

    // Check minimum data requirement
    if (recentWorkouts.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Need at least 3 workouts for analysis. Keep logging your workouts!',
        data: {
          currentWorkouts: recentWorkouts.length,
          required: 3,
        },
      });
    }

    // Build context
    const context = {
      fitnessProfile: fitnessProfile ? {
        goals: fitnessProfile.goals,
        fitnessLevel: fitnessProfile.fitnessLevel,
        height: fitnessProfile.height,
        weight: fitnessProfile.weight,
        age: fitnessProfile.age,
        gender: fitnessProfile.gender,
        availableEquipment: fitnessProfile.availableEquipment,
      } : undefined,
      recentWorkouts: recentWorkouts.map(w => ({
        date: w.date,
        exercises: w.exercises,
        duration: w.duration,
        intensity: w.intensity,
        completed: w.completed,
      })),
    };

    // Build prompt
    const prompt = promptBuilder.buildWorkoutAnalysisPrompt(context);

    // Generate AI analysis
    const response = await aiService.generateCompletion(
      userId,
      'workout_analysis',
      prompt,
      {
        maxTokens: 800,
        temperature: 0.7,
        systemPrompt: 'You are a professional fitness coach. Always respond with valid JSON.',
      }
    );

    // Parse response
    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch (error) {
      // If JSON parsing fails, create structured response from text
      analysis = {
        insights: [response.substring(0, 200)],
        recommendations: ['Continue tracking your workouts for better analysis'],
        nextSteps: ['Keep up the great work!'],
      };
    }

    res.status(200).json({
      success: true,
      data: {
        analysis,
        workoutCount: recentWorkouts.length,
        analysisDate: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Error analyzing workout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze workout data',
      error: error.message,
    });
  }
};

/**
 * Log a new workout
 * POST /api/v1/ai/workout
 */
export const logWorkout = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId.toString();
    const { exercises, duration, intensity, notes, date } = req.body;

    // Validate input
    if (!exercises || !Array.isArray(exercises) || exercises.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one exercise is required',
      });
    }

    if (!duration || duration < 1) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be at least 1 minute',
      });
    }

    if (!intensity || !['low', 'medium', 'high'].includes(intensity)) {
      return res.status(400).json({
        success: false,
        message: 'Intensity must be low, medium, or high',
      });
    }

    // Create workout
    const workout = await Workout.create({
      userId,
      date: date ? new Date(date) : new Date(),
      exercises,
      duration,
      intensity,
      notes,
      completed: true,
    });

    res.status(201).json({
      success: true,
      message: 'Workout logged successfully',
      data: workout,
    });
  } catch (error: any) {
    console.error('Error logging workout:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log workout',
      error: error.message,
    });
  }
};

/**
 * Get user's workout history
 * GET /api/v1/ai/workout/history
 */
export const getWorkoutHistory = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId.toString();
    const limit = parseInt(req.query.limit as string) || 30;
    const offset = parseInt(req.query.offset as string) || 0;

    const workouts = await Workout.find({ userId })
      .sort({ date: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    const total = await Workout.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: {
        workouts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting workout history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get workout history',
      error: error.message,
    });
  }
};

/**
 * Create or update fitness profile
 * POST /api/v1/ai/fitness-profile
 */
export const updateFitnessProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId.toString();
    const profileData = req.body;

    // Validate fitness level
    if (profileData.fitnessLevel && !['beginner', 'intermediate', 'advanced'].includes(profileData.fitnessLevel)) {
      return res.status(400).json({
        success: false,
        message: 'Fitness level must be beginner, intermediate, or advanced',
      });
    }

    // Update or create profile
    const profile = await FitnessProfile.findOneAndUpdate(
      { userId },
      { ...profileData, userId },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Fitness profile updated successfully',
      data: profile,
    });
  } catch (error: any) {
    console.error('Error updating fitness profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update fitness profile',
      error: error.message,
    });
  }
};

/**
 * Get user's fitness profile
 * GET /api/v1/ai/fitness-profile
 */
export const getFitnessProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId.toString();

    const profile = await FitnessProfile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Fitness profile not found. Create one to get started!',
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error getting fitness profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fitness profile',
      error: error.message,
    });
  }
};
