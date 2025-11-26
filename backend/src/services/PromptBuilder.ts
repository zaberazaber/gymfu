/**
 * PromptBuilder - Constructs optimized prompts for AI providers
 * 
 * This service formats user context and data into effective prompts
 * that generate high-quality AI responses for fitness coaching.
 */

export interface UserContext {
  fitnessProfile?: {
    goals: string[];
    fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
    height?: number;
    weight?: number;
    age?: number;
    gender?: string;
    dietaryPreferences?: string[];
    medicalConditions?: string[];
    availableEquipment?: string[];
  };
  recentWorkouts?: Array<{
    date: Date;
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      weight?: number;
      duration?: number;
    }>;
    duration: number;
    intensity: 'low' | 'medium' | 'high';
    completed: boolean;
  }>;
  nutritionLogs?: Array<{
    date: Date;
    meals: Array<{
      type: string;
      items: string[];
      calories: number;
    }>;
    totalCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
  }>;
  progressMetrics?: Array<{
    date: Date;
    weight: number;
    bodyFat?: number;
    measurements?: Record<string, number>;
  }>;
}

export class PromptBuilder {
  private readonly MAX_PROMPT_LENGTH = 3000; // characters

  /**
   * Build prompt for workout analysis
   */
  buildWorkoutAnalysisPrompt(context: UserContext): string {
    const systemPrompt = this.getSystemPrompt('workout_coach');
    const userProfile = this.formatUserProfile(context.fitnessProfile);
    const workoutSummary = this.formatWorkoutSummary(context.recentWorkouts || []);

    const prompt = `${systemPrompt}

USER PROFILE:
${userProfile}

RECENT WORKOUT HISTORY:
${workoutSummary}

TASK:
Analyze this user's workout patterns and provide:
1. Three specific insights about their consistency, progress, and exercise variety
2. Three actionable recommendations for improvement
3. Suggested next steps for their fitness journey

Format your response as JSON with keys: insights (array), recommendations (array), nextSteps (array)
Be specific, supportive, and educational in your advice.`;

    return this.truncatePrompt(prompt);
  }

  /**
   * Build prompt for nutrition analysis
   */
  buildNutritionAnalysisPrompt(context: UserContext): string {
    const systemPrompt = this.getSystemPrompt('nutrition_coach');
    const userProfile = this.formatUserProfile(context.fitnessProfile);
    const nutritionSummary = this.formatNutritionSummary(context.nutritionLogs || []);

    const prompt = `${systemPrompt}

USER PROFILE:
${userProfile}

RECENT NUTRITION LOGS:
${nutritionSummary}

TASK:
Analyze this user's nutritional patterns and provide:
1. Three insights about their macro distribution, calorie consistency, and nutrient intake
2. Three specific meal suggestions that align with their goals and dietary preferences
3. Recommendations for nutritional improvements

Format your response as JSON with keys: insights (array), mealSuggestions (array), recommendations (array)
Respect dietary restrictions: ${context.fitnessProfile?.dietaryPreferences?.join(', ') || 'none'}`;

    return this.truncatePrompt(prompt);
  }

  /**
   * Build prompt for progress analysis
   */
  buildProgressAnalysisPrompt(context: UserContext): string {
    const systemPrompt = this.getSystemPrompt('progress_analyst');
    const userProfile = this.formatUserProfile(context.fitnessProfile);
    const progressSummary = this.formatProgressSummary(context.progressMetrics || []);

    const prompt = `${systemPrompt}

USER PROFILE:
${userProfile}

PROGRESS METRICS:
${progressSummary}

TASK:
Analyze this user's progress trends and provide:
1. Identified trends (positive, plateau, or areas needing adjustment)
2. Achievements and what's working well
3. Specific suggestions to overcome plateaus or continue progress

Format your response as JSON with keys: trends (array), achievements (array), suggestions (array)
Be encouraging and provide actionable insights.`;

    return this.truncatePrompt(prompt);
  }

  /**
   * Build prompt for chat interaction
   */
  buildChatPrompt(message: string, context: UserContext): string {
    const systemPrompt = this.getSystemPrompt('fitness_coach');
    const userProfile = this.formatUserProfile(context.fitnessProfile);
    const recentActivity = this.formatRecentActivity(context);

    // Check for medical keywords
    const medicalKeywords = ['injury', 'pain', 'hurt', 'medication', 'doctor', 'medical', 'condition'];
    const containsMedical = medicalKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );

    const medicalDisclaimer = containsMedical 
      ? '\n\nIMPORTANT: If this involves medical concerns, pain, or injuries, recommend consulting a healthcare professional.'
      : '';

    const prompt = `${systemPrompt}

USER PROFILE:
${userProfile}

RECENT ACTIVITY:
${recentActivity}

USER QUESTION:
${message}

TASK:
Provide a helpful, supportive response to the user's question. Reference their specific data when relevant.
If the question is about exercises, include proper form instructions and safety tips.${medicalDisclaimer}

Respond in a conversational, encouraging tone.`;

