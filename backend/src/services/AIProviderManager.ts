import AIProviderConfig, { IAIProviderConfig } from '../models/AIProviderConfig';
import { cacheManager } from './CacheManager';
import { AIProvider, CompletionOptions } from './AIProviderTypes';

// Re-export for backward compatibility
export { AIProvider, CompletionOptions };

class AIProviderManager {
  private providers: Map<string, AIProvider> = new Map();
  private currentProvider: AIProvider | null = null;

  /**
   * Initialize provider manager with configurations from database
   */
  async initialize(): Promise<void> {
    try {
      const configs = await AIProviderConfig.find({ enabled: true }).sort({ priority: 1 });
      
      if (configs.length === 0) {
        console.warn('No AI providers configured. Please add provider configurations.');
        return;
      }

      for (const config of configs) {
        const provider = await this.createProvider(config);
        if (provider) {
          this.providers.set(config.name, provider);
        }
      }

      console.log(`Initialized ${this.providers.size} AI providers`);
    } catch (error) {
      console.error('Error initializing AI providers:', error);
      throw error;
    }
  }

  /**
   * Create a provider instance based on configuration
   */
  private async createProvider(config: IAIProviderConfig): Promise<AIProvider | null> {
    try {
      switch (config.name) {
        case 'openai':
          const { OpenAIProvider } = await import('./providers/OpenAIProvider');
          return new OpenAIProvider(config);
        case 'gemini':
          const { GeminiProvider } = await import('./providers/GeminiProvider');
          return new GeminiProvider(config);
        case 'huggingface':
          const { HuggingFaceProvider } = await import('./providers/HuggingFaceProvider');
          return new HuggingFaceProvider(config);
        default:
          console.warn(`Unknown provider type: ${config.name}`);
          return null;
      }
    } catch (error) {
      console.error(`Error creating provider ${config.name}:`, error);
      return null;
    }
  }

  /**
   * Select the best available provider based on priority and availability
   */
  async selectProvider(): Promise<AIProvider> {
    // Reset usage counters if needed
    await this.resetUsageCounters();

    // Try providers in priority order
    const sortedProviders = Array.from(this.providers.values()).sort(
      (a, b) => a.config.priority - b.config.priority
    );

    for (const provider of sortedProviders) {
      const isAvailable = await provider.isAvailable();
      const remainingQuota = await provider.getRemainingQuota();

      if (isAvailable && remainingQuota > 0) {
        this.currentProvider = provider;
        return provider;
      }
    }

    throw new Error('No AI providers available. All providers have reached their limits or are unavailable.');
  }

  /**
   * Execute AI completion with automatic fallback to alternative providers
   * Includes caching to reduce API calls
   */
  async executeWithFallback(
    prompt: string, 
    options?: CompletionOptions,
    userId?: string,
    analysisType?: string
  ): Promise<string> {
    // Try to get from cache first
    if (userId && analysisType) {
      const dataHash = cacheManager.hashData({ prompt, options });
      const cacheKey = cacheManager.generateKey(userId, analysisType, dataHash);
      
      const cachedResponse = await cacheManager.get(cacheKey);
      if (cachedResponse) {
        console.log('Returning cached AI response');
        return cachedResponse;
      }
    }

    const maxRetries = this.providers.size;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const provider = await this.selectProvider();
        console.log(`Using AI provider: ${provider.name} (attempt ${attempt + 1}/${maxRetries})`);

        const response = await provider.generateCompletion(prompt, options);
        
        // Track usage
        await this.trackUsage(provider.name, this.estimateTokens(prompt + response));
        
        // Cache the response
        if (userId && analysisType) {
          const dataHash = cacheManager.hashData({ prompt, options });
          const cacheKey = cacheManager.generateKey(userId, analysisType, dataHash);
          await cacheManager.set(cacheKey, response, 86400); // 24 hours
        }
        
        return response;
      } catch (error: any) {
        console.error(`Provider failed (attempt ${attempt + 1}):`, error.message);
        lastError = error;

        // Mark current provider as temporarily unavailable
        if (this.currentProvider) {
          this.providers.delete(this.currentProvider.name);
        }

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries - 1) {
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Track usage for a provider
   */
  async trackUsage(providerName: string, tokens: number): Promise<void> {
    try {
      const config = await AIProviderConfig.findOne({ name: providerName });
      if (!config) return;

      config.currentUsage.requestsThisMinute += 1;
      config.currentUsage.tokensToday += tokens;
      await config.save();
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }

  /**
   * Reset usage counters based on time windows
   */
  private async resetUsageCounters(): Promise<void> {
    try {
      const now = new Date();
      const configs = await AIProviderConfig.find({ enabled: true });

      for (const config of configs) {
        let needsUpdate = false;

        // Reset per-minute counter
        const minutesSinceReset = (now.getTime() - config.currentUsage.lastReset.getTime()) / 60000;
        if (minutesSinceReset >= 1) {
          config.currentUsage.requestsThisMinute = 0;
          needsUpdate = true;
        }

        // Reset daily counter
        const lastResetDate = new Date(config.currentUsage.lastReset);
        if (now.getDate() !== lastResetDate.getDate() || now.getMonth() !== lastResetDate.getMonth()) {
          config.currentUsage.tokensToday = 0;
          needsUpdate = true;
        }

        if (needsUpdate) {
          config.currentUsage.lastReset = now;
          await config.save();
        }
      }
    } catch (error) {
      console.error('Error resetting usage counters:', error);
    }
  }

  /**
   * Estimate token count (rough approximation: 1 token ≈ 4 characters)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Get all available providers
   */
  getProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check health of all providers
   */
  async checkHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    
    for (const [name, provider] of this.providers) {
      try {
        health[name] = await provider.isAvailable();
      } catch (error) {
        health[name] = false;
      }
    }

    return health;
  }
}

// Singleton instance
export const aiProviderManager = new AIProviderManager();
