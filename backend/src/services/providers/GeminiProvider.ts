import { AIProvider, CompletionOptions } from '../AIProviderTypes';
import { IAIProviderConfig } from '../../models/AIProviderConfig';

export class GeminiProvider implements AIProvider {
  name: string;
  config: IAIProviderConfig;
  private client: any;

  constructor(config: IAIProviderConfig) {
    this.name = config.name;
    this.config = config;
  }

  async initialize(): Promise<void> {
    try {
      // Dynamically import Google Generative AI SDK
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const apiKey = this.config.apiKey || process.env.GEMINI_API_KEY || '';
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }
      this.client = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error('Error initializing Gemini provider:', error);
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
      console.error('Gemini availability check failed:', error);
      return false;
    }
  }

  async getRemainingQuota(): Promise<number> {
    const { requestsThisMinute, tokensToday } = this.config.currentUsage;
    const { requestsPerMinute, tokensPerDay } = this.config.rateLimit;

    const remainingRequests = requestsPerMinute - requestsThisMinute;
    const remainingTokens = tokensPerDay - tokensToday;

    return Math.min(remainingRequests, remainingTokens);
  }

  async generateCompletion(prompt: string, options?: CompletionOptions): Promise<string> {
    try {
      if (!this.client) {
        await this.initialize();
      }

      // Use gemini-2.5-flash (latest stable model)
      const modelName = this.config.modelName || 'gemini-2.5-flash';
      const model = this.client.getGenerativeModel({ 
        model: modelName
      });

      // Combine system prompt and user prompt
      let fullPrompt = prompt;
      if (options?.systemPrompt) {
        fullPrompt = `${options.systemPrompt}\n\n${prompt}`;
      }

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini completion error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}
