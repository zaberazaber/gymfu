import { aiProviderManager, CompletionOptions } from './AIProviderManager';
import { cacheManager } from './CacheManager';
import AIInteraction from '../models/AIInteraction';

export class AIService {
  /**
   * Execute AI completion with logging and caching
   */
  async generateCompletion(
    userId: string,
    analysisType: 'workout_analysis' | 'nutrition_analysis' | 'progress_analysis' | 'chat' | 'workout_plan' | 'wellness' | 'gym_insights',
    prompt: string,
    options?: CompletionOptions
  ): Promise<string> {
    const startTime = Date.now();
    let cached = false;
    let provider = 'unknown';

    try {
      // Check cache first
      const dataHash = cacheManager.hashData({ prompt, options });
      const cacheKey = cacheManager.generateKey(userId, analysisType, dataHash);
      
      const cachedResponse = await cacheManager.get(cacheKey);
      if (cachedResponse) {
        cached = true;
        provider = 'cached';
        
        // Log cached interaction
        await this.logInteraction(
          userId,
          analysisType,
          prompt,
          cachedResponse,
          provider,
          0,
          cached
        );

        return cachedResponse;
      }

      // Generate new response
      const response = await aiProviderManager.executeWithFallback(
        prompt,
        options,
        userId,
        analysisType
      );

      // Determine which provider was used
      const currentProvider = aiProviderManager['currentProvider'];
      provider = currentProvider?.name || 'unknown';

      // Estimate tokens
      const tokensUsed = this.estimateTokens(prompt + response);

      // Log interaction
      await this.logInteraction(
        userId,
        analysisType,
        prompt,
        response,
        provider,
        tokensUsed,
        cached
      );

      const duration = Date.now() - startTime;
      console.log(`AI completion generated in ${duration}ms using ${provider}`);

      return response;
    } catch (error: any) {
      console.error('AI Service error:', error);
      
      // Log error
      await this.logInteraction(
        userId,
        analysisType,
        prompt,
        `Error: ${error.message}`,
        provider,
        0,
        cached
      );

      throw error;
    }
  }

  /**
   * Log AI interaction to database
   */
  private async logInteraction(
    userId: string,
    type: string,
    prompt: string,
    response: string,
    provider: string,
    tokensUsed: number,
    cached: boolean
  ): Promise<void> {
    try {
      await AIInteraction.create({
        userId,
        type,
        prompt: this.truncateText(prompt, 1000), // Limit prompt size in logs
        response: this.truncateText(response, 2000), // Limit response size in logs
        provider,
        tokensUsed,
        cached,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error logging AI interaction:', error);
      // Don't throw - logging failure shouldn't break the main flow
    }
  }

  /**
   * Get user's AI interaction history
   */
  async getUserHistory(
    userId: string,
    type?: string,
    limit: number = 50
  ): Promise<any[]> {
    try {
      const query: any = { userId };
      if (type) {
        query.type = type;
      }

      const interactions = await AIInteraction
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .select('-prompt -response') // Exclude large text fields
        .lean();

      return interactions;
    } catch (error) {
      console.error('Error getting user history:', error);
      return [];
    }
  }

  /**
   * Get AI usage statistics
   */
  async getUsageStats(userId?: string): Promise<{
    totalInteractions: number;
    cachedInteractions: number;
    cacheHitRate: number;
    totalTokens: number;
    byType: Record<string, number>;
    byProvider: Record<string, number>;
  }> {
    try {
      const query: any = userId ? { userId } : {};

      const interactions = await AIInteraction.find(query);

      const stats = {
        totalInteractions: interactions.length,
        cachedInteractions: interactions.filter(i => i.cached).length,
        cacheHitRate: 0,
        totalTokens: interactions.reduce((sum, i) => sum + i.tokensUsed, 0),
        byType: {} as Record<string, number>,
        byProvider: {} as Record<string, number>,
      };

      // Calculate cache hit rate
      if (stats.totalInteractions > 0) {
        stats.cacheHitRate = (stats.cachedInteractions / stats.totalInteractions) * 100;
      }

      // Count by type
      interactions.forEach(i => {
        stats.byType[i.type] = (stats.byType[i.type] || 0) + 1;
        stats.byProvider[i.provider] = (stats.byProvider[i.provider] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        totalInteractions: 0,
        cachedInteractions: 0,
        cacheHitRate: 0,
        totalTokens: 0,
        byType: {},
        byProvider: {},
      };
    }
  }

  /**
   * Clear user's AI cache
   */
  async clearUserCache(userId: string): Promise<void> {
    await cacheManager.deleteUserCache(userId);
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Truncate text to specified length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
}

// Singleton instance
export const aiService = new AIService();
