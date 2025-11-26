import { AIProvider, CompletionOptions } from '../AIProviderTypes';
import { IAIProviderConfig } from '../../models/AIProviderConfig';

export class OpenAIProvider implements AIProvider {
  name: string;
  config: IAIProviderConfig;
  private client: any;

  constructor(config: IAIProviderConfig) {
    this.name = config.name;
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Dynamically import OpenAI SDK
      const { default: OpenAI } = await import('openai');
      this.client = new OpenAI({
        apiKey: this.config.apiKey || process.env.OPENAI_API_KEY,
      });
    } catch (error) {
      console.error('Error initializing OpenAI provider:', error);
      throw error;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      if (!this.client) {
        await this.initialize();
      }

      // Check if we're within rate limits
      const remainingQuota = await this.getRemainingQuota();
      return remainingQuota > 0;
    } catch (error) {
      console.error('OpenAI availability check failed:', error);
      return false;
    }
  }

  async getRemainingQuota(): Promise<number> {
    const { requestsThisMinute, tokensToday } = this.config.currentUsage;
    const { requestsPerMinute, tokensPerDay } = this.config.rateLimit;

    // Return the minimum remaining quota
    const remainingRequests = requestsPerMinute - requestsThisMinute;
    const remainingTokens = tokensPerDay - tokensToday;

    return Math.min(remainingRequests, remainingTokens);
  }

  async generateCompletion(prompt: string, options?: CompletionOptions): Promise<string> {
    try {
      if (!this.client) {
        await this.initialize();
      }

      const messages: any[] = [];
      
      if (options?.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt,
        });
      }

      messages.push({
        role: 'user',
        content: prompt,
      });

      const response = await this.client.chat.completions.create({
        model: this.config.modelName || 'gpt-3.5-turbo',
        messages,
        max_tokens: options?.maxTokens || 1000,
        temperature: options?.temperature || 0.7,
        timeout: 5000, // 5 second timeout
      });

      return response.choices[0]?.message?.content || '';
    } catch (error: any) {
      console.error('OpenAI completion error:', error);
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}