    return this.truncatePrompt(prompt);
  }

  /**
   * Build prompt for workout plan generation
   */
  buildWorkoutPlanPrompt(context: UserContext, duration: number, focusAreas?: string[]): string {
    const systemPrompt = this.getSystemPrompt('workout_planner');
    const userProfile = this.formatUserProfile(context.fitnessProfile);
    const equipment = context.fitnessProfile?.availableEquipment?.join(', ') || 'bodyweight only';

    const prompt = `${systemPrompt}

USER PROFILE:
${userProfile}

PLAN REQUIREMENTS:
- Duration: ${duration} weeks
- Focus Areas: ${focusAreas?.join(', ') || 'full body'}
- Available Equipment: ${equipment}
- Fitness Level: ${context.fitnessProfile?.fitnessLevel || 'beginner'}

TASK:
Create a ${duration}-week workout plan that:
1. Balances different muscle groups throughout the week
2. Includes at least 1 rest day per week
3. Progressively increases in difficulty
4. Uses only the available equipment
5. Matches the user's fitness level

Format your response as JSON with this structure:
{
  "weeks": [
    {
      "weekNumber": 1,
      "days": [
        {
          "day": "Monday",
          "focus": "Upper Body",
          "exercises": [
            {"name": "Push-ups", "sets": 3, "reps": 10, "notes": "Keep core tight"}
          ]
        }
      ]
    }
  ],
  "rationale": "Explanation of the plan design"
}`;

    return this.truncatePrompt(prompt);
  }

  /**
   * Build prompt for wellness suggestions
   */
  buildWellnessPrompt(context: UserContext): string {
    const systemPrompt = this.getSystemPrompt('wellness_coach');
    const userProfile = this.formatUserProfile(context.fitnessProfile);
    const workoutFrequency = this.calculateWorkoutFrequency(context.recentWorkouts || []);

    const prompt = `${systemPrompt}

USER PROFILE:
${userProfile}

RECENT ACTIVITY:
- Workout Frequency: ${workoutFrequency.workoutsPerWeek} times per week
- High Intensity Days: ${workoutFrequency.highIntensityDays}
- Consecutive Workout Days: ${workoutFrequency.consecutiveDays}

TASK:
Provide holistic wellness suggestions covering:
1. Sleep recommendations based on their activity level
2. Recovery and rest day suggestions
3. Stress management techniques for fitness enthusiasts

Format your response as JSON with keys: sleep (array), recovery (array), stress (array)
Focus on sustainable lifestyle changes.`;

    return this.truncatePrompt(prompt);
  }

  /**
   * Build prompt for gym business insights
   */
  buildGymInsightsPrompt(gymData: any): string {
    const systemPrompt = this.getSystemPrompt('business_analyst');

    const prompt = `${systemPrompt}

GYM ANALYTICS DATA:
- Total Bookings: ${gymData.bookings?.total || 0}
- Peak Hours: ${gymData.capacity?.peakHours?.join(', ') || 'N/A'}
- Average Capacity: ${gymData.capacity?.average || 0}%
- Member Retention: ${gymData.members?.retention || 0}%
- Active Members: ${gymData.members?.active || 0}

TASK:
Analyze this gym's performance and provide:
1. Usage patterns and trends
2. Specific recommendations for class scheduling based on peak hours
3. Strategies to improve member retention if below 70%
4. Actionable business insights with measurable metrics

Format your response as JSON with keys: usagePatterns (array), recommendations (array), predictions (array)
Be specific and include action verbs (implement, schedule, offer, adjust).`;

    return this.truncatePrompt(prompt);
  }

  /**
   * Get system prompt for different coach types
   */
  private getSystemPrompt(type: string): string {
    const prompts = {
      workout_coach: 'You are a professional fitness coach specializing in workout analysis and training optimization.',
      nutrition_coach: 'You are a certified nutrition coach specializing in fitness nutrition and meal planning.',
      progress_analyst: 'You are a fitness progress analyst who helps people understand their fitness journey.',
      fitness_coach: 'You are a supportive fitness coach who provides personalized guidance and motivation.',
      workout_planner: 'You are an expert workout program designer who creates effective, personalized training plans.',
      wellness_coach: 'You are a holistic wellness coach focusing on recovery, sleep, and stress management for athletes.',
      business_analyst: 'You are a fitness business consultant who analyzes gym operations and provides strategic recommendations.',
    };

    return prompts[type as keyof typeof prompts] || prompts.fitness_coach;
  }

  /**
   * Format user profile for prompts
   */
  private formatUserProfile(profile?: UserContext['fitnessProfile']): string {
    if (!profile) return 'No profile information available.';

    const parts = [];
    
    if (profile.goals?.length) {
      parts.push(`Goals: ${profile.goals.join(', ')}`);
    }
    if (profile.fitnessLevel) {
      parts.push(`Fitness Level: ${profile.fitnessLevel}`);
    }
    if (profile.age) {
      parts.push(`Age: ${profile.age}`);
    }
    if (profile.weight && profile.height) {
      const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
      parts.push(`Height: ${profile.height}cm, Weight: ${profile.weight}kg (BMI: ${bmi})`);
    }
    if (profile.dietaryPreferences?.length) {
      parts.push(`Dietary Preferences: ${profile.dietaryPreferences.join(', ')}`);
    }
    if (profile.availableEquipment?.length) {
      parts.push(`Available Equipment: ${profile.availableEquipment.join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Format workout summary
   */
  private formatWorkoutSummary(workouts: UserContext['recentWorkouts']): string {
    if (!workouts || workouts.length === 0) {
      return 'No recent workout data available.';
    }

    const recent = workouts.slice(0, 10); // Last 10 workouts
    const summary = recent.map(w => {
      const date = new Date(w.date).toLocaleDateString();
      const exerciseCount = w.exercises.length;
      return `- ${date}: ${exerciseCount} exercises, ${w.duration}min, ${w.intensity} intensity${w.completed ? '' : ' (incomplete)'}`;
    }).join('\n');

    const totalWorkouts = workouts.length;
    const completionRate = (workouts.filter(w => w.completed).length / totalWorkouts * 100).toFixed(0);

    return `Total Workouts: ${totalWorkouts} (${completionRate}% completion rate)\n${summary}`;
  }

  /**
   * Format nutrition summary
   */
  private formatNutritionSummary(logs: UserContext['nutritionLogs']): string {
    if (!logs || logs.length === 0) {
      return 'No recent nutrition data available.';
    }

    const recent = logs.slice(0, 7); // Last 7 days
    const avgCalories = recent.reduce((sum, log) => sum + log.totalCalories, 0) / recent.length;
    const avgMacros = {
      protein: recent.reduce((sum, log) => sum + log.macros.protein, 0) / recent.length,
      carbs: recent.reduce((sum, log) => sum + log.macros.carbs, 0) / recent.length,
      fats: recent.reduce((sum, log) => sum + log.macros.fats, 0) / recent.length,
    };

    return `Days Logged: ${logs.length}
Average Daily Calories: ${avgCalories.toFixed(0)}
Average Macros: ${avgMacros.protein.toFixed(0)}g protein, ${avgMacros.carbs.toFixed(0)}g carbs, ${avgMacros.fats.toFixed(0)}g fats`;
  }

  /**
   * Format progress summary
   */
  private formatProgressSummary(metrics: UserContext['progressMetrics']): string {
    if (!metrics || metrics.length < 2) {
      return 'Insufficient progress data for analysis (need at least 2 data points).';
    }

    const sorted = [...metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const weightChange = last.weight - first.weight;
    const daysBetween = Math.floor((new Date(last.date).getTime() - new Date(first.date).getTime()) / (1000 * 60 * 60 * 24));

    return `Tracking Period: ${daysBetween} days
Starting Weight: ${first.weight}kg
Current Weight: ${last.weight}kg
Change: ${weightChange > 0 ? '+' : ''}${weightChange.toFixed(1)}kg
Data Points: ${metrics.length}`;
  }

  /**
   * Format recent activity summary
   */
  private formatRecentActivity(context: UserContext): string {
    const parts = [];

    if (context.recentWorkouts && context.recentWorkouts.length > 0) {
      const lastWorkout = context.recentWorkouts[0];
      parts.push(`Last Workout: ${new Date(lastWorkout.date).toLocaleDateString()} (${lastWorkout.intensity} intensity)`);
    }

    if (context.progressMetrics && context.progressMetrics.length > 0) {
      const latest = context.progressMetrics[context.progressMetrics.length - 1];
      parts.push(`Current Weight: ${latest.weight}kg`);
    }

    return parts.length > 0 ? parts.join('\n') : 'No recent activity data.';
  }

  /**
   * Calculate workout frequency metrics
   */
  private calculateWorkoutFrequency(workouts: UserContext['recentWorkouts']): {
    workoutsPerWeek: number;
    highIntensityDays: number;
    consecutiveDays: number;
  } {
    if (!workouts || workouts.length === 0) {
      return { workoutsPerWeek: 0, highIntensityDays: 0, consecutiveDays: 0 };
    }

    const recent = workouts.slice(0, 14); // Last 2 weeks
    const workoutsPerWeek = (recent.length / 2);
    const highIntensityDays = recent.filter(w => w.intensity === 'high').length;

    // Calculate consecutive days
    let maxConsecutive = 0;
    let currentConsecutive = 0;
    const sorted = [...recent].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const dayDiff = Math.floor((new Date(sorted[i].date).getTime() - new Date(sorted[i + 1].date).getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 0;
      }
    }

    return {
      workoutsPerWeek: Math.round(workoutsPerWeek),
      highIntensityDays,
      consecutiveDays: maxConsecutive + 1,
    };
  }

  /**
   * Truncate prompt to stay within token limits
   */
  private truncatePrompt(prompt: string): string {
    if (prompt.length <= this.MAX_PROMPT_LENGTH) {
      return prompt;
    }

    console.warn(`Prompt truncated from ${prompt.length} to ${this.MAX_PROMPT_LENGTH} characters`);
    return prompt.substring(0, this.MAX_PROMPT_LENGTH) + '\n\n[Content truncated to fit token limit]';
  }
}

// Singleton instance
export const promptBuilder = new PromptBuilder();
